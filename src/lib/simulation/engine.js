import { runSpiceSimulation } from './spice.js';
import { generateNetlist, getPortsForComponent } from './converter.js';
import { Models } from './models.js';

export const evaluateCircuit = async (components, wires) => {
    try {
        // 1. Generate Netlist
        const { netlist, nodeMap, parent, find } = generateNetlist({ components, wires });

        // 2. Run Simulation
        const result = await runSpiceSimulation(netlist);

        if (!result || !result.data) {
            console.warn("Simulation returned no data");
            return {};
        }

        // 3. Map Results back to Components
        return mapResultsToUpdates(result, components, nodeMap, parent, find);
    } catch (error) {
        console.error("Simulation Error:", error);
        return {};
    }
};

const mapResultsToUpdates = (result, components, nodeMap, parent, find) => {
    const updates = {};

    // Get the index of the last time point (steady state)
    // result.data is array of { name, values[] }
    // We assume all values arrays have same length.
    const timeData = result.data.find(d => d.name === 'time');
    const lastIdx = timeData ? timeData.values.length - 1 : 0;

    // Helper to get node voltage
    const getVoltage = (netName) => {
        if (netName === "0") return 0;
        const trace = result.data.find(d => d.name.toLowerCase() === `v(${netName})`);
        return trace ? trace.values[lastIdx] : 0;
    };

    // Helper to get net name for a component port
    const getNetName = (compId, portId) => {
        const key = `${compId}:${portId}`;
        if (!parent.has(key)) return "0";
        const root = find(key);
        return nodeMap.get(root) || "0";
    };

    components.forEach(comp => {
        const model = Models[comp.type];
        if (!model) return;

        const ports = getPortsForComponent(comp);
        const nodeVoltages = {};
        ports.forEach(p => {
            const netName = getNetName(comp.id, p);
            nodeVoltages[p] = getVoltage(netName);
        });

        // Calculate V, I, P
        let vDiff = 0, current = 0, power = 0;

        if (comp.type === 'resistor') {
            vDiff = nodeVoltages.p1 - nodeVoltages.p2;
            const R = parseFloat(comp.properties?.resistance || 1000);
            current = vDiff / Math.max(R, 1e-6);
            power = vDiff * current;
        } else if (comp.type === 'battery') {
            vDiff = nodeVoltages.pos - nodeVoltages.neg;
            // For battery, current is tricky without I(V) output.
            // We can try to find I(Vname).
            // Name in netlist is now normalized to single V prefix.
            let spiceName = comp.id.replace(/-/g, '_');
            if (!spiceName.toLowerCase().startsWith('v')) {
                spiceName = 'v' + spiceName;
            }
            const iTrace = result.data.find(d => d.name.toLowerCase() === `i(${spiceName})`);
            current = iTrace ? iTrace.values[lastIdx] : 0;
            power = vDiff * current;
        } else if (comp.type === 'led') {
            vDiff = nodeVoltages.anode - nodeVoltages.cathode;
            // Simple model: I = (V - Vf) / Rs
            const Vf = 1.8;
            const Rs = 10;
            if (vDiff > Vf) {
                current = (vDiff - Vf) / Rs;
            } else {
                current = vDiff * 1e-9;
            }
            power = vDiff * current;
        } else if (comp.type === 'switch') {
            vDiff = nodeVoltages.in - nodeVoltages.out;
            const R = comp.state?.on ? 0.001 : 1e9;
            current = vDiff / R;
            power = vDiff * current;
        }

        // Use model.calculateState if available to format the update
        let update = {};
        if (model.calculateState) {
            if (comp.type === 'transistor') {
                const vBE = nodeVoltages.base - nodeVoltages.emitter;
                const vCE = nodeVoltages.collector - nodeVoltages.emitter;
                update = model.calculateState(0, 0, 0, vBE, vCE);
            } else if (comp.type === 'mosfet') {
                const vGS = nodeVoltages.gate - nodeVoltages.source;
                const vDS = nodeVoltages.drain - nodeVoltages.source;
                update = model.calculateState(0, 0, 0, vGS, vDS);
            } else {
                update = { ...model.calculateState(vDiff, current, power), voltage: vDiff, current, power };
            }
        } else {
            update = { voltage: vDiff, current, power };
        }

        // Check Limits (Burn Logic)
        const burned = checkLimits(comp, vDiff, current, power);
        if (burned) {
            update.burned = true;
        }

        updates[comp.id] = update;
    });



    return updates;
};

const checkLimits = (comp, voltage, current, power) => {
    const maxV = parseFloat(comp.properties?.maxVoltage || Infinity);
    const maxI = parseFloat(comp.properties?.maxCurrent || Infinity);
    const maxP = parseFloat(comp.properties?.maxPower || Infinity);

    if (Math.abs(voltage) > maxV) return true;
    if (Math.abs(current) > maxI) return true;
    if (Math.abs(power) > maxP) return true;

    return false;
};


