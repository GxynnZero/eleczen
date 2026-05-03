import { createSignal } from 'solid-js';
import { sameTerminal, sameWire } from './helper.js';

class WireManager {
  /**
   * @param {import('./component.js').ComponentManager} cm
   * @param {{ remember, pushLog, markChanged, deleteItem }} deps
   */
  constructor(cm, deps = {}) {
    this.remember    = deps.remember;
    this.pushLog     = deps.pushLog;
    this.markChanged = deps.markChanged;
    this.deleteItem  = deps.deleteItem;

    this.demoWires = [
      { id: "wire_1", from: { componentId: "battery_1", portId: "pos" }, to: { componentId: "switch_2", portId: "a" }, anchors: [{ x: 75.82, y: 360.25 }, { x: 74.13, y: 143.23 }] },
      { id: "wire_2", from: { componentId: "switch_2", portId: "b" }, to: { componentId: "resistor_3", portId: "a" }, anchors: [] },
      { id: "wire_3", from: { componentId: "resistor_3", portId: "b" }, to: { componentId: "led_4", portId: "anode" }, anchors: [] },
      { id: "wire_4", from: { componentId: "led_4", portId: "cathode" }, to: { componentId: "battery_1", portId: "neg" }, anchors: [{ x: 740.76, y: 349.52 }, { x: 740.93, y: 145.95 }] }
    ];

    this.nextWire = 5;

    const [wires, setWires]                   = createSignal(this.demoWires);
    const [pendingPort, setPendingPort]       = createSignal(null);
    const [wireEditTarget, setWireEditTarget] = createSignal(null);

    this.wires            = wires;
    this.setWires         = setWires;
    this.pendingPort      = pendingPort;
    this.setPendingPort   = setPendingPort;
    this.wireEditTarget   = wireEditTarget;
    this.setWireEditTarget = setWireEditTarget;

    // Share selection signals with ComponentManager
    this.selection    = cm.selection;
    this.setSelection = cm.setSelection;
  }

  sameTerminal(a, b) {
    return sameTerminal(a, b);
  }

  sameWire(wire, from, to) {
    return sameWire(wire, from, to, this.sameTerminal.bind(this));
  }

  selectedWire() {
    const item = this.selection();
    return item.type === 'wire'
      ? this.wires().find((w) => w.id === item.id)
      : null;
  }

  selectWire(id) {
    this.setSelection({ type: 'wire', id });
  }

  beginWireEdit(wireId, endpoint) {
    const wire = this.wires().find((w) => w.id === wireId);
    if (!wire) return;

    this.remember?.();

    this.setSelection({ type: 'wire', id: wireId });
    this.setWireEditTarget({ wireId, endpoint });

    this.pushLog?.(`Editing ${wireId} ${endpoint}`);
  }

  cancelWireEdit() {
    this.setWireEditTarget(null);
  }

  finishWireEdit(componentId, portId) {
    const edit = this.wireEditTarget();
    if (!edit) return false;

    const { wireId, endpoint } = edit;
    const wire = this.wires().find(w => w.id === wireId);
    if (!wire) return false;

    const newTerminal = { componentId, portId };
    const other = endpoint === 'from' ? wire.to : wire.from;

    if (
      this.sameTerminal(other, newTerminal) ||
      other.componentId === newTerminal.componentId ||
      this.wires().some(
        w =>
          w.id !== wireId &&
          this.sameWire(
            w,
            endpoint === 'from' ? newTerminal : wire.from,
            endpoint === 'from' ? wire.to : newTerminal
          )
      )
    ) {
      this.setWireEditTarget(null);
      this.pushLog?.('Invalid wire edit', 'warn');
      return false;
    }

    this.remember?.();

    this.setWires((items) =>
      items.map((w) =>
        w.id === wireId ? { ...w, [endpoint]: newTerminal } : w
      )
    );

    this.setWireEditTarget(null);
    this.markChanged?.('Wire updated');

    return true;
  }

  clearSelection() {
    this.setSelection({ type: null, id: null });
  }

  connectTerminals(from, to, anchors = []) {
    if (
      !from ||
      !to ||
      this.sameTerminal(from, to) ||
      from.componentId === to.componentId ||
      this.wires().some((w) => this.sameWire(w, from, to))
    ) {
      this.setPendingPort(null);
      this.pushLog?.('Wire was not connected', 'warn');
      return false;
    }

    this.remember?.();

    this.setWires((items) => [
      ...items,
      { id: `wire_${this.nextWire++}`, from, to, anchors }
    ]);

    this.setPendingPort(null);
    this.markChanged?.('Wire connected');

    return true;
  }

  connectPort(componentId, portId) {
    const next = { componentId, portId };
    const edit = this.wireEditTarget();

    if (edit) {
      this.finishWireEdit(componentId, portId);
      return;
    }

    const current = this.pendingPort();

    this.setSelection({ type: 'component', id: componentId });

    if (!current) {
      this.setPendingPort(next);
      return;
    }

    if (!this.sameTerminal(current, next)) {
      this.connectTerminals(current, next);
    }

    this.setPendingPort(null);
  }

  tryStartWireEditFromTerminal(componentId, portId) {
    const wire = this.wires().find(
      w =>
        (w.from.componentId === componentId && w.from.portId === portId) ||
        (w.to.componentId === componentId && w.to.portId === portId)
    );

    if (!wire) return false;

    const endpoint =
      wire.from.componentId === componentId && wire.from.portId === portId
        ? 'from'
        : 'to';

    this.beginWireEdit(wire.id, endpoint);
    return true;
  }

  deleteSelected() {
    const item = this.selection();
    this.deleteItem?.(item.type, item.id);
  }

  updateAnchor(wireId, anchorIndex, x, y) {
    this.remember?.();

    this.setWires((items) =>
      items.map((item) => {
        if (item.id !== wireId) return item;

        const anchors = [...(item.anchors || [])];
        anchors[anchorIndex] = { x, y };

        return { ...item, anchors };
      })
    );

    this.markChanged?.('Wire anchor moved');
  }
}

export { WireManager };