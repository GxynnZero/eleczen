import fs from 'node:fs';
import path from 'node:path';
import { runSpiceSimulation } from "../simulation/spice.js";
import { parseEZP } from "../parser/project.js";
import { generateNetlist } from "../simulation/converter.js";
import { loadComponent } from "../loader/ComponentLoader.js";

const ne555_ezc = fs.readFileSync(path.resolve('components/ne555/ne555.ezc'), 'utf8');
const ne555_ezl = fs.readFileSync(path.resolve('components/ne555/ne555.ezl'), 'utf8');

// Load component into store
loadComponent(ne555_ezc, ne555_ezl);

const dsl = `
project "NE555 Test Project"
    version "1.0.0"

    meta
        author "User"
        created "2024-01-01"
    end

    component "VCC"
        type VLG_SRC
        x 100
        y 100
        properties
            value "9V"
        end
    end

    component "U1"
        type NE555
        x 300
        y 200
        properties
           # NE555 doesn't need properties here as it is a subckt
        end
    end

    component "R1"
        type RES
        x 200
        y 100
        properties
            value "10k"
        end
    end
    
    component "C1"
         type CAP
         x 200
         y 200
         properties
             value "10u"
         end
    end

    # Astable Configuration
    # VCC (8) and RST (4) to VCC
    wire "W_VCC_8"
        fromComp "VCC"
        toComp "U1"
        fromPort "POS"
        toPort "Vcc"
    end
    wire "W_VCC_4"
        fromComp "VCC"
        toComp "U1"
        fromPort "POS"
        toPort "RST"
    end
    wire "W_GND_1"
        fromComp "VCC"
        toComp "U1"
        fromPort "GND"
        toPort "GND"
    end

    # R1 (Ra): VCC to DIS (7)
    wire "W_R1_VCC"
        fromComp "VCC"
        toComp "R1"
        fromPort "POS"
        toPort "1"
    end
    wire "W_R1_DIS"
        fromComp "R1"
        toComp "U1"
        fromPort "2"
        toPort "DIS"
    end

    # R2 (Rb): DIS (7) to TRIG (2) / THRS (6)
    component "R2"
        type RES
        x 250
        y 150
        properties
            value "10k"
        end
    end
    wire "W_R2_DIS"
        fromComp "U1"
        toComp "R2"
        fromPort "DIS"
        toPort "1"
    end
    wire "W_R2_TRIG"
        fromComp "R2"
        toComp "U1"
        fromPort "2"
        toPort "TRIG"
    end
    
    # TRIG (2) connected to THRS (6)
    wire "W_TRIG_THRS"
        fromComp "U1"
        toComp "U1"
        fromPort "TRIG"
        toPort "THRS"
    end

    # C1: TRIG/THRS to GND
    wire "W_C1_TRIG"
        fromComp "U1"
        toComp "C1"
        fromPort "TRIG"
        toPort "1"
    end
    wire "W_C1_GND"
        fromComp "C1"
        toComp "VCC"
        fromPort "2"
        toPort "GND"
    end

    # CV (5) - Decouple with C2 to GND
    component "C2" 
        type CAP 
        properties 
            value "10n" 
        end 
    end
    wire "W_CV_C2"
        fromComp "U1"
        toComp "C2"
        fromPort "CV"
        toPort "1"
    end
    wire "W_C2_GND"
        fromComp "C2"
        toComp "VCC"
        fromPort "2"
        toPort "GND"
    end

    # OUT (3) - Load
    component "R_LOAD" 
        type RES 
        properties 
            value "1k" 
        end 
    end
    wire "W_OUT_RL"
        fromComp "U1"
        toComp "R_LOAD"
        fromPort "OUT"
        toPort "1"
    end
    wire "W_RL_GND"
        fromComp "R_LOAD"
        toComp "VCC"
        fromPort "2"
        toPort "GND"
    end

end
`;

async function main() {
    console.log("--- 1. Loading Components ---");
    // Loaded above.

    console.log("--- 2. Parsing DSL ---");
    const project = parseEZP(dsl);
    console.log("Parsed Project Components:", project.components.map(c => c.id + ": " + c.type));

    console.log("\n--- 3. Generating Netlist ---");
    const { netlist } = generateNetlist(project);
    console.log("Generated Netlist:\n", netlist);

    console.log("\n--- 4. Running Simulation ---");
    console.log("Starting simulation...");
    const res = await runSpiceSimulation(netlist);
    console.log("Simulation finished. Data points:", res?.data || 0);
    // console.log("Result:", res);
}

main().catch(console.error);
