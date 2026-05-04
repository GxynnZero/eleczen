// =============================================================
// canvas/index.js — Compose all canvas helpers into one API
//
// Usage:
//   import { createCanvasHelpers } from '~/utils/canvas';
//   const api = createCanvasHelpers({ cm, wm, es, sm, PARTS, portPoint });
// =============================================================

import { createGeometryHelpers, formatValue, VIEWBOX } from './geometry';
import { createTerminalHelpers }                        from './terminals';
import { createSelectionHelpers }                       from './selection';
import { createSimulationHelpers }                      from './simulation';
import { createViewportHelpers }                        from './viewport';
import { ComponentManager } from '../simulation/component';
import { WireManager } from '../simulation/wire';
import { EditorSystem } from '../simulation/settings';
import { SimulationManager } from '../simulation/simulation';

/**
 * Build the complete canvas helper API.
 */
export function createCanvasHelpers({ cm, wm, es, sm, PARTS, portPoint }: {
  cm: ComponentManager;
  wm: WireManager;
  es: EditorSystem;
  sm: SimulationManager;
  PARTS: any;
  portPoint: (component: any, portId: string) => { x: number, y: number };
}) {
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
export { createGeometryHelpers }  from './geometry';
export { createTerminalHelpers }  from './terminals';
export { createSelectionHelpers } from './selection';
export { createSimulationHelpers} from './simulation';
export { createViewportHelpers }  from './viewport';
export { formatValue, VIEWBOX }   from './geometry';
