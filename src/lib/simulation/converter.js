import { globalModelStore } from './modelStore.js';

/**
 * Converts internal Component/Wire state to SPICE Netlist
 */

export const generateNetlist = (project) => {
    const { components, wires } = project;
    let netlist = "ElecZen Circuit Simulation\n";

    // 1. Node Identification (Union-Find)
    const parent = new Map();
    const find = (i) => {
        if (parent.get(i) === i) return i;
        const root = find(parent.get(i));
        parent.set(i, root);
        return root;
    };
    const union = (i, j) => {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) parent.set(rootI, rootJ);
    };

    // Initialize ports
    components.forEach(c => {
        const ports = getPortsForComponent(c);
        ports.forEach(p => {
            const key = `${c.id}:${p}`;
            parent.set(key, key);
        });
    });

    // Merge nets
    wires.forEach(w => {
        const u = `${w.fromComp}:${w.fromPort}`;
        const v = `${w.toComp}:${w.toPort}`;
        if (parent.has(u) && parent.has(v)) {
            union(u, v);
        }
    });

    // Assign Net Names
    const rootToNetName = new Map();
    let netCount = 1;

    // Find Ground
    // Check for VLG_SRC mapped to battery logic or explicit GND port usage
    // In DSL, ports named "GND" or "0" should be net 0.

    // Explicit ground handling from wire connections to "GND" port
    // If a wire connects to "GND", that node is 0.
    wires.forEach(w => {
        if (w.fromPort === 'GND' || w.toPort === 'GND' || w.fromPort === '0' || w.toPort === '0') {
            const u = `${w.fromComp}:${w.fromPort}`;
            const v = `${w.toComp}:${w.toPort}`;
            const root = find(u);
            rootToNetName.set(root, "0");
        }
    });

    // Fallback: look for VLG_SRC/battery neg if no explicit GND found
    if (!Array.from(rootToNetName.values()).includes("0")) {
        const battery = components.find(c => c.type === 'battery' || c.type === 'VLG_SRC' || c.type === 'VCC');
        if (battery) {
            const groundPort = (battery.type === 'VLG_SRC' || battery.type === 'VCC') ? 'GND' : 'neg';
            const key = `${battery.id}:${groundPort}`;
            if (parent.has(key)) {
                const groundRoot = find(key);
                rootToNetName.set(groundRoot, "0");
            }
        }
    }

    // Assign names
    for (const key of parent.keys()) {
        const root = find(key);
        if (!rootToNetName.has(root)) {
            rootToNetName.set(root, `N${String(netCount++).padStart(3, '0')}`);
        }
    }

    const getNet = (compId, portId) => {
        const key = `${compId}:${portId}`;
        if (!parent.has(key)) return "0"; // Default to 0 if disconnected? Or should be error?
        return rootToNetName.get(find(key));
    };

    // 2. Generate SPICE Lines
    const usedModels = new Set();

    components.forEach(c => {
        const name = c.id.replace(/-/g, '_');
        const ports = getPortsForComponent(c);
        const nodes = ports.map(p => getNet(c.id, p));
        const modelName = c.properties?.model || c.type;

        if (c.properties?.model) usedModels.add(c.properties.model);

        // Normalize types
        let type = c.type;
        // Mapping DSL types to internal logic
        if (type === 'RES') type = 'resistor';
        else if (type === 'CAP') type = 'capacitor';
        else if (type === 'IND') type = 'inductor';
        else if (type === 'VLG_SRC') type = 'battery'; // Simple voltage source
        else if (type === 'DIO') type = 'led'; // Generic diode/led bucket

        const isStandard = ['resistor', 'battery', 'led', 'switch', 'transistor', 'mosfet', 'capacitor', 'inductor'].includes(type);

        if (!isStandard) {
            // Custom Component / Subcircuit
            // Check ModelStore to see if it's a .model or .subckt
            const modelDef = globalModelStore.getModel(c.type) || globalModelStore.getSubckt(c.type);

            if (modelDef && !modelDef.nodes) {
                // Primitive model
                netlist += `X${name} ${nodes.join(' ')} ${c.type}\n`;
            } else {
                // Subcircuit
                netlist += `X${name} ${nodes.join(' ')} ${c.type}\n`;
            }
            usedModels.add(c.type);
            return;
        }

        const ensureSpicePrefix = (name, prefix) => {
            return name.toUpperCase().startsWith(prefix.toUpperCase()) ? name : `${prefix}${name}`;
        };

        switch (type) {
            case 'resistor':
                netlist += `${ensureSpicePrefix(name, 'R')} ${nodes[0]} ${nodes[1]} ${c.properties?.resistance || c.properties?.value || '1k'}\n`;
                break;
            case 'battery':
                // VLG_SRC might use 'value' prop for voltage
                netlist += `${ensureSpicePrefix(name, 'V')} ${nodes[0]} ${nodes[1]} ${c.properties?.voltage || c.properties?.value || '9'}\n`;
                break;
            case 'led':
                netlist += `${ensureSpicePrefix(name, 'D')} ${nodes[0]} ${nodes[1]} ${c.properties?.model || 'DLED'}\n`;
                if (!c.properties?.model) usedModels.add('DLED');
                break;
            case 'switch':
                const rVal = c.state?.on ? 0.001 : 1e9;
                // Switch is modeled as a Resistor, so it needs 'R' prefix. 
                // If user named it "SW1", we want "RSW1" (Resistor named SW1).
                netlist += `${ensureSpicePrefix(name, 'R')} ${nodes[0]} ${nodes[1]} ${rVal}\n`;
                break;
            case 'transistor': // BJT NPN
                netlist += `${ensureSpicePrefix(name, 'Q')} ${nodes[1]} ${nodes[0]} ${nodes[2]} ${c.properties?.model || 'NPN_GENERIC'}\n`;
                if (!c.properties?.model) usedModels.add('NPN_GENERIC');
                break;
            case 'mosfet': // NMOS
                netlist += `${ensureSpicePrefix(name, 'M')} ${nodes[1]} ${nodes[0]} ${nodes[2]} ${nodes[2]} ${c.properties?.model || 'NMOS_GENERIC'}\n`;
                if (!c.properties?.model) usedModels.add('NMOS_GENERIC');
                break;
            case 'capacitor':
                netlist += `${ensureSpicePrefix(name, 'C')} ${nodes[0]} ${nodes[1]} ${c.properties?.capacitance || c.properties?.value || '1u'}\n`;
                break;
            case 'inductor':
                netlist += `${ensureSpicePrefix(name, 'L')} ${nodes[0]} ${nodes[1]} ${c.properties?.inductance || c.properties?.value || '1m'}\n`;
                break;
        }
    });

    // 3. Add Models
    usedModels.forEach(mName => {
        const model = globalModelStore.getModel(mName);
        if (model) {
            netlist += `${model.raw}\n`;
        } else {
            const subckt = globalModelStore.getSubckt(mName);
            if (subckt) {
                // Check if lines already contain .subckt wrapper
                const firstLine = subckt.lines[0]?.trim().toLowerCase();
                const hasWrapper = firstLine && firstLine.startsWith('.subckt');

                if (hasWrapper) {
                    subckt.lines.forEach(l => netlist += `${l}\n`);
                } else {
                    netlist += `.subckt ${subckt.name} ${subckt.nodes.join(' ')}\n`;
                    subckt.lines.forEach(l => netlist += `${l}\n`);
                    netlist += `.ends\n`;
                }
            }
        }
    });

    // Inject Globals
    const globals = globalModelStore.getAllGlobals();
    globals.forEach(g => {
        netlist += `${g}\n`;
    });

    // Fallback defaults
    if (usedModels.has('DLED') && !globalModelStore.getModel('DLED')) {
        netlist += `.model DLED D (IS=1e-14 N=2 RS=10)\n`;
    }
    if (usedModels.has('NPN_GENERIC') && !globalModelStore.getModel('NPN_GENERIC')) {
        netlist += `.model NPN_GENERIC NPN (IS=1e-14 BF=100)\n`;
    }
    if (usedModels.has('NMOS_GENERIC') && !globalModelStore.getModel('NMOS_GENERIC')) {
        netlist += `.model NMOS_GENERIC NMOS (KP=0.1 VTO=2.0)\n`;
    }
    netlist += `
.options method=gear reltol=0.001 abstol=1e-9 vntol=10u
.tran 0.001 5 uic
.end
`;

    return { netlist, nodeMap: rootToNetName, parent, find };
};

export const getPortsForComponent = (comp) => {
    if (comp.customPorts) return comp.customPorts;

    // Check ModelStore for registered EZC component
    const def = globalModelStore.getComponent(comp.type);
    if (def && def.pins) {
        return def.pins.sort((a, b) => a.order - b.order).map(p => p.name);
    }

    // Handle DSL types
    // ... rest of switch
    switch (comp.type) {
        case 'VLG_SRC': return ['POS', 'GND'];
        case 'RES': return ['1', '2'];
        case 'CAP': return ['1', '2'];
        case 'IND': return ['1', '2'];

        case 'resistor': return ['p1', 'p2'];
        case 'battery': return ['pos', 'neg'];
        case 'led': return ['anode', 'cathode'];
        case 'switch': return ['in', 'out'];
        case 'transistor': return ['base', 'collector', 'emitter'];
        case 'mosfet': return ['gate', 'drain', 'source'];
        case 'capacitor': return ['p1', 'p2'];
        case 'inductor': return ['p1', 'p2'];
        default: return [];
    }
};
