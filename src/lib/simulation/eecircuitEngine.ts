import { NgspiceEngine } from "../../../luttice/simulation/engine/index";

const sim = new NgspiceEngine();
let started = false;

async function ensureStarted() {
  if (!started) {
    await sim.start();
    started = true;
  }
  return sim;
}

function parseNgspiceOutput(rawOutput: string) {
  const lines = rawOutput.split('\n');
  let readingData = false;
  let headers: string[] = [];
  let dataColumns: number[][] = [];
  
  for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Index')) {
          headers = line.split(/\s+/).slice(1); // skip 'Index'
          dataColumns = headers.map(() => []);
          i++; // skip '--------'
          readingData = true;
          continue;
      }
      
      if (readingData) {
          if (line === '' || line.startsWith('---') || line.startsWith('CPU time')) {
              if (dataColumns[0] && dataColumns[0].length > 0) break;
          }
          const parts = line.split(/\s+/);
          if (parts.length > 1) {
              const values = parts.slice(1).map(Number);
              if (values.length === headers.length && !values.some(isNaN)) {
                  values.forEach((val, idx) => dataColumns[idx].push(val));
              }
          }
      }
  }
  
  const data = headers.map((name, idx) => ({
      name: name.toLowerCase(), // normalize to lowercase for core/probe.ts
      values: dataColumns[idx]
  }));
  
  return {
      variableNames: headers.map(h => h.toLowerCase()),
      data: data,
      numPoints: dataColumns[0]?.length || 0,
      rawOutput
  };
}

export async function runSimulation(netlist: string) {
  const engine = await ensureStarted();
  engine.setNetList(netlist);
  const result = await engine.runSim();
  return parseNgspiceOutput(result.rawOutput);
}
