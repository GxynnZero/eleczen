// 🔹 grid
export function snapToGrid(x, y, settings) {
  if (!settings().snap) return { x, y };

  const grid = settings().snapSize || 12;

  return {
    x: Math.round(x / grid) * grid,
    y: Math.round(y / grid) * grid,
  };
}

// 🔹 change handler
export function markChanged({
  message = 'Circuit changed',
  settings,
  pushLog,
  applySimulation,
  setSimulation,
  ready,
  cm
}) {
  pushLog(message);

  if (settings().autoRun) {
    applySimulation().then((res) =>
      pushLog(res.message, res.ok ? 'success' : 'warn')
    );
  } else {
    setSimulation(ready(message));

    cm.setComponents((items) =>
      items.map((item) => ({
        ...item,
        state: cm.blankState()
      }))
    );
  }
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// 🔹 aborted result builder
export function buildAbortedResult(local, analysis, probes) {
  return {
    ...local,
    analysis,
    probes,
    engine: {
      ...local.engine,
      status: 'stopped',
      raw: null,
    },
    message: `${local.message} canceled.`,
  };
}

// 🔹 simulation result builder
export function buildResult(local, { analysis, probes, engine, message }) {
  return {
    ...local,
    analysis,
    probes,
    engine,
    message,
  };
}

// 🔹 terminal comparison
export function sameTerminal(a, b) {
  return a?.componentId === b?.componentId && a?.portId === b?.portId;
}

// 🔹 wire comparison
export function sameWire(wire, from, to, sameTerminalFn) {
  return (
    (sameTerminalFn(wire.from, from) && sameTerminalFn(wire.to, to)) ||
    (sameTerminalFn(wire.from, to) && sameTerminalFn(wire.to, from))
  );
}