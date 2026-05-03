// =============================================================
// geometry.js — Pure coordinate & math helpers (no managers)
// =============================================================

export const VIEWBOX = { width: 900, height: 560 };

// ─── clamp ────────────────────────────────────────────────────
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// ─── value formatter (SI prefixes) ────────────────────────────
export const formatValue = (v, unit) => {
  if (v == null) return '--';
  const a = Math.abs(v);
  if (a >= 1)    return v.toFixed(2) + ' ' + unit;
  if (a >= 1e-3) return (v * 1e3).toFixed(2) + ' m' + unit;
  if (a >= 1e-6) return (v * 1e6).toFixed(2) + ' u' + unit;
  return v.toExponential(2) + ' ' + unit;
};

// ─── Geometry factory (injected deps) ─────────────────────────
/**
 * @param {{ es: import('../simulation/settings.js').EditorSystem }} deps
 */
export const createGeometryHelpers = ({ es }) => ({
  /** Snap a world point to the current grid */
  snap: (x, y) => {
    const s = es.settings();
    if (!s.snap) return { x, y };
    const grid = s.snapSize || 12;
    return { x: Math.round(x / grid) * grid, y: Math.round(y / grid) * grid };
  },

  clamp,

  /** Convert a DOM pointer event → SVG screen coords */
  screenPointFromEvent: (event, svgEl) => {
    const rect = svgEl.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width)  * VIEWBOX.width,
      y: ((event.clientY - rect.top)  / rect.height) * VIEWBOX.height,
    };
  },

  /** Convert a DOM pointer event → world (zoomed/panned) coords */
  pointFromEvent: (event, svgEl) => {
    const rect  = svgEl.getBoundingClientRect();
    const view  = es.viewport();
    const sx    = ((event.clientX - rect.left) / rect.width)  * VIEWBOX.width;
    const sy    = ((event.clientY - rect.top)  / rect.height) * VIEWBOX.height;
    return {
      x: (sx - view.x) / view.zoom,
      y: (sy - view.y) / view.zoom,
    };
  },

  /** World → screen */
  worldToScreen: (wx, wy) => {
    const view = es.viewport();
    return { x: view.x + wx * view.zoom, y: view.y + wy * view.zoom };
  },

  /** Screen → world */
  screenToWorld: (sx, sy) => {
    const view = es.viewport();
    return { x: (sx - view.x) / view.zoom, y: (sy - view.y) / view.zoom };
  },
});
