import { createSignal, Accessor, Setter } from "solid-js";
import { sameTerminal, sameWire } from "./helper";
import { Terminal, Wire, Point, Selection, ID } from "~/types";
import { ComponentManager } from "./component";

type WireEditTarget = {
  wireId: ID;
  endpoint: "from" | "to";
};

class WireManager {
  remember?: () => void;
  pushLog?: (msg: string, level?: string) => void;
  markChanged?: (msg: string) => void;
  deleteItem?: (type: string, id: ID | null) => void;

  demoWires: Wire[];
  nextWire: number;

  wires: Accessor<Wire[]>;
  setWires: Setter<Wire[]>;

  pendingPort: Accessor<Terminal | null>;
  setPendingPort: Setter<Terminal | null>;

  wireEditTarget: Accessor<WireEditTarget | null>;
  setWireEditTarget: Setter<WireEditTarget | null>;

  selection: Accessor<Selection>;
  setSelection: Setter<Selection>;

  constructor(cm: ComponentManager, deps: any = {}) {
    this.remember = deps.remember;
    this.pushLog = deps.pushLog;
    this.markChanged = deps.markChanged;
    this.deleteItem = deps.deleteItem;

    this.demoWires = [
      {
        id: "wire_1",
        from: { componentId: "battery_1", portId: "pos" },
        to: { componentId: "switch_2", portId: "a" },
        anchors: [
          { x: 75.82, y: 360.25 },
          { x: 74.13, y: 143.23 },
        ],
      },
      {
        id: "wire_2",
        from: { componentId: "switch_2", portId: "b" },
        to: { componentId: "resistor_3", portId: "a" },
        anchors: [],
      },
      {
        id: "wire_3",
        from: { componentId: "resistor_3", portId: "b" },
        to: { componentId: "led_4", portId: "anode" },
        anchors: [],
      },
      {
        id: "wire_4",
        from: { componentId: "led_4", portId: "cathode" },
        to: { componentId: "battery_1", portId: "neg" },
        anchors: [
          { x: 740.76, y: 349.52 },
          { x: 740.93, y: 145.95 },
        ],
      },
    ];

    this.nextWire = 5;

    const [wires, setWires] = createSignal<Wire[]>(this.demoWires);
    const [pendingPort, setPendingPort] = createSignal<Terminal | null>(null);
    const [wireEditTarget, setWireEditTarget] =
      createSignal<WireEditTarget | null>(null);

    this.wires = wires;
    this.setWires = setWires;

    this.pendingPort = pendingPort;
    this.setPendingPort = setPendingPort;

    this.wireEditTarget = wireEditTarget;
    this.setWireEditTarget = setWireEditTarget;

    this.selection = cm.selection;
    this.setSelection = cm.setSelection;
  }

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------

  sameTerminal(a: Terminal, b: Terminal) {
    return sameTerminal(a, b);
  }

  sameWire(wire: Wire, from: Terminal, to: Terminal) {
    return sameWire(wire, from, to, this.sameTerminal.bind(this));
  }

  findWire(id: ID) {
    return this.wires().find((w) => w.id === id);
  }

  // ------------------------------------------------------------
  // Selection (🔥 FIXED HERE)
  // ------------------------------------------------------------

  selectedWire() {
    const sel = this.selection();

    if (sel?.type !== "wire") return null;

    return (
      this.wires().find((w) => sel.ids.includes(w.id)) ?? null
    );
  }

  selectWire(id: ID) {
    this.setSelection({ type: "wire", ids: [id] });
  }

  clearSelection() {
    this.setSelection({ type: null, ids: [] });
  }

  // ------------------------------------------------------------
  // Wire Editing
  // ------------------------------------------------------------

  beginWireEdit(wireId: ID, endpoint: "from" | "to") {
    const wire = this.findWire(wireId);
    if (!wire) return;

    this.remember?.();
    this.setSelection({ type: "wire", ids: [wireId] });

    this.setWireEditTarget({ wireId, endpoint });

    this.pushLog?.(`Editing wire ${wireId} (${endpoint})`);
  }

