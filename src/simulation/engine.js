const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const BOARD = { width: 900, height: 560, grid: 24 };

export const PARTS = {
  battery: {
    label: 'Battery',
    unit: 'V',
    valueKey: 'voltage',
    defaultValue: 9,
    ports: [
      { id: 'pos', label: '+', x: -56, y: 0 },
      { id: 'neg', label: '-', x: 56, y: 0 },
    ],
  },
  resistor: {
    label: 'Resistor',
    unit: 'ohm',
    valueKey: 'resistance',
    defaultValue: 1000,
    ports: [
      { id: 'a', label: 'A', x: -60, y: 0 },
      { id: 'b', label: 'B', x: 60, y: 0 },
    ],
  },
  led: {
    label: 'LED',
    unit: 'Vf',
    valueKey: 'forwardVoltage',
    defaultValue: 2,
    ports: [
      { id: 'anode', label: 'A', x: -54, y: 0 },
      { id: 'cathode', label: 'K', x: 54, y: 0 },
    ],
  },
  capacitor: {
    label: 'Capacitor',
    unit: 'uF',
    valueKey: 'capacitance',
    defaultValue: 10,
    ports: [
      { id: 'a', label: 'A', x: -54, y: 0 },
      { id: 'b', label: 'B', x: 54, y: 0 },
    ],
  },
  switch: {
    label: 'Switch',
    unit: 'ohm',
    valueKey: 'resistance',
    defaultValue: 0.1,
    ports: [
      { id: 'a', label: 'A', x: -54, y: 0 },
      { id: 'b', label: 'B', x: 54, y: 0 },
    ],
  },
};

export const termKey = ({ componentId, portId }) => `${componentId}:${portId}`;

export function partValue(component) {
  const spec = PARTS[component.type];
  return Number(component.properties?.[spec?.valueKey] ?? spec?.defaultValue ?? 0);
}

export function portPoint(component, portId) {
  const spec = PARTS[component.type];
  const port = spec?.ports.find((item) => item.id === portId);
  if (!port) return { x: component.x, y: component.y };

  const angle = ((component.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: component.x + port.x * cos - port.y * sin,
    y: component.y + port.x * sin + port.y * cos,
  };
}

export function pointsToPath(points) {
  if (!points.length) return '';
  return points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
}

function snap(value) {
  return clamp(Math.round(value / BOARD.grid) * BOARD.grid, BOARD.grid, value > BOARD.width ? BOARD.width : Math.max(BOARD.width, BOARD.height));
}

function snapPoint(point) {
  return {
    x: clamp(Math.round(point.x / BOARD.grid) * BOARD.grid, BOARD.grid, BOARD.width - BOARD.grid),
    y: clamp(Math.round(point.y / BOARD.grid) * BOARD.grid, BOARD.grid, BOARD.height - BOARD.grid),
  };
}

function componentBounds(component, padding = 18) {
  return {
    id: component.id,
    x1: component.x - 82 - padding,
    y1: component.y - 54 - padding,
    x2: component.x + 82 + padding,
    y2: component.y + 54 + padding,
  };
}

function inside(rect, point) {
  return point.x >= rect.x1 && point.x <= rect.x2 && point.y >= rect.y1 && point.y <= rect.y2;
}

function compactPoints(points) {
  return points.filter((point, index) => {
    const prev = points[index - 1];
    const next = points[index + 1];
    if (!prev) return true;
    if (prev.x === point.x && prev.y === point.y) return false;
    if (!next) return true;
    return !((prev.x === point.x && point.x === next.x) || (prev.y === point.y && point.y === next.y));
  });
}

export function routeWire(start, end, components = [], terminals = {}) {
  const sourceId = terminals.from?.componentId;
  const targetId = terminals.to?.componentId;
  const obstacles = components
    .filter((component) => component.id !== sourceId && component.id !== targetId)
    .map((component) => componentBounds(component));
  const blocked = (point) => obstacles.some((rect) => inside(rect, point));
  const startNode = snapPoint(start);
  const endNode = snapPoint(end);
  const key = (point) => `${point.x},${point.y}`;
  const score = (point) => Math.abs(point.x - endNode.x) + Math.abs(point.y - endNode.y);
  const open = [{ point: startNode, cost: 0, priority: score(startNode) }];
  const cameFrom = new Map();
  const costSoFar = new Map([[key(startNode), 0]]);
  const directions = [
    { x: BOARD.grid, y: 0 },
    { x: -BOARD.grid, y: 0 },
    { x: 0, y: BOARD.grid },
    { x: 0, y: -BOARD.grid },
  ];

  while (open.length) {
    open.sort((a, b) => a.priority - b.priority);
    const current = open.shift().point;
    const currentKey = key(current);
    if (currentKey === key(endNode)) break;

    for (const direction of directions) {
      const next = {
        x: clamp(current.x + direction.x, BOARD.grid, BOARD.width - BOARD.grid),
        y: clamp(current.y + direction.y, BOARD.grid, BOARD.height - BOARD.grid),
      };
      const nextKey = key(next);
      if (blocked(next) || nextKey === currentKey) continue;

      const currentCost = costSoFar.get(currentKey) || 0;
      const previous = cameFrom.get(currentKey)?.point;
      const bendPenalty = previous && previous.x !== next.x && previous.y !== next.y ? BOARD.grid * 0.4 : 0;
      const newCost = currentCost + BOARD.grid + bendPenalty;

      if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)) {
        costSoFar.set(nextKey, newCost);
        cameFrom.set(nextKey, { point: current });
        open.push({ point: next, cost: newCost, priority: newCost + score(next) });
      }
    }
  }

  if (!cameFrom.has(key(endNode)) && key(startNode) !== key(endNode)) {
    return compactPoints([start, { x: start.x, y: end.y }, end]);
  }

  const path = [endNode];
  let cursor = key(endNode);
  while (cursor !== key(startNode)) {
    const previous = cameFrom.get(cursor);
    if (!previous) break;
    path.push(previous.point);
    cursor = key(previous.point);
  }

  return compactPoints([start, ...path.reverse(), end]);
}

