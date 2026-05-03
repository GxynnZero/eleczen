// =============================================================
// canvas/index.js — Compose all canvas helpers into one API
//
// Usage:
//   import { createCanvasHelpers } from '~/utils/canvas';
//   const api = createCanvasHelpers({ cm, wm, es, sm, PARTS, portPoint });
// =============================================================

import { createGeometryHelpers, formatValue, VIEWBOX } from './geometry.js';
import { createTerminalHelpers }                        from './terminals.js';
import { createSelectionHelpers }                       from './selection.js';
import { createSimulationHelpers }                      from './simulation.js';
import { createViewportHelpers }                        from './viewport.js';

/**
 * Build the complete canvas helper API.
 *
 * @param {{
 *   cm:        import('../simulation/component.js').ComponentManager,
 *   wm:        import('../simulation/wire.js').WireManager,
 *   es:        import('../simulation/settings.js').EditorSystem,
 *   sm:        import('../simulation/simulation.js').SimulationManager,
 *   PARTS:     Record<string, any>,
 *   portPoint: (component: any, portId: string) => {x:number, y:number},
 * }} managers
 *
 * @returns {{
 *   state:      { components, wires, viewport, settings },
 *   geometry:   ReturnType<createGeometryHelpers>,
 *   terminals:  ReturnType<createTerminalHelpers>,
 *   selection:  ReturnType<createSelectionHelpers>,
 *   simulation: ReturnType<createSimulationHelpers>,
 *   viewport:   ReturnType<createViewportHelpers>,
 *   formatValue: typeof formatValue,
 *   VIEWBOX:    typeof VIEWBOX,
 * }}
 */
export function createCanvasHelpers({ cm, wm, es, sm, PARTS, portPoint }) {
  const geometry   = createGeometryHelpers({ es });
  const terminals  = createTerminalHelpers({ cm, PARTS, portPoint, es });
  const selection  = createSelectionHelpers({ cm, wm });
  const simulation = createSimulationHelpers({ sm });
  const viewport   = createViewportHelpers({ es });

  return {
    /** Reactive state accessors — all are functions (SolidJS signals) */
    state: {
      components: () => cm.components(),
      wires:      () => wm.wires(),
      viewport:   () => es.viewport(),
      settings:   () => es.settings(),
    },

    /** Pure coordinate math, snap, screen↔world */
    geometry,

    /** Terminal location + nearest-terminal search */
    terminals,

    /** isSelected / isPending */
    selection,

    /** getSimValue / getDeviceName */
    simulation,

    /** Viewport zoom/pan/reset helpers */
    viewport,

    // ─── conveniences ─────────────────────────────────────────
    formatValue,
    VIEWBOX,
  };
}

// Re-export individual creators for targeted use / testing
export { createGeometryHelpers }  from './geometry.js';
export { createTerminalHelpers }  from './terminals.js';
export { createSelectionHelpers } from './selection.js';
export { createSimulationHelpers} from './simulation.js';
export { createViewportHelpers }  from './viewport.js';
export { formatValue, VIEWBOX }   from './geometry.js';