  cancelWireEdit() {
    this.setWireEditTarget(null);
  }

  finishWireEdit(componentId: ID, portId: ID) {
    const edit = this.wireEditTarget();
    if (!edit) return false;

    const wire = this.findWire(edit.wireId);
    if (!wire) return false;

    const newTerminal: Terminal = { componentId, portId };
    const other =
      edit.endpoint === "from" ? wire.to : wire.from;

    const duplicate = this.wires().some(
      (w) =>
        w.id !== wire.id &&
        this.sameWire(
          w,
          edit.endpoint === "from" ? newTerminal : wire.from,
          edit.endpoint === "from" ? wire.to : newTerminal
        )
    );

    if (
      this.sameTerminal(other, newTerminal) ||
      other.componentId === newTerminal.componentId ||
      duplicate
    ) {
      this.setWireEditTarget(null);
      this.pushLog?.("Invalid wire edit", "warn");
      return false;
    }

    this.remember?.();

    this.setWires((prev) =>
      prev.map((w) =>
        w.id === wire.id
          ? { ...w, [edit.endpoint]: newTerminal }
          : w
      )
    );

    this.setWireEditTarget(null);
    this.markChanged?.("Wire updated");

    return true;
  }

  // ------------------------------------------------------------
  // Connection
  // ------------------------------------------------------------

  connectTerminals(
    from: Terminal,
    to: Terminal,
    anchors: Point[] = []
  ) {
    if (
      !from ||
      !to ||
      this.sameTerminal(from, to) ||
      from.componentId === to.componentId ||
      this.wires().some((w) => this.sameWire(w, from, to))
    ) {
      this.setPendingPort(null);
      this.pushLog?.("Wire rejected", "warn");
      return false;
    }

    this.remember?.();

    this.setWires((prev) => [
      ...prev,
      {
        id: `wire_${this.nextWire++}`,
        from,
        to,
        anchors,
      },
    ]);

    this.setPendingPort(null);
    this.markChanged?.("Wire connected");

    return true;
  }

  connectPort(componentId: ID, portId: ID) {
    const next = { componentId, portId };
    const edit = this.wireEditTarget();

    if (edit) {
      this.finishWireEdit(componentId, portId);
      return;
    }

    const current = this.pendingPort();

    this.setSelection({ type: "component", ids: [componentId] });

    if (!current) {
      this.setPendingPort(next);
      return;
    }

    if (!this.sameTerminal(current, next)) {
      this.connectTerminals(current, next);
    }

    this.setPendingPort(null);
  }

  // ------------------------------------------------------------
  // Edit from terminal
  // ------------------------------------------------------------

  tryStartWireEditFromTerminal(componentId: ID, portId: ID) {
    const wire = this.wires().find(
      (w) =>
        (w.from.componentId === componentId &&
          w.from.portId === portId) ||
        (w.to.componentId === componentId &&
          w.to.portId === portId)
    );

    if (!wire) return false;

    const endpoint =
      wire.from.componentId === componentId &&
      wire.from.portId === portId
        ? "from"
        : "to";

    this.beginWireEdit(wire.id, endpoint);
    return true;
  }

  // ------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------

  deleteSelected() {
    const sel = this.selection();
    if (!sel || sel.type === null) return;

    for (const id of sel.ids) {
      this.deleteItem?.(sel.type, id);
    }
  }

  // ------------------------------------------------------------
  // Anchors
  // ------------------------------------------------------------

  updateAnchor(
    wireId: ID,
    anchorIndex: number,
    x: number,
    y: number
  ) {
    this.remember?.();

    this.setWires((prev) =>
      prev.map((w) => {
        if (w.id !== wireId) return w;

        const anchors = [...(w.anchors ?? [])];
        anchors[anchorIndex] = { x, y };

        return { ...w, anchors };
      })
    );

    this.markChanged?.("Wire anchor moved");
  }
}

export { WireManager };