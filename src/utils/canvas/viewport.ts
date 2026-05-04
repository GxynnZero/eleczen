// =============================================================
// viewport.js — Viewport state helpers
// =============================================================

import { VIEWBOX } from './geometry';

/**
 * @param {{
 *   es: import('../simulation/settings').EditorSystem,
 * }} deps
 */
export const createViewportHelpers = ({ es }) => ({
  /** Current viewport signal value */
  viewport: () => es.viewport(),

  /** Settings signal value */
  settings: () => es.settings(),

  /** Zoom the viewport around a screen-space anchor point */
  zoomAt: (svgEl, event, factor) => {
    const rect   = svgEl.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const view   = es.viewport();
    const worldX = (mouseX / rect.width)  * VIEWBOX.width;
    const worldY = (mouseY / rect.height) * VIEWBOX.height;

    const wx = (worldX - view.position.x) / view.zoom;
    const wy = (worldY - view.position.y) / view.zoom;

    const newZoom = view.zoom * factor;
    const newX    = worldX - wx * newZoom;
    const newY    = worldY - wy * newZoom;

    es.setZoom(newZoom);
    es.panViewport(newX - view.position.x, newY - view.position.y);
  },

  panViewport:  (dx, dy) => es.panViewport(dx, dy),
  setZoom:      (z)      => es.setZoom(z),
  resetView:    ()       => es.resetView(),
  VIEWBOX,
});
