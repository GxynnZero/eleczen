import { createSignal } from 'solid-js';
import { PARTS, partValue, pointsToPath, portPoint, routeWire, simulateCircuit } from '../simulation/engine.js';

export { PARTS, partValue, pointsToPath, portPoint, routeWire };

const blankState = () => ({ active: false, brightness: 0, voltage: 0, current: 0, power: 0 });
const emptyGraph = { nodes: [], edges: [], adjacency: [] };
const ready = (message = 'Ready') => ({
  ok: false,
  message,
  stats: { current: 0, voltage: 0, resistance: 0 },
  graph: emptyGraph,
  analysis: 'dc',
  probes: [],
  engine: { mode: 'local', status: 'idle', raw: null },
  netlist: '',
});

const demoComponents = [
  { id: 'battery_1', type: 'battery', x: 220, y: 350, rotation: 0, properties: { voltage: 9 } },
  { id: 'resistor_2', type: 'resistor', x: 220, y: 170, rotation: 0, properties: { resistance: 1000 } },
  { id: 'led_3', type: 'led', x: 520, y: 170, rotation: 0, properties: { forwardVoltage: 2 } },
];

const demoWires = [
  { id: 'wire_1', from: { componentId: 'battery_1', portId: 'pos' }, to: { componentId: 'resistor_2', portId: 'a' } },
  { id: 'wire_2', from: { componentId: 'resistor_2', portId: 'b' }, to: { componentId: 'led_3', portId: 'anode' } },
  { id: 'wire_3', from: { componentId: 'led_3', portId: 'cathode' }, to: { componentId: 'battery_1', portId: 'neg' } },
];

let nextComponent = 4;
let nextWire = 4;

const withState = (component) => ({ ...component, state: blankState() });
const [components, setComponents] = createSignal(demoComponents.map(withState));
const [wires, setWires] = createSignal(demoWires);
const [selection, setSelection] = createSignal({ type: 'component', id: 'battery_1' });
const [pendingPort, setPendingPort] = createSignal(null);
const [wireEditTarget, setWireEditTarget] = createSignal(null);
const [analysisMode, setAnalysisMode] = createSignal('dc');
const [probeVariables, setProbeVariables] = createSignal([]);
const [simulationRunning, setSimulationRunning] = createSignal(false);
let currentSimulationAbort = null;
const [simulation, setSimulation] = createSignal(ready('Demo circuit loaded'));
const [history, setHistory] = createSignal([]);
const [future, setFuture] = createSignal([]);
const [viewport, setViewport] = createSignal({ x: 0, y: 0, zoom: 1 });
const [settings, setSettings] = createSignal({
  autoRun: false,
  console: true,
  engine: 'eecircuit',
  grid: true,
  routing: 'smart',
  showLabels: true,
  snap: true,
  snapSize: 12,
  tool: 'select',
});
const [logs, setLogs] = createSignal([{ level: 'info', text: 'Demo circuit loaded' }]);

