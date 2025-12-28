import { create } from 'zustand';
import { evaluateCircuit } from './engine';
import { globalModelStore } from './modelStore';
import { getComponentDef } from '@/components/simulation/StandardParts';

// Helper: Snap to grid
const snap = (val, gridSize = 10) => Math.round(val / gridSize) * gridSize;

export const useLiteSimStore = create((set, get) => ({
    // State
    components: [], // { id, type, x, y, rotation, properties, state, customDef }
    wires: [],      // { id, fromComp, fromPort, toComp, toPort, points }
    selection: null, // { type: 'component'|'wire', id }
    simulationRunning: false,
    simulationResults: {}, // { compId: { voltage, current, power, ... } }
    settings: {
        snapToGrid: true,
        showLabels: true,
        timeStep: 0.1, // ms
    },
    exportRequest: null, // 'PNG', 'JSON', etc.
    logs: [], // { type: 'info'|'warn'|'error', message, timestamp }
    modal: { isOpen: false, type: null, props: {} }, // Modal state
    meta: { projectName: "Untitled Circuit" }, // Circuit metadata
    view: { x: 0, y: 0, zoom: 1 }, // Viewport state

    // Actions
    addComponent: (type, x, y, extra = {}) => {
        set((state) => {
            const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const gridSize = state.settings.snapToGrid ? 10 : 1;

            // Allow override of ID if importing
            const finalId = extra.id || id;

            const newComp = {
                id: finalId,
                type,
                x: snap(x, gridSize),
                y: snap(y, gridSize),
                rotation: extra.rotation || 0,
                properties: extra.properties || {},
                customDef: extra.customDef || null,
                customPorts: extra.customPorts || null,
                state: {}, // Runtime state (v, i, p)
                ...extra
            };
            return { components: [...state.components, newComp] };
        });
    },

    updateComponentPosition: (id, x, y) => {
        set((state) => ({
            components: state.components.map(c =>
                c.id === id ? { ...c, x, y } : c
            )
        }));
    },

    updateView: (view) => {
        set((state) => ({
            view: { ...state.view, ...view }
        }));
    },

    updateComponentProperties: (id, props) => {
        set((state) => ({
            components: state.components.map(c =>
                c.id === id ? { ...c, properties: { ...c.properties, ...props } } : c
            )
        }));
    },

    removeComponent: (id) => {
        set((state) => ({
            components: state.components.filter(c => c.id !== id),
            wires: state.wires.filter(w => w.fromComp !== id && w.toComp !== id),
            selection: state.selection?.id === id ? null : state.selection
        }));
    },

    addWire: (fromComp, fromPort, toComp, toPort) => {
        set((state) => {
            // Prevent duplicates
            const exists = state.wires.find(w =>
                (w.fromComp === fromComp && w.fromPort === fromPort && w.toComp === toComp && w.toPort === toPort) ||
                (w.fromComp === toComp && w.fromPort === toPort && w.toComp === fromComp && w.toPort === fromPort)
            );
            if (exists) return {};

            const id = `wire-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newWire = {
                id,
                fromComp, fromPort,
                toComp, toPort,
                points: null // Calculated by rendering layer initially
            };
            return { wires: [...state.wires, newWire] };
        });
    },

    updateWirePoints: (id, points) => {
        set((state) => ({
            wires: state.wires.map(w => w.id === id ? { ...w, points } : w)
        }));
    },

    removeWire: (id) => {
        set((state) => ({
            wires: state.wires.filter(w => w.id !== id),
            selection: state.selection?.id === id ? null : state.selection
        }));
    },

    setSelection: (type, id) => {
        set({ selection: id ? { type, id } : null });
    },

    removeSelection: () => {
        const { selection, removeComponent, removeWire } = get();
        if (!selection) return;
        if (selection.type === 'component') removeComponent(selection.id);
        if (selection.type === 'wire') removeWire(selection.id);
        set({ selection: null });
    },

    clearCanvas: () => {
        set({ components: [], wires: [], selection: null, simulationResults: {} });
    },

    // Simulation
    runSimulation: async () => {
        const { components, wires } = get();
        // Skip if empty
        if (components.length === 0) return;

        set({ simulationRunning: true });

        // Call Engine
        const updates = await evaluateCircuit(components, wires);

        // Apply updates to components state
        set((state) => ({
            simulationRunning: false,
            components: state.components.map(c => {
                const update = updates[c.id];
                if (update) {
                    return { ...c, state: { ...c.state, ...update } };
                }
                return c;
            })
        }));
    },

    // IO
    loadCircuit: (data) => {
        set({
            components: data.components || [],
            wires: data.wires || [],
            settings: { ...get().settings, ...(data.settings || {}) }
        });
    },

    getCircuitData: () => {
        const { components, wires, settings } = get();
        return { components, wires, settings };
    },

    // Export
    requestExport: (type) => set({ exportRequest: type }),
    resolveExport: () => set({ exportRequest: null }),

    // Logs
    addLog: (type, message) => {
        set((state) => ({
            logs: [...state.logs, { type, message, timestamp: Date.now() }]
        }));
    },
    clearLogs: () => set({ logs: [] }),

    // Modal
    openModal: (type, props = {}) => set({ modal: { isOpen: true, type, props } }),
    closeModal: () => set({ modal: { isOpen: false, type: null, props: {} } }),

}));
