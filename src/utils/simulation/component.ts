import { PARTS } from '../../lib/simulation/engine';
import { createSignal, Accessor, Setter } from 'solid-js';
import { clone, markChanged } from './helper';
import { snapToGrid } from './helper';
import { Component, Selection, Settings } from '../../types';

class ComponentManager {
  settings: Accessor<Settings>;
  remember: () => void;
  markChanged: (msg: any) => void;
  PARTS: any;
  blankState: () => any;
  withState: (component: any) => Component;
  demoComponents: Partial<Component>[];
  nextComponent: number;
  components: Accessor<Component[]>;
  setComponents: Setter<Component[]>;
  selection: Accessor<Selection>;
  setSelection: Setter<Selection>;

  constructor({ settings, remember }: { settings: Accessor<Settings>, remember: () => void }) {
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

    this.demoComponents = [
      {
        id: "battery_1",
        type: "battery",
        position: { x: 408, y: 360 },
        rotation: 0,
        mirror: false,
        ports: [
          { id: "pos", position: { x: 0, y: -10 }, type: "output" },
          { id: "neg", position: { x: 0, y: 10 }, type: "output" }
        ],
        properties: {
          voltage: 9
        },
        state: {}
      },

      {
        id: "switch_2",
        type: "switch",
        position: { x: 180, y: 144 },
        rotation: 0,
        mirror: false,
        ports: [
          { id: "a", position: { x: -10, y: 0 }, type: "input" },
          { id: "b", position: { x: 10, y: 0 }, type: "output" }
        ],
        properties: {
          resistance: 0.1
        },
        state: {
          closed: false
        }
      },

      {
        id: "resistor_3",
        type: "resistor",
        position: { x: 396, y: 144 },
        rotation: 0,
        mirror: false,
        ports: [
          { id: "a", position: { x: -10, y: 0 }, type: "input" },
          { id: "b", position: { x: 10, y: 0 }, type: "output" }
        ],
        properties: {
          resistance: 330
        },
        state: {}
      },

      {
        id: "led_4",
        type: "led",
        position: { x: 600, y: 144 },
        rotation: 0,
        mirror: false,
        ports: [
          { id: "anode", position: { x: -10, y: 0 }, type: "input" },
          { id: "cathode", position: { x: 10, y: 0 }, type: "output" }
        ],
        properties: {
          forwardVoltage: 2
        },
        state: {
          on: false
        }
      }
    ];

    this.nextComponent = 5;

    const [components, setComponents] = createSignal(
      this.demoComponents.map(this.withState)
    );

    const [selection, setSelection] = createSignal<Selection>({
      type: 'component',
      ids: ['battery_1']
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
    return item?.type === 'component'
      ? this.componentById(item.ids[0])
      : null;
  }

  selectComponent(id) {
    this.setSelection({ type: 'component', ids: [id] });
  }

  duplicateSelected() {
    const component = this.selectedComponent();
    if (!component) return;

    this.remember();

    const id = `${component.type}_${this.nextComponent++}`;
    const copy = this.withState({
      ...clone(component),
      id,
      position: {
        x: component.position.x + 48,
        y: component.position.y + 48,
      }
    });

    this.setComponents((items) => [...items, copy]);
    this.setSelection({ type: 'component', ids: [id] });

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
          ? { ...item, position: snapped }
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
      position: { x: 450, y: 280 },
      rotation: 0,
      properties: { [spec.valueKey]: spec.defaultValue },
    });

    this.setComponents((items) => [...items, newComponent]);
    this.setSelection({ type: 'component', ids: [id] });
    this.markChanged('Component added');
  }
}

export { ComponentManager };