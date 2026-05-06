import { Component, Wire, SimulationOutput, SimulationConfig } from "./types";
import { buildNetlist } from "./netlist";
import { simulateCircuit as simulateLocalGraph } from "../lib/simulation/engine";

export async function runSimulation(
  components: Component[],
  wires: Wire[],
  config: SimulationConfig,
  abortSignal?: AbortSignal
): Promise<SimulationOutput> {
  const localEngineFallback: SimulationOutput = {
    ok: false,
    message: "Ready",
    states: {},
    stats: { current: 0, voltage: 0, resistance: 0 },
    netlist: "",
    nodeMap: new Map(),
    graph: { nodes: [], edges: [], adjacency: [] },
    engine: { mode: "local", status: "ready", raw: null },
  };

  try {
    const netlistResult = buildNetlist(components, wires, config.analysis, config.settings);
    const localResult = simulateLocalGraph(components, wires, config.analysis);
    
    // Merge netlist result and local result
    const mergedLocal = {
      ...localResult,
      netlist: netlistResult.text,
      nodeMap: netlistResult.nodeMap,
      warnings: netlistResult.warnings,
      engine: { mode: "local" as const, status: "ready" as const, raw: null },
    } as any;

    // Dynamic import to support ngspice-wasm
    const { runSimulation } = await import("../lib/simulation/eecircuitEngine");
    const raw = await runSimulation(netlistResult.text);

    console.log(JSON.stringify(raw))

    if (abortSignal?.aborted) throw new Error("Simulation aborted");

    return {
      ...mergedLocal,
      ok: true,
      engine: {
        mode: "ngspice",
        status: "ready",
        raw,
      },
      message: "ngspice simulation completed successfully.",
    };
  } catch (error: any) {
    if (abortSignal?.aborted) {
      return {
        ...localEngineFallback,
        ok: false,
        message: "Simulation aborted.",
        engine: { mode: "local", status: "stopped", raw: null },
      };
    }

    return {
      ...localEngineFallback,
      ok: false,
      message: String(error?.message || error),
      engine: { mode: "local", status: "failed", raw: String(error?.message || error) },
    };
  }
}
