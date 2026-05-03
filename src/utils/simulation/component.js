import { PARTS } from '../../lib/simulation/engine.js';
import { createSignal } from 'solid-js';
import { clone, markChanged } from './helper.js';
import { snapToGrid } from './helper.js';

class ComponentManager {
  constructor({ settings, remember }) {
    this.settings = settings;
    this.remember = remember;
    this.markChanged = markChanged;
    this.PARTS = PARTS;

    this.blankState = () => ({
      active: false,
      brightness: 0,
      voltage: 0,
      current: 0,
      power: 0
    });

    this.withState = (component) => ({
      ...component,
      state: this.blankState()
    });

    // 🔹 demo data
    this.demoComponents = [
      { id: "battery_1", type: "battery", x: 408, y: 360, rotation: 0, properties: { voltage: 9 } },
      { id: "switch_2", type: "switch", x: 180, y: 144, rotation: 0, properties: { resistance: 0.1 } },
      { id: "resistor_3", type: "resistor", x: 396, y: 144, rotation: 0, properties: { resistance: 330 } },
      { id: "led_4", type: "led", x: 600, y: 144, rotation: 0, properties: { forwardVoltage: 2 } }
    ];

    this.nextComponent = 5;

    const [components, setComponents] = createSignal(
      this.demoComponents.map(this.withState)
    );

    const [selection, setSelection] = createSignal({
      type: 'component',
      id: 'battery_1'
    });

    this.components = components;
    this.setComponents = setComponents;
    this.selection = selection;
    this.setSelection = setSelection;
  }

  componentById(id) {
    return this.components().find((component) => component.id === id);
  }

  selectedComponent() {
    const item = this.selection();
    return item.type === 'component'
      ? this.componentById(item.id)
      : null;
  }

  selectComponent(id) {
    this.setSelection({ type: 'component', id });
  }

  duplicateSelected() {
    const component = this.selectedComponent();
    if (!component) return;

    this.remember();

    const id = `${component.type}_${this.nextComponent++}`;
    const copy = this.withState({
      ...clone(component),
      id,
      x: component.x + 48,
      y: component.y + 48,
    });

    this.setComponents((items) => [...items, copy]);
    this.setSelection({ type: 'component', id });

    this.markChanged('Duplicated selection');
  }

  updateSelectedPosition(patch) {
    const component = this.selectedComponent();
    if (!component) return;

    this.remember();

    this.setComponents((items) =>
      items.map((item) =>
        item.id === component.id ? { ...item, ...patch } : item
      )
    );

    this.markChanged('Position changed');
  }

  setComponentValue(id, value) {
    const component = this.componentById(id);
    const spec = this.PARTS[component?.type];
    if (!spec) return;

    this.remember();

    this.setComponents((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              properties: {
                ...item.properties,
                [spec.valueKey]: Number(value) || 0
              }
            }
          : item
      )
    );

    this.markChanged('Value changed');
  }

  moveComponent(id, x, y) {
    const snapped = snapToGrid(x, y, this.settings);

    this.setComponents((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, x: snapped.x, y: snapped.y }
          : item
      )
    );
  }

  addComponent(type) {
    const spec = this.PARTS[type];
    if (!spec) return;

    const id = `${type}_${this.nextComponent++}`;
    const newComponent = this.withState({
      id,
      type,
      x: 450,
      y: 280,
      rotation: 0,
      properties: { [spec.valueKey]: spec.defaultValue },
    });

    this.setComponents((items) => [...items, newComponent]);
    this.setSelection({ type: 'component', id });
    this.markChanged('Component added');
  }
}

export { ComponentManager };