import { Simulation } from "eecircuit-engine";

const sim = new Simulation();
let started = false;

async function ensureStarted() {
  if (!started) {
    await sim.start();
    started = true;
  }
  return sim;
}

export async function runEeCircuitSimulation(netlist) {
  const engine = await ensureStarted();
  engine.setNetList(netlist);
  return engine.runSim();
}
