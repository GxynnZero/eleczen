// =============================================================
// utils/simulation/index.js — Public API barrel
//
// All manager classes, flat signal/action exports, and engine
// utilities flow through here.  Existing imports unchanged:
//   import { settings, runSimulation, ... } from '../utils/simulation'
// =============================================================

// ─── Manager classes (for DI / testing) ──────────────────────
export { ComponentManager }  from './component';
export { WireManager }       from './wire';
export { EditorSystem }      from './settings';
export { SimulationManager } from './simulation';

// ─── Singleton store + flat API ──────────────────────────────
// All flat reactive signals & action functions
export * from './store';

// ─── Engine utilities ─────────────────────────────────────────
export {
  partValue,
  pointsToPath,
  portPoint,
  routeWire,
  simulateCircuit,
  PARTS,
} from '../../lib/simulation/engine';