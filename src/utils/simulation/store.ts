// =============================================================
// store.js — Singleton editor store
//
// Creates and wires all managers exactly once.
// Exports flat reactive functions for components that don't
// need direct manager access (toolbar, console, properties…)
//
// For Canvas, use CanvasProvider which gets managers from here.
// =============================================================

import { PARTS, portPoint, routeWire, pointsToPath, simulateCircuit } from '../../lib/simulation/engine';
import { ComponentManager }  from './component';
import { WireManager }       from './wire';
import { EditorSystem }      from './settings';
import { SimulationManager } from './simulation';
import { clone }             from './helper';

// ─── Bootstrap ───────────────────────────────────────────────
// ready() builds a result object that represents "ready, not yet run"
function ready(message = 'Ready') {
  return {
    ok:       false,
    message,
    states:   {},
    stats:    { current: 0, voltage: 0, resistance: 0 },
    netlist:  '',
    nodeMap:  new Map(),
    graph:    { nodes: [], edges: [], adjacency: [] },
    analysis: 'dc',
    probes:   [],
    engine:   { mode: 'local', status: 'ready', raw: null },
  };
}

// ─── Instantiate managers ─────────────────────────────────────
// Forward refs to break circular deps between managers
let _es, _sm;

export const cm = new ComponentManager({
  settings: () => _es.settings(),
  remember: () => _es?.remember(),
  markChanged: (msg) => _es?._markChanged(msg),
});

export const wm = new WireManager(
  // selection shared ref
  cm,
  {
    remember:    () => _es?.remember(),
    pushLog:     (t, l) => _es?.pushLog(t, l),
    markChanged: (msg) => _es?._markChanged(msg),
    deleteItem:  (t, id) => _es?.deleteItem(t, id),
  }
);

export const es = new EditorSystem(cm, wm, {
  applySimulation: (sig) => _sm?.applySimulation(sig),
  setSimulation:   (v)   => _sm?.setSimulation(v),
  ready,
});

export const sm = new SimulationManager(cm, wm, {
  pushLog:   (t, l) => es.pushLog(t, l),
  setOption: (k, v) => es.setOption(k, v),
  settings:  () => es.settings(),
  ready,
});

// resolve forward references
_es = es;
_sm = sm;

// ─── Expose PARTS + engine utilities ─────────────────────────
export { PARTS, portPoint, routeWire, pointsToPath, simulateCircuit };

// ─── Flat reactive signal accessors ──────────────────────────
// These are the named exports the toolbar/console/properties use.
// They return *signal values*, i.e. are called as functions.

export const components        = () => cm.components();
export const wires             = () => wm.wires();
export const settings          = () => es.settings();
export const viewport          = () => es.viewport();
export const logs              = () => es.logs();
export const history           = () => es.history();
export const future            = () => es.future();
export const simulation        = () => sm.simulation();
export const simulationRunning = () => sm.simulationRunning();
export const analysisMode      = () => sm.analysisMode();
export const probeVariables    = () => sm.probeVariables();
export const pendingPort       = () => wm.pendingPort();
export const wireEditTarget    = () => wm.wireEditTarget();
export const selection         = () => cm.selection();

// ─── Selected entity helpers ─────────────────────────────────
export const selectedComponent = () => cm.selectedComponent();
export const selectedWire      = () => wm.selectedWire();

// ─── Flat action dispatchers ─────────────────────────────────
// component
export const selectComponent        = (id)       => cm.selectComponent(id);
export const moveComponent          = (id, x, y) => cm.moveComponent(id, x, y);
export const setComponentValue      = (id, v)    => cm.setComponentValue(id, v);
export const duplicateSelected      = ()         => cm.duplicateSelected();
export const updateSelectedPosition = (patch)    => cm.updateSelectedPosition(patch);
export const addComponent           = (type)     => cm.addComponent(type);

// wire
export const selectWire             = (id)       => wm.selectWire(id);
export const connectTerminals       = (f, t, a)  => wm.connectTerminals(f, t, a);
export const connectPort            = (cid, pid) => wm.connectPort(cid, pid);
export const updateAnchor           = (wid, i, x, y) => wm.updateAnchor(wid, i, x, y);
export const beginWireEdit          = (wid, ep)  => wm.beginWireEdit(wid, ep);
export const finishWireEdit         = (cid, pid) => wm.finishWireEdit(cid, pid);
export const cancelWireEdit         = ()         => wm.cancelWireEdit();
export const tryStartWireEditFromTerminal = (cid, pid) =>
  wm.tryStartWireEditFromTerminal(cid, pid);
export const clearSelection         = ()         => wm.clearSelection();
export const deleteSelected         = ()         => wm.deleteSelected();

// editor system
export const deleteItem             = (t, id)    => es.deleteItem(t, id);
export const remember               = ()         => es.remember();
export const undo                   = ()         => es.undo();
export const redo                   = ()         => es.redo();
export const rotateSelected         = ()         => es.rotateSelected();
export const mirrorSelected         = ()         => es.mirrorSelected();
export const clearAll               = ()         => es.clearAll();
export const setOption              = (k, v)     => es.setOption(k, v);
export const toggleConsoleMaximized = ()         => es.toggleConsoleMaximized();
export const serializeProject       = ()         => es.serializeProject();
export const loadProject            = (data)     => es.loadProject(data);
export const saveProject            = ()         => es.saveProject();
export const loadSavedProject       = ()         => es.loadSavedProject();
export const panViewport            = (dx, dy)   => es.panViewport(dx, dy);
export const setZoom                = (z)        => es.setZoom(z);
export const zoomBy                 = (d)        => es.zoomBy(d);
export const resetView              = ()         => es.resetView();
export const pushLog                = (t, l)     => es.pushLog(t, l);

// simulation
export const runSimulation          = ()         => sm.runSimulation();
export const stopSimulation         = ()         => sm.stopSimulation();
export const applySimulation        = (sig)      => sm.applySimulation(sig);
export const applyLocalSimulation   = ()         => sm.applyLocalSimulation();
export const setAnalysisMode        = (m)        => sm.setAnalysisMode(m);
export const toggleProbeVariable    = (name)     => sm.toggleProbeVariable(name);

// ─── Demo loader ─────────────────────────────────────────────
export function loadDemo() {
  es.remember();
  cm.setComponents(cm.demoComponents.map(cm.withState));
  wm.setWires(wm.demoWires);
  wm.clearSelection();
  wm.setPendingPort(null);
  es.pushLog('Demo circuit loaded', 'info');
}
