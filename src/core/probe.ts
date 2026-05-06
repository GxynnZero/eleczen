import { ChartData, Probe } from "./types";

export function evaluateProbeExpression(
  expression: string,
  rawSignals: Record<string, number[]>,
  time: number[]
): number[] {
  // A simple evaluator for things like "V(n1) - V(n2)"
  // In a production system, use a proper math parser (e.g. mathjs)
  // For now, we support basic V(a) - V(b) or just direct variable access.
  const length = time.length;
  if (!length) return [];

  const expr = expression.trim();
  const lowerExpr = expr.toLowerCase();

  // 1. Direct match
  const directMatchKey = Object.keys(rawSignals).find(k => k.toLowerCase() === lowerExpr);
  if (directMatchKey) {
    return [...rawSignals[directMatchKey]];
  }

  // 2. V(n1) - V(n2) or v(n1, n2) match
  const diffMatch = expr.match(/v\(([^,]+),\s*([^)]+)\)/i) || expr.match(/v\(([^)]+)\)\s*-\s*v\(([^)]+)\)/i);
  if (diffMatch) {
    const [, node1, node2] = diffMatch;
    const n1 = Object.keys(rawSignals).find(k => k.toLowerCase() === `v(${node1.toLowerCase()})`);
    const n2 = Object.keys(rawSignals).find(k => k.toLowerCase() === `v(${node2.toLowerCase()})`);
    
    if (n1 && n2) {
      const v1 = rawSignals[n1];
      const v2 = rawSignals[n2];
      return v1.map((val, i) => (Number.isFinite(val) ? val : 0) - (Number.isFinite(v2[i]) ? v2[i] : 0));
    }
  }

  // Fallback (all zeros)
  return new Array(length).fill(0);
}

export function extractChartData(raw: any, probes: Probe[]): ChartData {
  if (!raw?.data) return { time: [], signals: {} };

  const length = raw.numPoints || raw.data[0]?.values?.length || 0;
  if (!length) return { time: [], signals: {} };

  const timeArray = (raw.data[0]?.values as number[])?.map(Number) || Array.from({ length }, (_, i) => i + 1);
  const signals: Record<string, number[]> = {};

  const rawSignals: Record<string, number[]> = {};
  for (const item of raw.data) {
    rawSignals[item.name] = item.values.map(Number);
  }

  for (const probe of probes) {
    if (!probe.visible) continue;
    const targetExpr = probe.expression || probe.id;
    signals[probe.id] = evaluateProbeExpression(targetExpr, rawSignals, timeArray);
  }

  // Align data based on time array
  const indices = Array.from({ length }, (_, i) => i);
  indices.sort((a, b) => timeArray[a] - timeArray[b]);

  const sortedTime = new Array(length);
  for (let i = 0; i < length; i++) sortedTime[i] = timeArray[indices[i]];

  const sortedSignals: Record<string, number[]> = {};
  for (const key of Object.keys(signals)) {
    const row = signals[key];
    const sortedRow = new Array(length);
    for (let i = 0; i < length; i++) sortedRow[i] = row[indices[i]];
    sortedSignals[key] = sortedRow;
  }

  return { time: sortedTime, signals: sortedSignals };
}
