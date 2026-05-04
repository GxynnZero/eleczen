import { createSignal, Accessor, Setter } from 'solid-js';
import { clone, markChanged } from './helper';
import { Component, Wire, Settings, Viewport } from '../../types';
import { ComponentManager } from './component';
import { WireManager } from './wire';

class EditorSystem {
  cm: ComponentManager;
  wm: WireManager;
  applySimulation: (() => Promise<any>) | undefined;
  setSimulation: ((val: any) => void) | undefined;
  ready: (() => boolean) | undefined;
  mode: Record<string, string>;
  history: Accessor<{ components: Component[]; wires: Wire[] }[]>;
  setHistory: Setter<{ components: Component[]; wires: Wire[] }[]>;
  future: Accessor<{ components: Component[]; wires: Wire[] }[]>;
  setFuture: Setter<{ components: Component[]; wires: Wire[] }[]>;
  viewport: Accessor<Viewport>;
  setViewport: Setter<Viewport>;
  settings: Accessor<Settings>;
  setSettings: Setter<Settings>;
  logs: Accessor<{ level: string; text: string }[]>;
  setLogs: Setter<{ level: string; text: string }[]>;

  constructor(componentManager: ComponentManager, wireManager: WireManager, deps = {} as any) {
    this.cm = componentManager;
    this.wm = wireManager;

    // 🔹 injected dependencies
    this.applySimulation = deps.applySimulation;
    this.setSimulation = deps.setSimulation;
    this.ready = deps.ready;

    // mode
    this.mode = {
      select: "select",
      edit: "edit",
      run: "run"
    };

    // signals
    const [history, setHistory] = createSignal([]);
    const [future, setFuture] = createSignal([]);
    const [viewport, setViewport] = createSignal({ position: { x: 0, y: 0 }, zoom: 1 });

    const [settings, setSettings] = createSignal({
      autoRun: false,
      console: true,
      engine: 'eecircuit',
      grid: true,
      routing: 'smart',
      showLabels: true,
      snap: true,
      snapSize: 12,
      tool: 'select',
      consoleMaximized: false,
    });

    const [logs, setLogs] = createSignal([
      { level: 'info', text: 'Demo circuit loaded' }
    ]);

    this.history = history;
    this.setHistory = setHistory;
    this.future = future;
    this.setFuture = setFuture;
    this.viewport = viewport;
    this.setViewport = setViewport;
    this.settings = settings;
    this.setSettings = setSettings;
    this.logs = logs;
    this.setLogs = setLogs;
  }

  // 🔹 logs
  pushLog(text, level = 'info') {
    this.setLogs((items) => [{ level, text }, ...items].slice(0, 18));
  }

  // 🔹 transforms
  rotateSelected() {
    const component = this.cm.selectedComponent();
    if (!component) return;

    this.remember();

    this.cm.setComponents((items) =>
      items.map((item) =>
        item.id === component.id
          ? { ...item, rotation: ((item.rotation || 0) + 90) % 360 }
          : item
      )
    );

    this._markChanged('Rotated selection');
  }

  mirrorSelected() {
    const component = this.cm.selectedComponent();
    if (!component) return;

    this.remember();

    this.cm.setComponents((items) =>
      items.map((item) =>
        item.id === component.id
          ? { ...item, mirror: !item.mirror }
          : item
      )
    );

    this._markChanged('Mirrored selection');
  }

  // 🔹 history
  remember() {
    this.setHistory((items) => [
      ...items.slice(-39),
      {
        components: clone(this.cm.components()),
        wires: clone(this.wm.wires())
      }
    ]);
    this.setFuture([]);
  }

  undo() {
    const previous = this.history().at(-1);
    if (!previous) return;

    this.setFuture((items) => [
      ...items,
      {
        components: clone(this.cm.components()),
        wires: clone(this.wm.wires())
      }
    ]);

    this.setHistory((items) => items.slice(0, -1));

    this.cm.setComponents(previous.components.map(this.cm.withState));
    this.wm.setWires(previous.wires);

    this.wm.clearSelection();
    this.wm.setPendingPort(null);

    this._markChanged('Undo');
  }