function blankState() {
  return { active: false, brightness: 0, voltage: 0, current: 0, power: 0 };
}

function connect(graph, from, to, edge) {
  graph.set(from, [...(graph.get(from) || []), { ...edge, from, to }]);
  graph.set(to, [...(graph.get(to) || []), { ...edge, from: to, to: from }]);
}

function direct(graph, from, to, edge) {
  graph.set(from, [...(graph.get(from) || []), { ...edge, from, to }]);
}

function findPaths(graph, start, goal) {
  const paths = [];
  const stack = [{ node: start, seen: new Set([start]), path: [] }];

  while (stack.length && paths.length < 250) {
    const current = stack.pop();

    if (current.node === goal && current.path.length) {
      paths.push(current.path);
      continue;
    }

    for (const edge of graph.get(current.node) || []) {
      if (current.seen.has(edge.to) || current.path.length > 24) continue;
      const seen = new Set(current.seen);
      seen.add(edge.to);
      stack.push({ node: edge.to, seen, path: [...current.path, edge] });
    }
  }

  return paths;
}

function pathStats(path) {
  const devices = path.filter((edge) => edge.kind !== 'wire');
  const resistors = devices.filter((edge) => edge.kind === 'resistor');
  const leds = devices.filter((edge) => edge.kind === 'led');
  const resistance = resistors.reduce((sum, edge) => sum + edge.resistance, 0);
  const forwardVoltage = leds.reduce((sum, edge) => sum + edge.forwardVoltage, 0);

  return { devices, resistors, leds, resistance, forwardVoltage };
}

function describeGraph(graph) {
  const nodes = Array.from(graph.keys()).sort();
  const seen = new Set();
  const edges = [];

  for (const [from, links] of graph.entries()) {
    for (const edge of links) {
      const key = [from, edge.to, edge.kind, edge.componentId || edge.wireId || ''].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        from,
        to: edge.to,
        kind: edge.kind,
        id: edge.componentId || edge.wireId || '',
      });
    }
  }

  return {
    nodes,
    edges,
    adjacency: nodes.map((node) => `${node} -> ${(graph.get(node) || []).map((edge) => edge.to).join(', ') || '-'}`),
  };
}

