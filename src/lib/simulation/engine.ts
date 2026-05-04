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
  // ── New components ────────────────────────────────────────────
  inductor: {
    label: 'Inductor',
    unit: 'mH',
    valueKey: 'inductance',
    defaultValue: 10,
    ports: [
      { id: 'a', label: 'A', x: -60, y: 0 },
      { id: 'b', label: 'B', x: 60, y: 0 },
    ],
  },
  diode: {
    label: 'Diode',
    unit: 'Vf',
    valueKey: 'forwardVoltage',
    defaultValue: 0.7,
    ports: [
      { id: 'anode',   label: 'A', x: -54, y: 0 },
      { id: 'cathode', label: 'K', x: 54,  y: 0 },
    ],
  },
  zener: {
    label: 'Zener',
    unit: 'Vz',
    valueKey: 'zenerVoltage',
    defaultValue: 5.1,
    ports: [
      { id: 'anode',   label: 'A', x: -54, y: 0 },
      { id: 'cathode', label: 'K', x: 54,  y: 0 },
    ],
  },
  npn: {
    label: 'NPN BJT',
    unit: 'hFE',
    valueKey: 'gain',
    defaultValue: 100,
    ports: [
      { id: 'base',      label: 'B', x: -54, y: 0  },
      { id: 'collector', label: 'C', x: 0,   y: -44 },
      { id: 'emitter',   label: 'E', x: 0,   y:  44 },
    ],
  },
  pnp: {
    label: 'PNP BJT',
    unit: 'hFE',
    valueKey: 'gain',
    defaultValue: 100,
    ports: [
      { id: 'base',      label: 'B', x: -54, y: 0  },
      { id: 'collector', label: 'C', x: 0,   y: -44 },
      { id: 'emitter',   label: 'E', x: 0,   y:  44 },
    ],
  },
  mosfet_n: {
    label: 'N-MOSFET',
    unit: 'Vth',
    valueKey: 'threshold',
    defaultValue: 2,
    ports: [
      { id: 'gate',   label: 'G', x: -54, y: 0  },
      { id: 'drain',  label: 'D', x: 0,   y: -44 },
      { id: 'source', label: 'S', x: 0,   y:  44 },
    ],
  },
  voltmeter: {
    label: 'Voltmeter',
    unit: 'V',
    valueKey: 'range',
    defaultValue: 50,
    ports: [
      { id: 'pos', label: '+', x: -48, y: 0 },
      { id: 'neg', label: '-', x: 48,  y: 0 },
    ],
  },
  ground: {
    label: 'Ground',
    unit: '',
    valueKey: 'resistance',
    defaultValue: 0,
    ports: [
      { id: 'gnd', label: 'GND', x: 0, y: -36 },
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
  if (!port) return { x: component.position.x, y: component.position.y };

  const angle = ((component.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  const scaleX = component.mirror ? -1 : 1;
  const px = port.x * scaleX;
  const py = port.y;

  return {
    x: component.position.x + px * cos - py * sin,
    y: component.position.y + px * sin + py * cos,
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
    x1: component.position.x - 82 - padding,
    y1: component.position.y - 54 - padding,
    x2: component.position.x + 82 + padding,
    y2: component.position.y + 54 + padding,
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

export function routeWire(start, end, components = [], options: any = {}) {
  const sourceId = options.from?.componentId;
  const targetId = options.to?.componentId;
  const anchors = options.anchors || [];
  
  if (!anchors.length) {
    return routeSegment(start, end, sourceId, targetId, components);
  }

  const path = [];
  let currentStart = start;
  
  for (const anchor of anchors) {
    const segment = routeSegment(currentStart, anchor, sourceId, targetId, components);
    // Remove the last point so we don't duplicate it with the start of the next segment
    path.push(...(segment.length > 0 ? segment.slice(0, -1) : []));
    currentStart = anchor;
  }
  
  const finalSegment = routeSegment(currentStart, end, sourceId, targetId, components);
  path.push(...finalSegment);
  
  // Compact overall path
  return compactPoints(path);
}

function routeSegment(start, end, sourceId, targetId, components) {
  const obstacles = components
    .filter((component) => component.id !== sourceId && component.id !== targetId)
    .map((component) => componentBounds(component, 22));

  const startNode = snapPoint(start);
  const endNode = snapPoint(end);
  const key = (point) => `${point.x},${point.y}`;
  const score = (point) => Math.abs(point.x - endNode.x) + Math.abs(point.y - endNode.y);
  const blocked = (point) => obstacles.some((rect) => inside(rect, point));
  const isValid = (point) => point.x >= BOARD.grid && point.x <= BOARD.width - BOARD.grid && point.y >= BOARD.grid && point.y <= BOARD.height - BOARD.grid;

  const directions = [
    { x: BOARD.grid, y: 0 },
    { x: -BOARD.grid, y: 0 },
    { x: 0, y: BOARD.grid },
    { x: 0, y: -BOARD.grid },
  ];

  const normalizeRoute = (route) => {
    if (!route?.length) return compactPoints([start, end]);
    const filtered = route.filter(Boolean);
    const compacted = filtered.filter((point, index) => index === 0 || key(point) !== key(filtered[index - 1]));
    const middle = compacted.slice(1, -1).map((point) => ({ x: point.x, y: point.y }));
    return compactPoints([start, ...middle, end]);
  };

  const segmentBlocked = (from, to) => {
    if (from.x !== to.x && from.y !== to.y) return true;
    const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) / (BOARD.grid / 2);
    for (let i = 0; i <= steps; i += 1) {
      const point = {
        x: from.x + ((to.x - from.x) * i) / steps,
        y: from.y + ((to.y - from.y) * i) / steps,
      };
      if (blocked(point)) return true;
    }
    return false;
  };

  const buildCandidate = (corner) => {
    if (!corner) return null;
    const route = [start, corner, end];
    if (segmentBlocked(start, corner) || segmentBlocked(corner, end)) return null;
    return normalizeRoute(route);
  };

  if (key(startNode) === key(endNode)) {
    const offset = Math.max(BOARD.grid / 3, 12);
    const loop = [
      { x: start.x + offset, y: start.y },
      { x: start.x + offset, y: start.y + offset },
      { x: start.x, y: start.y + offset },
    ];
    return compactPoints([start, ...loop, start]);
  }

  const candidateA = buildCandidate({ x: end.x, y: start.y });
  if (candidateA) return candidateA;

  const candidateB = buildCandidate({ x: start.x, y: end.y });
  if (candidateB) return candidateB;

  const open = [{ point: startNode, cost: 0, priority: score(startNode), previous: null }];
  const cameFrom = new Map();
  const costSoFar = new Map([[key(startNode), 0]]);

  while (open.length) {
    open.sort((a, b) => a.priority - b.priority);
    const current = open.shift();
    const currentKey = key(current.point);
    if (currentKey === key(endNode)) {
      cameFrom.set(currentKey, { point: current.previous?.point || current.point });
      break;
    }

    for (const direction of directions) {
      const next = {
        x: current.point.x + direction.x,
        y: current.point.y + direction.y,
      };
      const nextKey = key(next);
      if (!isValid(next) || nextKey === currentKey) continue;
      if (blocked(next) && nextKey !== key(endNode)) continue;

      const turnCost = current.previous && (current.previous.point.x !== next.x || current.previous.point.y !== next.y) ? BOARD.grid * 0.45 : 0;
      const newCost = costSoFar.get(currentKey) + BOARD.grid + turnCost;

      if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)) {
        costSoFar.set(nextKey, newCost);
        cameFrom.set(nextKey, { point: current.point });
        open.push({ point: next, cost: newCost, priority: newCost + score(next), previous: current });
      }
    }
  }

  if (!cameFrom.has(key(endNode))) {
    return normalizeRoute([startNode, { x: start.x, y: end.y }, endNode]);
  }

  const path = [endNode];
  let cursor = key(endNode);
  while (cursor !== key(startNode)) {
    const previous = cameFrom.get(cursor);
    if (!previous || key(previous.point) === cursor) break;
    path.push(previous.point);
    cursor = key(previous.point);
  }

  return normalizeRoute([startNode, ...path.reverse(), endNode]);
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
  const queue = [{ node: start, seen: new Set([start]), path: [] }];
  const maxPathLength = 24;
  const maxPaths = 250;

  while (queue.length && paths.length < maxPaths) {
    const current = queue.shift();

    if (current.node === goal && current.path.length) {
      paths.push(current.path);
      continue;
    }

    for (const edge of graph.get(current.node) || []) {
      if (current.seen.has(edge.to) || current.path.length >= maxPathLength) continue;
      const seen = new Set(current.seen);
      seen.add(edge.to);
      queue.push({ node: edge.to, seen, path: [...current.path, edge] });
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

export function buildNetlist(components, wires, analysis = 'dc') {
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

  const analysisDirective =
    analysis === 'ac'
      ? '.ac dec 20 10 1e6'
      : analysis === 'transient'
        ? '.tran 1u 10m'
        : '.op';

  const text = ['* ElecZen netlist', ...lines, '.model DLED D(Is=1e-20 N=2)', analysisDirective, '.end'].join('\n');

  const nodeMap = new Map();
  for (const component of components) {
    const ports = PARTS[component.type]?.ports || [];
    for (const port of ports) {
      const key = termKey({ componentId: component.id, portId: port.id });
      nodeMap.set(key, nodeName(component.id, port.id));
    }
  }

  return { text, nodeMap };
}

export function simulateCircuit(components, wires, analysis = 'dc') {
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

  const netlistInfo = buildNetlist(components, wires, analysis);

  return {
    ok,
    message,
    states,
    stats: totals,
    netlist: netlistInfo.text,
    nodeMap: netlistInfo.nodeMap,
    graph: describeGraph(graph),
  };
}
