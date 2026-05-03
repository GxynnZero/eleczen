// =============================================================
// canvasCtx.jsx — SolidJS Context that holds the CanvasContext
//
// Usage:
//   <CanvasProvider cm={cm} wm={wm} es={es} sm={sm}>
//     <Canvas />
//   </CanvasProvider>
//
// Inside Canvas (or any child):
//   const ctx = useContext(CanvasCtx);
// =============================================================

import { createContext, useContext } from 'solid-js';
import { createCanvasContext }       from './context.js';

export const CanvasCtx = createContext(null);

/**
 * Provide the assembled CanvasContext to all children.
 *
 * @param {{
 *   cm:       import('../simulation/component.js').ComponentManager,
 *   wm:       import('../simulation/wire.js').WireManager,
 *   es:       import('../simulation/settings.js').EditorSystem,
 *   sm:       import('../simulation/simulation.js').SimulationManager,
 *   children: any,
 * }} props
 */
export function CanvasProvider(props) {
  // Build context once per mount — stable reference, managers are singletons
  const ctx = createCanvasContext({
    cm: props.cm,
    wm: props.wm,
    es: props.es,
    sm: props.sm,
  });

  // Attach raw manager refs so Canvas can read wireEditTarget signal
  // without re-coupling helpers to it.
  ctx.wm = props.wm;

  return (
    <CanvasCtx.Provider value={ctx}>
      {props.children}
    </CanvasCtx.Provider>
  );
}

/** Convenience hook */
export const useCanvas = () => useContext(CanvasCtx);
