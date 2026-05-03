import { createSignal } from 'solid-js';
import { buildAbortedResult, buildResult } from './helper.js';
import { simulateCircuit } from '../../lib/simulation/engine.js';

class SimulationManager {
  constructor(componentManager, wireManager, deps = {}) {
    this.cm = componentManager;
    this.wm = wireManager;

    // 🔹 injected deps (IMPORTANT)
    this.settings = deps.settings;
    this.pushLog = deps.pushLog;
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
    if (!this.simulationRunning()) return;

    this.currentSimulationAbort?.abort();
    this.currentSimulationAbort = null;

    this.setSimulationRunning(false);

    this.setSimulation((current) => ({
      ...current,
      engine: { ...current.engine, status: 'stopped' },
      message: 'Simulation stopped by user.',
    }));

    this.pushLog?.('Simulation stopped by user.', 'warn');
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

    try {
      const { runEeCircuitSimulation } = await import('../../lib/simulation/eecircuitEngine.js');
      const raw = await runEeCircuitSimulation(local.netlist, analysis);

      if (signal.aborted) {
        const res = buildAbortedResult(local, analysis, probes);
        this.setSimulation(res);
        return res;
      }

      const res = buildResult(local, {
        analysis,
        probes,
        engine: { mode: 'eecircuit', status: 'ready', raw },
        message: `${local.message} eecircuit-engine completed.`,
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
          mode: 'eecircuit',
          status: 'failed',
          raw: String(error?.message || error),
        },
        message: `${local.message} eecircuit-engine failed; local graph kept active.`,
      });

      this.setSimulation(res);
      return res;
    }
  }

  applyLocalSimulation(extra = {}) {
    const result = simulateCircuit(
      this.cm.components(),
      this.wm.wires(),
      this.analysisMode()
    );

    const merged = {
      ...result,
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