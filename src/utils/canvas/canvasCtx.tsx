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
import { createCanvasContext }       from './context';

export const CanvasCtx = createContext<any>(null);

/**
 * Provide the assembled CanvasContext to all children.
 *
 * @param {{
 *   cm:       import('../simulation/component').ComponentManager,
 *   wm:       import('../simulation/wire').WireManager,
 *   es:       import('../simulation/settings').EditorSystem,
 *   sm:       import('../simulation/simulation').SimulationManager,
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
  (ctx as any).wm = props.wm;

  return (
    <CanvasCtx.Provider value={ctx}>
      {props.children}
    </CanvasCtx.Provider>
  );
}

/** Convenience hook */
export const useCanvas = () => useContext(CanvasCtx);
