// ============================================================
// 🧠 Core Primitives
// ============================================================

export interface Point {
  x: number;
  y: number;
}

export interface Vec2 extends Point {}

export type ID = string;

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

export interface ComponentBase<TProps = unknown, TState = unknown> {
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

export interface Viewport {
  position: Point;
  zoom: number;

  minZoom?: number;
  maxZoom?: number;
}

export type RoutingMode = "manual" | "orthogonal" | "smart";

export type Tool =
  | "select"
  | "pan"
  | "wire"
  | "probe"
  | "delete"
  | "move";

export interface Settings {
autoRun: boolean,
      console: boolean,
      engine: string,
      grid: boolean,
      routing: string,
      showLabels: boolean,
      snap: boolean,
      snapSize: number,
      tool: string,
      consoleMaximized: boolean
}

export type Selection =
  | { type: "component"; ids: ID[] }
  | { type: "wire"; ids: ID[] }
  | null;

export type DragState =
  | {
      type: "component";
      ids: ID[]; // multi-select drag
      origin: Point;
      offset: Vec2;
    }
  | {
      type: "anchor";
      wireId: ID;
      anchorIndex: number;
      origin: Point;
      offset: Vec2;
    };

export interface PanState {
  screen: Point;
  viewport: Viewport;
}

export interface WireDraft {
  from: Terminal;

  start: Point;
  current: Point;

  anchors: Point[];

  active: boolean;
}

export interface ProbeDraft {
  from: Terminal;

  start: Point;
  current: Point;

  active: boolean;
}

export interface CanvasState {
  components: Record<ID, Component>;
  wires: Record<ID, Wire>;

  viewport: Viewport;
  settings: Settings;

  selection: Selection;

  drag?: DragState;
  pan?: PanState;

  wireDraft?: WireDraft;
  probeDraft?: ProbeDraft;
}