// =============================================================
// simulation.js — Simulation result query helpers
// =============================================================

/**
 * @param {{
 *   sm: import('../simulation/simulation.js').SimulationManager,
 * }} deps
 */
export const createSimulationHelpers = ({ sm }) => ({
  /**
   * Look up the latest simulated value for `name` (e.g. 'i(V_battery_1)').
   * Returns a number or null when not available.
   */
  getSimValue: (name) => {
    const data = sm.simulation()?.engine?.raw?.data;
    if (!data) return null;

    const lower  = name.toLowerCase();
    const series = data.find((s) => s.name.toLowerCase() === lower);

    if (!series?.values?.length) return null;

    const val = Number(series.values.at(-1));
    return Number.isFinite(val) ? val : null;
  },

  /**
   * Derive the SPICE device name from a component object.
   * Keeps the mapping in one canonical place.
   */
  getDeviceName: (component) => {
    const pfx = {
      battery:  'V',
      resistor: 'R',
      led:      'D',
      capacitor:'C',
      switch:   'R',
    }[component.type] || 'X';

    let name = `${pfx}_${component.id.replace(/\W/g, '_')}`;
    if (component.type === 'switch') name += '_SW';
    return name;
  },

  /** Raw simulation signal accessor */
  simulation: () => sm.simulation(),
});