  redo() {
    const next = this.future().at(-1);
    if (!next) return;

    this.setHistory((items) => [
      ...items,
      {
        components: clone(this.cm.components()),
        wires: clone(this.wm.wires())
      }
    ]);

    this.setFuture((items) => items.slice(0, -1));

    this.cm.setComponents(next.components.map(this.cm.withState));
    this.wm.setWires(next.wires);

    this.wm.clearSelection();
    this.wm.setPendingPort(null);

    this._markChanged('Redo');
  }

  // 🔹 delete
  deleteItem(type, id) {
    if (!type || !id) return;

    this.remember();

    if (type === 'wire') {
      this.wm.setWires((list) => list.filter((w) => w.id !== id));
    }

    if (type === 'component') {
      this.cm.setComponents((list) =>
        list.filter((c) => c.id !== id)
      );

      this.wm.setWires((list) =>
        list.filter(
          (w) =>
            w.from.componentId !== id &&
            w.to.componentId !== id
        )
      );
    }

    this.wm.clearSelection();
    this.wm.setPendingPort(null);

    this._markChanged('Selection deleted');
  }

  // 🔹 settings
  toggleConsoleMaximized() {
    this.setSettings((prev) => ({
      ...prev,
      consoleMaximized: !prev.consoleMaximized
    }));
  }

  setOption(name, value) {
    this.setSettings((cur) => ({ ...cur, [name]: value }));
    this.pushLog(`${name} set to ${value}`);

    if (name === 'autoRun' && value) {
      this.applySimulation?.().then((res) =>
        this.pushLog(res.message, res.ok ? 'success' : 'warn')
      );
    }
  }

  // 🔹 workspace
  clearAll() {
    this.remember();

    this.cm.setComponents([]);
    this.wm.setWires([]);

    this.wm.clearSelection();
    this.wm.setPendingPort(null);

    this._markChanged('Workspace cleared');
  }

  // 🔹 serialization
  serializeProject() {
    return JSON.stringify({
      version: 1,
      components: this.cm.components().map(({ state, ...c }) => c),
      wires: this.wm.wires(),
      settings: this.settings()
    }, null, 2);
  }

  loadProject(data) {
    const project = typeof data === 'string' ? JSON.parse(data) : data;

    this.remember();

    this.cm.setComponents(
      (project.components || []).map(this.cm.withState)
    );

    this.wm.setWires(project.wires || []);

    this.setSettings((cur) => ({
      ...cur,
      ...(project.settings || {})
    }));

    this.wm.setSelection(null);
    this.wm.setPendingPort(null);

    this._markChanged('Project loaded');
  }

  saveProject() {
    localStorage.setItem('eleczen.project', this.serializeProject());
    this.pushLog('Project saved locally', 'success');
  }

  loadSavedProject() {
    const saved = localStorage.getItem('eleczen.project');
    if (!saved) {
      this.pushLog('No saved project found', 'warn');
      return;
    }
    this.loadProject(saved);
  }

  // 🔹 viewport
  zoomBy(delta) {
    this.setViewport((view) => ({
      ...view,
      zoom: Math.min(3, Math.max(0.35, Number((view.zoom + delta).toFixed(2))))
    }));
  }

  setZoom(zoom) {
    this.setViewport((view) => ({
      ...view,
      zoom: Math.min(3, Math.max(0.35, zoom))
    }));
  }

  panViewport(dx, dy) {
    this.setViewport((view) => ({
      ...view,
      position: {
        x: view.position.x + dx,
        y: view.position.y + dy
      }
    }));
  }

  resetView() {
    this.setViewport({ position: { x: 0, y: 0 }, zoom: 1 });
  }

  // 🔹 internal wrapper (clean)
  _markChanged(message) {
    markChanged({
      message,
      settings: this.settings,
      pushLog: this.pushLog.bind(this),
      applySimulation: this.applySimulation,
      setSimulation: this.setSimulation,
      ready: this.ready,
      cm: this.cm
    });
  }
}

export { EditorSystem };