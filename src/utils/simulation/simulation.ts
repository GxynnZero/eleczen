import { createSignal, Accessor, Setter } from 'solid-js';
import { buildAbortedResult, buildResult } from './helper';
import { simulateCircuit } from '../../lib/simulation/engine';
import { Settings } from '../../types';
import { ComponentManager } from './component';
import { WireManager } from './wire';
import { buildNetlist } from '../../core/netlist';

class SimulationManager {
  cm: ComponentManager;
  wm: WireManager;
  settings: Accessor<Settings>;
  pushLog: ((msg: string, level?: string) => void) | undefined;
  setOption: ((name: string, value: any) => void) | undefined;
  ready: (msg: string) => any;
  simulationRunning: Accessor<boolean>;
  setSimulationRunning: Setter<boolean>;
  simulation: Accessor<any>;
  setSimulation: Setter<any>;
  analysisMode: Accessor<string>;
  setAnalysisMode: Setter<string>;
  probeVariables: Accessor<string[]>;
  setProbeVariables: Setter<string[]>;
  currentSimulationAbort: AbortController | null;

  constructor(componentManager: ComponentManager, wireManager: WireManager, deps = {} as any) {
    this.cm = componentManager;
    this.wm = wireManager;

    // 🔹 injected deps (IMPORTANT)
    this.settings = deps.settings;
    this.pushLog = deps.pushLog;
    this.setOption = deps.setOption;
    this.ready = deps.ready;

    const [simulationRunning, setSimulationRunning] = createSignal(false);
    const [simulation, setSimulation] = createSignal(
      this.ready('Demo circuit loaded')
    );
    const [analysisMode, setAnalysisMode] = createSignal('dc');
    const [probeVariables, setProbeVariables] = createSignal([]);

    this.simulationRunning = simulationRunning;
    this.setSimulationRunning = setSimulationRunning;

    this.simulation = simulation;
    this.setSimulation = setSimulation;

    this.analysisMode = analysisMode;
    this.setAnalysisMode = setAnalysisMode;

    this.probeVariables = probeVariables;
    this.setProbeVariables = setProbeVariables;

    this.currentSimulationAbort = null;
  }

  async runSimulation() {
    if (this.simulationRunning()) return;

    this.setSimulationRunning(true);

    if (this.currentSimulationAbort) {
      this.currentSimulationAbort.abort();
    }

    this.currentSimulationAbort = new AbortController();
    const signal = this.currentSimulationAbort.signal;

    this.setSimulation((current) => ({
      ...current,
      engine: { ...current.engine, status: 'running' },
      message: 'Simulation running...',
    }));

    await new Promise((r) => setTimeout(r, 80));

    const result = await this.applySimulation(signal);

    if (!signal.aborted) {
      this.pushLog?.(result.message, result.ok ? 'success' : 'warn');
      this.setSimulationRunning(false);
    }

    this.currentSimulationAbort = null;
  }

  stopSimulation() {
    this.currentSimulationAbort?.abort();
    this.currentSimulationAbort = null;

    this.setSimulationRunning(false);

    // Upgrade Stop: Reset all component states to blank
    this.cm.setComponents((items) =>
      items.map((item) => ({
        ...item,
        state: this.cm.blankState(),
      }))
    );

    this.setSimulation((current) => ({
      ...current,
      engine: { ...current.engine, status: 'stopped' },
      message: 'Simulation stopped.',
    }));

    this.pushLog?.('Simulation stopped.', 'warn');
  }

  async applySimulation(signal = { aborted: false }) {
    const local = this.applyLocalSimulation({
      engine: { mode: 'local', status: 'running', raw: null },
      message: 'Running simulation...',
    });

    const analysis = this.analysisMode();
    const probes = this.probeVariables();

    if (signal.aborted) {
      const res = buildAbortedResult(local, analysis, probes);
      this.setSimulation(res);
      return res;
    }

    if (this.settings().engine === 'local') {
      const res = buildResult(local, {
        analysis,
        probes,
        engine: { mode: 'local', status: 'ready', raw: null },
        message: `${local.message} local simulation completed.`,
      });

      this.setSimulation(res);
      return res;
    }

    if (!local.ok) return local;

    try {
      const { runSimulation } = await import('../../lib/simulation/eecircuitEngine');
      const raw = await runSimulation(local.netlist);

      if (signal.aborted) {
        const res = buildAbortedResult(local, analysis, probes);
        this.setSimulation(res);
        return res;
      }

      const res = buildResult(local, {
        analysis,
        probes,
        engine: { mode: 'ngspice', status: 'ready', raw },
        message: `${local.message} Ngspice simulation completed.`,
      });

      this.setSimulation(res);
      return res;

    } catch (error) {
      if (signal.aborted) {
        const res = buildAbortedResult(local, analysis, probes);
        this.setSimulation(res);
        return res;
      }

      const res = buildResult(local, {
        analysis,
        probes,
        engine: {
          mode: 'ngspice',
          status: 'failed',
          raw: String(error?.message || error),
        },
        message: `${local.message} Ngspice simulation failed; local graph kept active.`,
      });

      this.setSimulation(res);
      return res;
    }
  }

  applyLocalSimulation(extra = {}) {
    try {
      const netlistInfo = buildNetlist(this.cm.components(), this.wm.wires(), this.analysisMode() as any);
      
      const result = simulateCircuit(
        this.cm.components(),
        this.wm.wires(),
        this.analysisMode()
      );

      const merged = {
        ...result,
        netlist: netlistInfo.text,
        nodeMap: netlistInfo.nodeMap,
        analysis: this.analysisMode(),
        probes: this.probeVariables(),
        engine: { mode: 'local', status: 'ready', raw: null },
        ...extra,
      };

      this.cm.setComponents((items) =>
        items.map((item) => ({
          ...item,
          state: result.states[item.id] || this.cm.blankState(),
        }))
      );

      this.setSimulation(merged);
      return merged;

    } catch (err: any) {
      this.stopSimulation();
      this.pushLog?.(err.message, 'error');
      
      // Auto-show console on error
      this.setOption?.('console', true);
      
      const errorResult = {
        ok: false,
        message: err.message,
        states: {},
        netlist: '',
        nodeMap: new Map(),
        graph: { nodes: [], edges: [], adjacency: [] },
        engine: { mode: 'local', status: 'failed', raw: err.message },
        ...extra
      };
      this.setSimulation(errorResult);
      return errorResult;
    }
  }

  toggleProbeVariable(name) {
    const lower = name.toLowerCase();

    this.setProbeVariables((current) => {
      const existing = current.find((v) => v.toLowerCase() === lower);

      if (existing) {
        return current.filter((v) => v !== existing);
      }

      const simRaw = this.simulation()?.engine?.raw;

      const exact =
        simRaw?.variableNames?.find(
          (v) => v.toLowerCase() === lower
        ) || name;

      return [...current, exact];
    });
  }
}

export { SimulationManager };