// =============================================================
// selection.js — Selection / pending-port query helpers
// =============================================================

/**
 * @param {{
 *   cm: import('../simulation/component').ComponentManager,
 *   wm: import('../simulation/wire').WireManager,
 * }} deps
 */
export const createSelectionHelpers = ({ cm, wm }) => ({
  /**
   * Is this item currently selected?
   * type: 'component' | 'wire'
   */
  isSelected: (type, id) => {
    const sel = cm.selection();         // shared selection signal
    return sel?.type === type && sel.ids.includes(id);
  },

  /**
   * Is this component:port currently pending (half-connected)?
   */
  isPending: (componentId, portId) => {
    const pp = wm.pendingPort();
    return pp?.componentId === componentId && pp?.portId === portId;
  },

  /** Current selection object */
  selection: () => cm.selection(),
});
