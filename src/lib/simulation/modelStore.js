/**
 * ModelStore.js
 * Singleton to manage SPICE models for the simulation engine.
 */

class ModelStore {
    constructor() {
        if (ModelStore.instance) {
            return ModelStore.instance;
        }
        this.models = new Map(); // Name -> Content (string)
        this.subckts = new Map(); // Name -> { name, nodes, lines }
        this.globals = new Set(); // Global lines like .param
        this.components = new Map(); // Name -> EZC Metadata (pins, etc.)
        ModelStore.instance = this;
    }

    /**
     * Registers a model or subcircuit definition.
     * @param {string} name - The name of the model/subckt.
     * @param {string} content - The raw SPICE content.
     * @param {string} type - 'model' or 'subckt' (optional, inferred if null)
     */
    registerModel(name, content, type = null) {
        if (!content) return;

        // Simple heuristic if type not provided
        if (!type) {
            if (content.toLowerCase().includes('.subckt')) type = 'subckt';
            else type = 'model';
        }

        if (type === 'subckt') {
            // Parse subckt header to get nodes
            // .subckt NAME NODE1 NODE2 ...
            const lines = content.split(/\r?\n/);
            const header = lines.find(l => l.toLowerCase().startsWith('.subckt'));
            if (header) {
                const parts = header.trim().split(/\s+/);
                const subName = parts[1];
                const nodes = parts.slice(2);
                this.subckts.set(name, { name: subName, nodes, lines });
            }
        } else {
            this.models.set(name, { raw: content });
        }
    }

    getModel(name) {
        return this.models.get(name);
    }

    getSubckt(name) {
        return this.subckts.get(name);
    }

    addGlobal(line) {
        this.globals.add(line);
    }

    getAllGlobals() {
        return Array.from(this.globals);
    }

    getAllModels() {
        return Array.from(this.models.entries()).map(([name, data]) => ({ name, ...data }));
    }

    getAllSubckts() {
        return Array.from(this.subckts.values());
    }

    registerComponent(name, metadata) {
        this.components.set(name, metadata);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    clear() {
        this.models.clear();
        this.subckts.clear();
        this.globals.clear();
        this.components.clear();
    }
}

export const globalModelStore = new ModelStore();
