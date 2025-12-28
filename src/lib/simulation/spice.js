import { Simulation } from "eecircuit-engine";

let simInstance = null;

/**
 * Initializes and returns the shared Simulation instance.
 * @returns {Promise<Simulation>}
 */
export const getSimulationEngine = async () => {
    if (!simInstance) {
        simInstance = new Simulation();
        await simInstance.start();
    }
    return simInstance;
};

/**
 * Runs a SPICE simulation with the given netlist.
 * @param {string} netlist - The SPICE netlist string.
 * @returns {Promise<any>} - The simulation result.
 */
export const runSpiceSimulation = async (netlist) => {
    const sim = await getSimulationEngine();
    sim.setNetList(netlist);
    return await sim.runSim();
};
