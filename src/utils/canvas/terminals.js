// =============================================================
// terminals.js — Terminal location & proximity helpers
// =============================================================

/**
 * @param {{
 *   cm:     import('../simulation/component.js').ComponentManager,
 *   PARTS:  Record<string, any>,
 *   portPoint: (component: any, portId: string) => {x:number, y:number},
 *   es:     import('../simulation/settings.js').EditorSystem,
 * }} deps
 */
export const createTerminalHelpers = ({ cm, PARTS, portPoint, es }) => ({
  /**
   * World-space position of a terminal (component port).
   * portPoint comes from the engine and handles rotation/mirror.
   */
  terminalPoint: (terminal) => {
    const component = cm.components().find((c) => c.id === terminal.componentId);
    return component ? portPoint(component, terminal.portId) : { x: 0, y: 0 };
  },

  /**
   * Find the nearest terminal within snap radius of `point`,
   * excluding the terminal identified by `except`.
   */
  terminalNear: (point, except = null) => {
    const view   = es.viewport();
    const radius = 18 / view.zoom;
    let best     = null;

    for (const component of cm.components()) {
      for (const port of PARTS[component.type]?.ports || []) {
        if (
          except?.componentId === component.id &&
          except?.portId === port.id
        ) continue;

        const p        = portPoint(component, port.id);
        const d        = Math.hypot(point.x - p.x, point.y - p.y);

        if (d <= radius && (!best || d < best.distance)) {
          best = { componentId: component.id, portId: port.id, distance: d };
        }
      }
    }

    return best ? { componentId: best.componentId, portId: best.portId } : null;
  },
});
