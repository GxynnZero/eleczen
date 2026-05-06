import { createSignal } from "solid-js";
import { AnalysisMode, AnalysisSettings, Probe, SimulationOutput } from "../core/types";
import { runSimulation } from "../core/simulation";

const [simulationRunning, setSimulationRunning] = createSignal(false);
const [simulationData, setSimulationData] = createSignal<SimulationOutput | null>(null);
const [analysisMode, setAnalysisMode] = createSignal<AnalysisMode>("transient");
const [probes, setProbes] = createSignal<Probe[]>([]);
const [simulationSettings, setSimulationSettings] = createSignal<AnalysisSettings>({
  transient: { 
    step: "0.1m", 
    stop: "10m",
    start: "0",
    maxStep: "",
    uic: false,
    startup: false,
    steady: false,
    nodereduce: false,
    stepcurrent: false
  },
  ac: { points: "10", start: "10", stop: "1e6" },
  dc: { source: "V1", start: "0", stop: "5", step: "0.1" }
});

let currentAbortController: AbortController | null = null;

export const useSimulationStore = () => {
  const startSimulation = async (components: any[], wires: any[]) => {
    if (simulationRunning()) return;

    setSimulationRunning(true);
    if (currentAbortController) currentAbortController.abort();
    
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    setSimulationData((prev) => ({
      ...prev!,
      engine: { ...prev?.engine, mode: "ngspice", status: "running" },
      message: "Simulation running...",
    } as any));

    const result = await runSimulation(components, wires, {
      analysis: analysisMode(),
      probes: probes(),
      settings: simulationSettings()
    }, signal);

    if (!signal.aborted) {
      setSimulationData(result);
      setSimulationRunning(false);
    }
  };

  const stopSimulation = () => {
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = null;
    setSimulationRunning(false);
    setSimulationData((prev) => ({
      ...prev!,
      engine: { ...prev?.engine, mode: "local", status: "stopped" },
      message: "Simulation stopped.",
    }));
  };

  const toggleProbe = (name: string, type: Probe["type"] = "voltage") => {
    setProbes((current) => {
      const existing = current.find((p) => p.id === name);
      if (existing) {
        return current.filter((p) => p.id !== name);
      }
      return [
        ...current,
        {
          id: name,
          node: type === "voltage" ? name.replace(/[vV]\((.*)\)/, "$1") : undefined,
          type,
          color: "#3b82f6",
          visible: true,
          expression: name
        }
      ];
    });
  };

  return {
    simulationRunning,
    simulationData,
    analysisMode,
    setAnalysisMode,
    probes,
    setProbes,
    simulationSettings,
    setSimulationSettings,
    startSimulation,
    stopSimulation,
    toggleProbe
  };
};
