import { Component, Wire, AnalysisSettings } from "./types";
import { PARTS, partValue, termKey } from "../lib/simulation/engine";

export interface ValidationWarning {
  type: "warning" | "error";
  message: string;
  componentId?: string;
  node?: string;
}

export interface NetlistResult {
  text: string;
  nodeMap: Map<string, string>;
  warnings: ValidationWarning[];
}

export function buildNetlist(
  components: Component[],
  wires: Wire[],
  analysis: "dc" | "ac" | "transient" = "dc",
  settings?: AnalysisSettings
): NetlistResult {
  const warnings: ValidationWarning[] = [];
  const parent = new Map<string, string>();

  const terminals = components.flatMap((component) =>
    (PARTS[component.type as keyof typeof PARTS]?.ports || []).map((port) =>
      termKey({ componentId: component.id, portId: port.id })
    )
  );

  const find = (node: string): string => {
    if (!parent.has(node)) parent.set(node, node);
    if (parent.get(node) !== node) {
      parent.set(node, find(parent.get(node)!));
    }
    return parent.get(node)!;
  };

  const union = (a: string, b: string) => parent.set(find(a), find(b));

  for (const terminal of terminals) find(terminal);
  for (const wire of wires) union(termKey(wire.from), termKey(wire.to));

  const firstBattery = components.find((c) => c.type === "battery");
  const firstGround = components.find((c) => c.type === "ground");

  let groundRoot: string | null = null;
  if (firstGround) {
    groundRoot = find(termKey({ componentId: firstGround.id, portId: "gnd" }));
  } else if (firstBattery) {
    groundRoot = find(termKey({ componentId: firstBattery.id, portId: "neg" }));
  }

  if (!groundRoot) {
    warnings.push({
      type: "warning",
      message: "No explicit ground node found. Assuming node 0 is arbitrary.",
    });
  }

  const names = new Map<string, string>();
  const nodeName = (componentId: string, portId: string): string => {
    const root = find(termKey({ componentId, portId }));
    if (root === groundRoot) return "0";
    if (!names.has(root)) {
        const id = (names.size + 1).toString().padStart(3, "0");
        names.set(root, `N${id}`);
    }
    return names.get(root)!;
  };

  const lines = components.map((component) => {
    const id = component.id.replace(/\W/g, "_");
    const spec = PARTS[component.type as keyof typeof PARTS];

    if (!spec) {
      warnings.push({
        type: "error",
        message: `Unknown component type: ${component.type}`,
        componentId: component.id,
      });
      return `* Unknown ${component.type}`;
    }

    const ports = spec.ports.map((port) => nodeName(component.id, port.id)) || [];
    const value = partValue(component);

    switch (component.type) {
      case "battery":
        return `V_${id} ${ports[0]} ${ports[1]} DC ${value}`;
      case "resistor":
        return `R_${id} ${ports[0]} ${ports[1]} ${value}`;
      case "led":
        return `D_${id} ${ports[0]} ${ports[1]} DLED`;
      case "diode":
        return `D_${id} ${ports[0]} ${ports[1]} D1N4148`;
      case "capacitor":
        return `C_${id} ${ports[0]} ${ports[1]} ${value}u`;
      case "inductor":
        return `L_${id} ${ports[0]} ${ports[1]} ${value}m`;
      case "switch":
        return `R_${id}_SW ${ports[0]} ${ports[1]} ${Math.max(0.001, value)}`;
      case "npn":
        return `Q_${id} ${ports[1]} ${ports[0]} ${ports[2]} QNPN`;
      case "pnp":
        return `Q_${id} ${ports[1]} ${ports[0]} ${ports[2]} QPNP`;
      case "mosfet_n":
        return `M_${id} ${ports[1]} ${ports[0]} ${ports[2]} ${ports[2]} MNMOS`;
      case "voltmeter":
      case "ground":
        return `* Ignoring simulation-only UI component ${component.type}`;
      default:
        return `* Unsupported ${component.type}`;
    }
  });

  const analysisDirective =
    analysis === "ac"
      ? `.ac dec ${settings?.ac?.points || 20} ${settings?.ac?.start || 10} ${settings?.ac?.stop || 1e6}`
      : analysis === "transient"
      ? `.tran ${settings?.transient?.step || "0.1m"} ${settings?.transient?.stop || "10m"} ${settings?.transient?.start || "0"} ${settings?.transient?.maxStep || ""} ${settings?.transient?.uic ? "uic" : ""}`
      : analysis === "dc"
      ? `.dc ${settings?.dc?.source || "V1"} ${settings?.dc?.start || 0} ${settings?.dc?.stop || 5} ${settings?.dc?.step || 0.1}`
      : ".op";

  // Generate .print line for all unique non-ground nodes
  const uniqueNodes = Array.from(new Set(names.values())).filter(n => n !== "0");
  const printDirective = uniqueNodes.length > 0 
    ? `.print ${analysis === 'ac' ? 'ac' : analysis === 'transient' ? 'tran' : analysis === 'dc' ? 'dc' : 'op'} ${uniqueNodes.map(n => `V(${n})`).join(" ")}`
    : "";

  const text = [
    "* ElecZen netlist",
    ...lines,
    "",
    analysisDirective,
    printDirective,
    ".end",
  ].filter(Boolean).join("\n");

  const nodeMap = new Map<string, string>();
  for (const component of components) {
    const spec = PARTS[component.type as keyof typeof PARTS];
    const ports = spec?.ports || [];
    for (const port of ports) {
      const key = termKey({ componentId: component.id, portId: port.id });
      nodeMap.set(key, nodeName(component.id, port.id));
    }
  }

  // Validate floating nodes
  const nodeConnections = new Map<string, number>();
  for (const node of nodeMap.values()) {
    nodeConnections.set(node, (nodeConnections.get(node) || 0) + 1);
  }

  for (const [node, count] of nodeConnections.entries()) {
    if (count === 1 && node !== "0") {
      warnings.push({
        type: "warning",
        message: `Node ${node} is floating (only 1 connection).`,
        node,
      });
    }
  }

  return { text, nodeMap, warnings };
}
