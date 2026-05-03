// =============================================================
// context.js — Canvas Context Layer (Bonus upgrade)
//
// createCanvasContext(managers) assembles:
//   helpers  — the full helper API
//   actions  — all canvas-level mutation dispatchers
//   PARTS    — forwarded for JSX rendering
// =============================================================

import { createCanvasHelpers }  from './index.js';
import { portPoint, routeWire, pointsToPath } from '../../lib/simulation/engine.js';
import { PARTS }                               from '../../lib/simulation/engine.js';

/**
 * @param {{
 *   cm: import('../simulation/component.js').ComponentManager,
 *   wm: import('../simulation/wire.js').WireManager,
 *   es: import('../simulation/settings.js').EditorSystem,
 *   sm: import('../simulation/simulation.js').SimulationManager,
 * }} managers
 */
export function createCanvasContext({ cm, wm, es, sm }) {
  // ─── Helper API ─────────────────────────────────────────────
  const helpers = createCanvasHelpers({ cm, wm, es, sm, PARTS, portPoint });

  // ─── Canonical Action dispatchers ───────────────────────────
  const actions = {
    // components
    selectComponent:  (id)      => cm.selectComponent(id),
    moveComponent:    (id, x, y)=> cm.moveComponent(id, x, y),
    deleteItem:       (t, id)   => es.deleteItem(t, id),

    // wires
    selectWire:       (id)      => wm.selectWire(id),
    connectTerminals: (f, t, a) => wm.connectTerminals(f, t, a),
    connectPort:      (cid, pid)=> wm.connectPort(cid, pid),
    updateAnchor:     (wid, i, x, y) => wm.updateAnchor(wid, i, x, y),
    beginWireEdit:    (wid, ep) => wm.beginWireEdit(wid, ep),
    finishWireEdit:   (cid, pid)=> wm.finishWireEdit(cid, pid),
    tryStartWireEditFromTerminal: (cid, pid) =>
      wm.tryStartWireEditFromTerminal(cid, pid),
    cancelWireEdit:   ()        => wm.cancelWireEdit(),

    // selection
    clearSelection:   ()        => wm.clearSelection(),

    // viewport
    panViewport:      (dx, dy)  => es.panViewport(dx, dy),
    setZoom:          (z)       => es.setZoom(z),
    resetView:        ()        => es.resetView(),

    // history
    remember:         ()        => es.remember(),

    // simulation
    toggleProbeVariable: (name) => sm.toggleProbeVariable(name),
  };

  // ─── Wire path builders ─────────────────────────────────────
  const wire = {
    /**
     * Compute an SVG path string for a placed wire.
     */
    wirePath: (wireObj) => {
      const { terminalPoint } = helpers.terminals;
      const settings          = helpers.state.settings();
      const components        = helpers.state.components();

      const start  = terminalPoint(wireObj.from);
      const end    = terminalPoint(wireObj.to);
      const points = settings.routing === 'straight'
        ? [start, end]
        : routeWire(start, end, components, {
            from:    wireObj.from,
            to:      wireObj.to,
            anchors: wireObj.anchors || [],
          });

      return pointsToPath(points);
    },

    /**
     * Compute an SVG path string for the in-progress wire draft.
     */
    draftPath: (draft) => {
      if (!draft) return '';
      const settings   = helpers.state.settings();
      const components = helpers.state.components();

      const points = settings.routing === 'straight'
        ? [draft.start, draft.point]
        : routeWire(draft.start, draft.point, components, {
            from:    draft.from,
            anchors: draft.anchors || [],
          });

      return pointsToPath(points);
    },
  };

  return { helpers, actions, wire, PARTS };
}
