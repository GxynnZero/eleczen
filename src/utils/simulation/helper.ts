import { Settings, Terminal, Wire, Point } from "~/types";

// ─────────────────────────────────────────────
// 🔹 grid snap
// ─────────────────────────────────────────────

export function snapToGrid(
  x: number,
  y: number,
  settings: () => Settings
): Point {
  if (!settings().snap) return { x, y };

  const grid = settings().snapSize ?? 12;

  return {
    x: Math.round(x / grid) * grid,
    y: Math.round(y / grid) * grid,
  };
}

// ─────────────────────────────────────────────
// 🔹 change handler
// ─────────────────────────────────────────────

type MarkChangedDeps = {
  message?: string;
  settings: () => Settings;
  pushLog: (msg: string, level?: string) => void;
  applySimulation: () => Promise<{ message: string; ok: boolean }>;
  setSimulation: (v: any) => void;
  ready: (msg: string) => any;
  cm: {
    setComponents: (fn: (items: any[]) => any[]) => void;
    blankState: () => any;
  };
};

export function markChanged({
  message = "Circuit changed",
  settings,
  pushLog,
  applySimulation,
  setSimulation,
  ready,
  cm,
}: MarkChangedDeps) {
  pushLog(message);

  if (settings().autoRun) {
    applySimulation().then((res) =>
      pushLog(res.message, res.ok ? "success" : "warn")
    );
  } else {
    setSimulation(ready(message));

    cm.setComponents((items) =>
      items.map((item) => ({
        ...item,
        state: cm.blankState(),
      }))
    );
  }
}

// ─────────────────────────────────────────────
// 🔹 clone (SAFE replacement for JSON trick)
// ─────────────────────────────────────────────

export function clone<T>(value: T): T {
  // modern safe clone (better than JSON.parse/stringify)
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

// ─────────────────────────────────────────────
// 🔹 aborted result builder
// ─────────────────────────────────────────────

export function buildAbortedResult(
  local: any,
  analysis: any,
  probes: any
) {
  return {
    ...local,
    analysis,
    probes,
    engine: {
      ...local.engine,
      status: "stopped",
      raw: null,
    },
    message: `${local.message} canceled.`,
  };
}

// ─────────────────────────────────────────────
// 🔹 simulation result builder
// ─────────────────────────────────────────────

export function buildResult(
  local: any,
  result: {
    analysis: any;
    probes: any;
    engine: any;
    message: string;
  }
) {
  return {
    ...local,
    ...result,
  };
}

// ─────────────────────────────────────────────
// 🔹 terminal comparison
// ─────────────────────────────────────────────

export function sameTerminal(
  a?: Terminal,
  b?: Terminal
): boolean {
  return (
    a?.componentId === b?.componentId &&
    a?.portId === b?.portId
  );
}

// ─────────────────────────────────────────────
// 🔹 wire comparison
// ─────────────────────────────────────────────

export function sameWire(
  wire: Wire,
  from: Terminal,
  to: Terminal,
  sameTerminalFn: typeof sameTerminal
): boolean {
  return (
    (sameTerminalFn(wire.from, from) &&
      sameTerminalFn(wire.to, to)) ||
    (sameTerminalFn(wire.from, to) &&
      sameTerminalFn(wire.to, from))
  );
}