function pushLog(text, level = 'info') {
  setLogs((items) => [{ level, text }, ...items].slice(0, 18));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function remember() {
  setHistory((items) => [...items.slice(-39), { components: clone(components()), wires: clone(wires()) }]);
  setFuture([]);
}

function applyLocalSimulation(extra = {}) {
  const result = simulateCircuit(components(), wires(), analysisMode());
  const merged = {
    ...result,
    analysis: analysisMode(),
    probes: probeVariables(),
    engine: { mode: 'local', status: 'ready', raw: null },
    ...extra,
  };
  setComponents((items) => items.map((item) => ({ ...item, state: result.states[item.id] || blankState() })));
  setSimulation(merged);
  return merged;
}

async function applySimulation(signal = { aborted: false }) {
  const local = applyLocalSimulation({
    engine: { mode: 'local', status: 'running', raw: null },
    message: 'Running simulation...',
  });

  if (signal.aborted) {
    const abortedResult = {
      ...local,
      analysis: analysisMode(),
      probes: probeVariables(),
      engine: {
        ...local.engine,
        status: 'stopped',
        raw: null,
      },
      message: `${local.message} canceled.`,
    };
    setSimulation(abortedResult);
    return abortedResult;
  }

  if (settings().engine === 'local') {
    const result = {
      ...local,
      analysis: analysisMode(),
      probes: probeVariables(),
      engine: {
        mode: 'local',
        status: 'ready',
        raw: null,
      },
      message: `${local.message} local simulation completed.`,
    };
    setSimulation(result);
    return result;
  }

  try {
    const { runEeCircuitSimulation } = await import('../simulation/eecircuitEngine.js');
    const raw = await runEeCircuitSimulation(local.netlist, analysisMode());

    if (signal.aborted) {
      const abortedResult = {
        ...local,
        analysis: analysisMode(),
        probes: probeVariables(),
        engine: {
          ...local.engine,
          status: 'stopped',
          raw: null,
        },
        message: `${local.message} canceled.`,
      };
      setSimulation(abortedResult);
      return abortedResult;
    }

    const result = {
      ...local,
      analysis: analysisMode(),
      probes: probeVariables(),
      engine: {
        mode: 'eecircuit',
        status: 'ready',
        raw,
      },
      message: `${local.message} eecircuit-engine completed.`,
    };
    setSimulation(result);
    return result;
  } catch (error) {
    if (signal.aborted) {
      const abortedResult = {
        ...local,
        analysis: analysisMode(),
        probes: probeVariables(),
        engine: {
          ...local.engine,
          status: 'stopped',
          raw: null,
        },
        message: `${local.message} canceled.`,
      };
      setSimulation(abortedResult);
      return abortedResult;
    }

    const result = {
      ...local,
      analysis: analysisMode(),
      probes: probeVariables(),
      engine: {
        mode: 'eecircuit',
        status: 'failed',
        raw: String(error?.message || error),
      },
      message: `${local.message} eecircuit-engine failed; local graph kept active.`,
    };
    setSimulation(result);
    return result;
  }
}

function markChanged(message = 'Circuit changed') {
  pushLog(message);
  if (settings().autoRun) {
    applySimulation().then((result) => pushLog(result.message, result.ok ? 'success' : 'warn'));
  } else {
    setSimulation(ready(message));
    setComponents((items) => items.map((item) => ({ ...item, state: blankState() })));
  }
}

function componentById(id) {
  return components().find((component) => component.id === id);
}

function sameTerminal(a, b) {
  return a?.componentId === b?.componentId && a?.portId === b?.portId;
}

function sameWire(wire, from, to) {
  return (sameTerminal(wire.from, from) && sameTerminal(wire.to, to)) || (sameTerminal(wire.from, to) && sameTerminal(wire.to, from));
}

export function selectedComponent() {
  const item = selection();
  return item.type === 'component' ? componentById(item.id) : null;
}

export function selectedWire() {
  const item = selection();
  return item.type === 'wire' ? wires().find((wire) => wire.id === item.id) : null;
}

export function selectComponent(id) {
  setSelection({ type: 'component', id });
}

export function selectWire(id) {
  setSelection({ type: 'wire', id });
}

export function beginWireEdit(wireId, endpoint) {
  const wire = wires().find((item) => item.id === wireId);
  if (!wire) return;
  remember();
  setSelection({ type: 'wire', id: wireId });
  setWireEditTarget({ wireId, endpoint });
  pushLog(`Editing ${wireId} ${endpoint}`);
}

export function cancelWireEdit() {
  setWireEditTarget(null);
}

export function finishWireEdit(componentId, portId) {
  const edit = wireEditTarget();
  const selected = selection();
  const targetWireId = edit?.wireId || (selected?.type === 'wire' ? selected.id : null);
  if (!targetWireId) return false;

  const wire = wires().find((item) => item.id === targetWireId);
  if (!wire) return false;

  const endpoint = edit?.endpoint || 'to';
  const newTerminal = { componentId, portId };
  const currentOther = endpoint === 'from' ? wire.to : wire.from;

  if (sameTerminal(currentOther, newTerminal) || sameTerminal(wire.from, wire.to) || currentOther.componentId === newTerminal.componentId) {
    setWireEditTarget(null);
    pushLog('Wire edit cancelled: invalid terminal', 'warn');
    return false;
  }

  if (wires().some((item) => item.id !== wire.id && sameWire(item, endpoint === 'from' ? newTerminal : wire.from, endpoint === 'from' ? wire.to : newTerminal))) {
    setWireEditTarget(null);
    pushLog('Wire edit cancelled: duplicate connection', 'warn');
    return false;
  }

  remember();
  setWires((items) =>
    items.map((item) =>
      item.id === wire.id
        ? { ...item, [endpoint]: newTerminal }
        : item,
    ),
  );

  setWireEditTarget(null);
  markChanged('Wire endpoint updated');
  return true;
}

export function clearSelection() {
  setSelection({ type: null, id: null });
}

export function setOption(name, value) {
  setSettings((current) => ({ ...current, [name]: value }));
  pushLog(`${name} set to ${value}`);

  if (name === 'autoRun' && value) {
    applySimulation().then((result) => pushLog(result.message, result.ok ? 'success' : 'warn'));
  }
}

export function toggleProbeVariable(name) {
  setProbeVariables((current) =>
    current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
  );
}

export function undo() {
  const stack = history();
  const previous = stack.at(-1);
  if (!previous) return;

  setFuture((items) => [...items, { components: clone(components()), wires: clone(wires()) }]);
  setHistory((items) => items.slice(0, -1));
  setComponents(previous.components.map(withState));
  setWires(previous.wires);
  clearSelection();
  setPendingPort(null);
  markChanged('Undo');
}

export function redo() {
  const stack = future();
  const next = stack.at(-1);
  if (!next) return;

  setHistory((items) => [...items, { components: clone(components()), wires: clone(wires()) }]);
  setFuture((items) => items.slice(0, -1));
  setComponents(next.components.map(withState));
  setWires(next.wires);
  clearSelection();
  setPendingPort(null);
  markChanged('Redo');
}

export function deleteItem(type, id) {
  if (!type || !id) return;

  remember();

  if (type === 'wire') {
    setWires((list) => list.filter((wire) => wire.id !== id));
  }

  if (type === 'component') {
    setComponents((list) => list.filter((component) => component.id !== id));
    setWires((list) => list.filter((wire) => wire.from.componentId !== id && wire.to.componentId !== id));
  }

  clearSelection();
  setPendingPort(null);
  markChanged('Selection deleted');
}

export function addComponent(type) {
  const spec = PARTS[type];
  if (!spec) return;

  remember();
  const id = `${type}_${nextComponent++}`;
  const component = withState({
    id,
    type,
    x: 360 + ((nextComponent * 37) % 160),
    y: 300 + ((nextComponent * 29) % 120),
    rotation: 0,
    properties: { [spec.valueKey]: spec.defaultValue },
  });

  setComponents((items) => [...items, component]);
  setSelection({ type: 'component', id });
  markChanged(`${spec.label} added`);
}

export function moveComponent(id, x, y) {
  const grid = settings().snapSize || 12;
  const nextX = settings().snap ? Math.round(x / grid) * grid : x;
  const nextY = settings().snap ? Math.round(y / grid) * grid : y;
  setComponents((items) => items.map((item) => (item.id === id ? { ...item, x: nextX, y: nextY } : item)));
}

export function rotateSelected() {
  const component = selectedComponent();
  if (!component) return;

  remember();
  setComponents((items) =>
    items.map((item) => (item.id === component.id ? { ...item, rotation: ((item.rotation || 0) + 90) % 360 } : item)),
  );
  markChanged('Rotated selection');
}

export function duplicateSelected() {
  const component = selectedComponent();
  if (!component) return;

  remember();
  const id = `${component.type}_${nextComponent++}`;
  const copy = withState({
    ...clone(component),
    id,
    x: component.x + 48,
    y: component.y + 48,
  });
  setComponents((items) => [...items, copy]);
  setSelection({ type: 'component', id });
  markChanged('Duplicated selection');
}

export function updateSelectedPosition(patch) {
  const component = selectedComponent();
  if (!component) return;

  remember();
  setComponents((items) => items.map((item) => (item.id === component.id ? { ...item, ...patch } : item)));
  markChanged('Position changed');
}

export function setComponentValue(id, value) {
  const component = componentById(id);
  const spec = PARTS[component?.type];
  if (!spec) return;

  remember();
  setComponents((items) =>
    items.map((item) =>
      item.id === id
        ? { ...item, properties: { ...item.properties, [spec.valueKey]: Number(value) || 0 } }
        : item,
    ),
  );
  markChanged('Value changed');
}

export function connectTerminals(from, to) {
  if (!from || !to || sameTerminal(from, to) || from.componentId === to.componentId || wires().some((wire) => sameWire(wire, from, to))) {
    setPendingPort(null);
    pushLog('Wire was not connected', 'warn');
    return false;
  }

  remember();
  setWires((items) => [...items, { id: `wire_${nextWire++}`, from, to }]);
  setPendingPort(null);
  markChanged('Wire connected');
  return true;
}

export function connectPort(componentId, portId) {
  const next = { componentId, portId };
  const current = pendingPort();

  setSelection({ type: 'component', id: componentId });

  if (!current || sameTerminal(current, next)) {
    setPendingPort(current ? null : next);
    return;
  }

  connectTerminals(current, next);
}

export function deleteSelected() {
  const item = selection();
  deleteItem(item.type, item.id);
}

export function clearAll() {
  remember();
  setComponents([]);
  setWires([]);
  clearSelection();
  setPendingPort(null);
  markChanged('Workspace cleared');
}

export function loadDemo() {
  remember();
  nextComponent = 4;
  nextWire = 4;
  setComponents(demoComponents.map(withState));
  setWires(demoWires);
  setSelection({ type: 'component', id: 'battery_1' });
  setPendingPort(null);
  setSimulation(ready('Demo circuit loaded'));
  pushLog('Demo circuit loaded');
}

export function serializeProject() {
  return JSON.stringify(
    {
      version: 1,
      components: components().map(({ state, ...component }) => component),
      wires: wires(),
      settings: settings(),
    },
    null,
    2,
  );
}

export function loadProject(data) {
  const project = typeof data === 'string' ? JSON.parse(data) : data;
  const incomingComponents = Array.isArray(project.components) ? project.components : [];
  const incomingWires = Array.isArray(project.wires) ? project.wires : [];

  remember();
  setComponents(incomingComponents.map(withState));
  setWires(incomingWires);
  setSettings((current) => ({ ...current, ...(project.settings || {}) }));
  setSelection({ type: null, id: null });
  setPendingPort(null);
  markChanged('Project loaded');
}

export function saveProject() {
  localStorage.setItem('eleczen.project', serializeProject());
  pushLog('Project saved locally', 'success');
}

export function loadSavedProject() {
  const saved = localStorage.getItem('eleczen.project');
  if (!saved) {
    pushLog('No saved project found', 'warn');
    return;
  }
  loadProject(saved);
}

export function zoomBy(delta) {
  setViewport((view) => ({ ...view, zoom: Math.min(3, Math.max(0.35, Number((view.zoom + delta).toFixed(2)))) }));
}

export function setZoom(zoom) {
  setViewport((view) => ({ ...view, zoom: Math.min(3, Math.max(0.35, zoom)) }));
}

export function panViewport(dx, dy) {
  setViewport((view) => ({ ...view, x: view.x + dx, y: view.y + dy }));
}

export function resetView() {
  setViewport({ x: 0, y: 0, zoom: 1 });
}

export async function runSimulation() {
  if (simulationRunning()) return;
  setSimulationRunning(true);

  if (currentSimulationAbort) {
    currentSimulationAbort.abort();
    currentSimulationAbort = null;
  }

  currentSimulationAbort = new AbortController();
  const signal = currentSimulationAbort.signal;

  setSimulation((current) => ({
    ...current,
    engine: { ...current.engine, status: 'running' },
    message: 'Simulation running...',
  }));

  await new Promise((resolve) => setTimeout(resolve, 80));
  const result = await applySimulation(signal);

  if (!signal.aborted) {
    pushLog(result.message, result.ok ? 'success' : 'warn');
    setSimulationRunning(false);
  }

  currentSimulationAbort = null;
}

export function stopSimulation() {
  if (!simulationRunning()) return;
  if (currentSimulationAbort) {
    currentSimulationAbort.abort();
    currentSimulationAbort = null;
  }

  setSimulationRunning(false);
  setSimulation((current) => ({
    ...current,
    engine: { ...current.engine, status: 'stopped' },
    message: 'Simulation stopped by user.',
  }));
  pushLog('Simulation stopped by user.', 'warn');
}

export { components, wires, selection, pendingPort, wireEditTarget, analysisMode, setAnalysisMode, probeVariables, simulation, simulationRunning, settings, logs, history, future, viewport };