export function buildNetlist(components, wires) {
  const parent = new Map();
  const terminals = components.flatMap((component) =>
    (PARTS[component.type]?.ports || []).map((port) => termKey({ componentId: component.id, portId: port.id })),
  );
  const find = (node) => {
    if (!parent.has(node)) parent.set(node, node);
    if (parent.get(node) !== node) parent.set(node, find(parent.get(node)));
    return parent.get(node);
  };
  const union = (a, b) => parent.set(find(a), find(b));

  for (const terminal of terminals) find(terminal);
  for (const wire of wires) union(termKey(wire.from), termKey(wire.to));

  const firstBattery = components.find((component) => component.type === 'battery');
  const groundRoot = firstBattery ? find(termKey({ componentId: firstBattery.id, portId: 'neg' })) : null;
  const names = new Map();
  const nodeName = (componentId, portId) => {
    const root = find(termKey({ componentId, portId }));
    if (root === groundRoot) return '0';
    if (!names.has(root)) names.set(root, `N${names.size + 1}`);
    return names.get(root);
  };

  const lines = components.map((component) => {
    const id = component.id.replace(/\W/g, '_');
    const ports = PARTS[component.type]?.ports.map((port) => nodeName(component.id, port.id)) || [];
    const value = partValue(component);

    if (component.type === 'battery') return `V_${id} ${ports[0]} ${ports[1]} DC ${value}`;
    if (component.type === 'resistor') return `R_${id} ${ports[0]} ${ports[1]} ${value}`;
    if (component.type === 'led') return `D_${id} ${ports[0]} ${ports[1]} DLED`;
    if (component.type === 'capacitor') return `C_${id} ${ports[0]} ${ports[1]} ${value}u`;
    if (component.type === 'switch') return `R_${id}_SW ${ports[0]} ${ports[1]} ${Math.max(0.001, value)}`;
    return `* Unsupported ${component.type}`;
  });

  return ['* ElecZen netlist', ...lines, '.model DLED D(Is=1e-20 N=2)', '.op', '.end'].join('\n');
}

export function simulateCircuit(components, wires) {
  const byId = new Map(components.map((component) => [component.id, component]));
  const states = Object.fromEntries(components.map((component) => [component.id, blankState()]));
  const graph = new Map();
  const messages = [];
  const totals = { current: 0, voltage: 0, resistance: 0 };

  for (const wire of wires) {
    if (!byId.has(wire.from.componentId) || !byId.has(wire.to.componentId)) continue;
    connect(graph, termKey(wire.from), termKey(wire.to), { kind: 'wire', wireId: wire.id });
  }

  for (const component of components) {
    if (component.type === 'resistor' || component.type === 'switch') {
      const resistance = Math.max(0, partValue(component));
      connect(graph, termKey({ componentId: component.id, portId: 'a' }), termKey({ componentId: component.id, portId: 'b' }), {
        kind: 'resistor',
        componentId: component.id,
        resistance,
      });
    }

    if (component.type === 'led') {
      direct(graph, termKey({ componentId: component.id, portId: 'anode' }), termKey({ componentId: component.id, portId: 'cathode' }), {
        kind: 'led',
        componentId: component.id,
        forwardVoltage: Math.max(0, partValue(component)),
      });
    }
  }

  for (const battery of components.filter((component) => component.type === 'battery')) {
    const voltage = Math.max(0, partValue(battery));
    const paths = findPaths(
      graph,
      termKey({ componentId: battery.id, portId: 'pos' }),
      termKey({ componentId: battery.id, portId: 'neg' }),
    );

    if (paths.some((path) => path.every((edge) => edge.kind === 'wire'))) {
      messages.push(`${battery.id} is shorted.`);
      continue;
    }

    const candidates = paths
      .map((path) => ({ path, ...pathStats(path) }))
      .filter((path) => path.leds.length && path.resistors.length && path.resistance > 0)
      .map((path) => ({ ...path, current: Math.max(0, (voltage - path.forwardVoltage) / path.resistance) }))
      .filter((path) => path.current > 0)
      .sort((a, b) => b.current - a.current);

    if (!candidates.length) {
      if (paths.some((path) => pathStats(path).leds.length)) {
        messages.push('LED path found, but it needs a forward-biased LED and resistor.');
      }
      continue;
    }

    const circuit = candidates[0];
    states[battery.id] = { ...states[battery.id], active: true, voltage, current: circuit.current, power: voltage * circuit.current };
    totals.current += circuit.current;
    totals.voltage = Math.max(totals.voltage, voltage);
    totals.resistance += circuit.resistance;

    for (const edge of circuit.resistors) {
      const power = circuit.current * circuit.current * edge.resistance;
      states[edge.componentId] = {
        ...states[edge.componentId],
        active: true,
        voltage: circuit.current * edge.resistance,
        current: circuit.current,
        power,
      };
    }

    for (const edge of circuit.leds) {
      states[edge.componentId] = {
        ...states[edge.componentId],
        active: true,
        brightness: clamp(circuit.current / 0.02, 0.08, 1),
        voltage: edge.forwardVoltage,
        current: circuit.current,
        power: edge.forwardVoltage * circuit.current,
      };
    }
  }

  const ok = Object.values(states).some((state) => state.active);
  const message = ok
    ? `Circuit running at ${(totals.current * 1000).toFixed(1)} mA.`
    : messages[0] || 'No complete battery-resistor-LED loop.';

  return {
    ok,
    message,
    states,
    stats: totals,
    netlist: buildNetlist(components, wires),
    graph: describeGraph(graph),
  };
}
