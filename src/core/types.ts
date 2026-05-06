// src/core/types.ts

export type ID = string;

export interface Point {
  x: number;
  y: number;
}

export interface Terminal {
  componentId: ID;
  portId: ID;
}

export interface Port {
  id: ID;
  position: Point;
  type?: "input" | "output" | "bidirectional";
}

export interface WireAnchor extends Point {
  locked?: boolean;
}

export interface Wire {
  id: ID;
  from: Terminal;
  to: Terminal;
  anchors: WireAnchor[];
  selected?: boolean;
  hovered?: boolean;
  meta?: Record<string, unknown>;
}

export interface ComponentBase<TProps = Record<string, unknown>, TState = Record<string, unknown>> {
  id: ID;
  type: string;
  position: Point;
  rotation: number;
  mirror: boolean;
  ports: Port[];
  properties: TProps;
  state: TState;
  selected?: boolean;
  locked?: boolean;
  meta?: Record<string, unknown>;
}

export type Component = ComponentBase<any, any>;

export type AnalysisMode = "dc" | "ac" | "transient";

export interface Probe {
  id: string;
  node?: string;
  element?: string;
  type: "voltage" | "current" | "expression";
  expression?: string;
  color: string;
  visible: boolean;
}

export interface AnalysisSettings {
  transient: {
    step: string;
    stop: string;
    start: string;      // Time to start saving data
    maxStep: string;    // Maximum Timestep
    uic: boolean;       // Skip initial operating point solution
    startup: boolean;   // Start external DC supply voltages at 0V
    steady: boolean;    // Stop simulating if steady state is detected
    nodereduce: boolean; // Don't reset T=0 when steady state is detected
    stepcurrent: boolean; // Step the load current source
  };
  ac: {
    points: string;
    start: string;
    stop: string;
  };
  dc: {
    source: string;
    start: string;
    stop: string;
    step: string;
  };
}

export interface SimulationConfig {
  analysis: AnalysisMode;
  probes: Probe[];
  settings: AnalysisSettings;
}

export interface SimulationOutput {
  ok: boolean;
  message: string;
  states: Record<string, any>;
  stats: {
    current: number;
    voltage: number;
    resistance: number;
  };
  netlist: string;
  nodeMap: Map<string, string>;
  graph: {
    nodes: string[];
    edges: any[];
    adjacency: string[];
  };
  engine: {
    mode: "local" | "eecircuit";
    status: "ready" | "running" | "stopped" | "failed";
    raw: any;
  };
}

export interface ChartData {
  time: number[];
  signals: Record<string, number[]>;
}
