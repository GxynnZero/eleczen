import { createSignal } from "solid-js";
import { Component, Wire } from "../core/types";

const [components, setComponents] = createSignal<Component[]>([]);
const [wires, setWires] = createSignal<Wire[]>([]);

export const useCircuitStore = () => {
  const addComponent = (component: Component) => {
    setComponents((prev) => [...prev, component]);
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const addWire = (wire: Wire) => {
    setWires((prev) => [...prev, wire]);
  };

  const removeWire = (id: string) => {
    setWires((prev) => prev.filter((w) => w.id !== id));
  };

  return {
    components,
    setComponents,
    wires,
    setWires,
    addComponent,
    updateComponent,
    removeComponent,
    addWire,
    removeWire,
  };
};
