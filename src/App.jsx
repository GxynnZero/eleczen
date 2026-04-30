import { A, Route, Router } from '@solidjs/router';
import {
  createSignal,
  createMemo,
  For,
  Show,
  onMount,
  onCleanup,
} from 'solid-js';

import {
  BatteryCharging,
  Cable,
  CircleOff,
  Eraser,
  Lightbulb,
  Maximize2,
  MousePointer2,
  Move,
  Play,
  Plus,
  Redo2,
  Undo2,
  Waves,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-solid';

import Canvas from './canvas/Canvas.jsx';
import MiniMap from './canvas/MiniMap.jsx';
import Library from './canvas/library.jsx';

import {
  PARTS,
  addComponent,
  clearAll,
  components,
  future,
  history,
  loadDemo,
  loadProject,
  loadSavedProject,
  partValue,
  redo,
  resetView,
  runSimulation,
  saveProject,
  selectComponent,
  selectedComponent,
  selectedWire,
  serializeProject,
  setComponentValue,
  setOption,
  settings,
  simulationRunning,
  undo,
  wires,
  zoomBy,
} from './store/state.js';

import { SplitPane } from 'solid-split-pane';

/* ---------------------------------- */
/* GLOBAL UI STATE */
/* ---------------------------------- */

const [activeMenu, setActiveMenu] = createSignal(null); // file | settings | null

let importInput;
let menuRef;

/* ---------------------------------- */
/* HELPERS */
/* ---------------------------------- */

function downloadText(filename, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const icons = {
  battery: BatteryCharging,
  resistor: Zap,
  led: Lightbulb,
  capacitor: Waves,
  switch: Lightbulb,
};

const format = (value, unit = '') =>
  Number.isFinite(value) ? `${value.toFixed(2)} ${unit}` : '-';

const formatCurrent = (amps) =>
  amps ? `${(amps * 1000).toFixed(1)} mA` : '0 mA';

/* ---------------------------------- */
/* COMPONENTS */
/* ---------------------------------- */

function Metric(props) {
  return (
    <div class="metric">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  );
}

function Toggle(props) {
  return (
    <label class="toggle">
      <span>{props.label}</span>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
      />
      <i />
    </label>
  );
}

function ToolButton(props) {
  const Icon = props.icon;

  return (
    <button
      class={settings().tool === props.value ? 'active' : ''}
      onClick={() => setOption('tool', props.value)}
    >
      <Icon size={16} />
    </button>
  );
}

function ToolsPanel() {
  return (
    <section class="actions p-2">
      <div class="tool-grid">
        <ToolButton value="select" icon={MousePointer2} />
        <ToolButton value="wire" icon={Cable} />
        <ToolButton value="pan" icon={Move} />
        <ToolButton value="delete" icon={Eraser} />
      </div>
    </section>
  );
}

function OptionsPanel() {
  const options = () => settings();

  return (
    <section class="options">
      <div class="panel-title compact">Options</div>

      <Toggle
        label="Grid"
        checked={options().grid}
        onChange={(v) => setOption('grid', v)}
      />

      <Toggle
        label="Snap"
        checked={options().snap}
        onChange={(v) => setOption('snap', v)}
      />

      <Toggle
        label="Labels"
        checked={options().showLabels}
        onChange={(v) => setOption('showLabels', v)}
      />

      <Toggle
        label="Auto Run"
        checked={options().autoRun}
        onChange={(v) => setOption('autoRun', v)}
      />
    </section>
  );
}

function ComponentLibrary() {
  return (
    <aside class="panel library h-full">
      <MiniMap />

      <Library />

      <div class="panel-title compact">Parts On Board</div>

      <div class="component-list">
        <For each={components()}>
          {(component) => {
            const Icon = icons[component.type] || Zap;

            return (
              <button
                class="component-row"
                onClick={() => selectComponent(component.id)}
              >
                <Icon size={14} />
                <span>{component.id}</span>
              </button>
            );
          }}
        </For>
      </div>
    </aside>
  );
}

function Inspector() {
  const component = createMemo(() => selectedComponent());
  const wire = createMemo(() => selectedWire());

  return (
    <section class="panel inspector h-full overflow-auto">
      <div class="panel-title">Inspector</div>

      <Show when={component()}>
        <Metric
          label="Current"
          value={formatCurrent(component()?.state?.current)}
        />

        <Metric
          label="Voltage"
          value={format(component()?.state?.voltage, 'V')}
        />

        <label class="field editable">
          <span>Value</span>
          <input
            type="number"
            value={partValue(component())}
            onChange={(e) =>
              setComponentValue(component().id, e.currentTarget.value)
            }
          />
        </label>
      </Show>

      <Show when={wire()}>
        <div class="field">
          <span>Wire</span>
          <strong>{wire()?.id}</strong>
        </div>
      </Show>

      <Show when={!component() && !wire()}>
        <div class="empty-state">
          <CircleOff size={20} />
          <span>No selection</span>
        </div>
      </Show>
    </section>
  );
}

function RightRail() {
  return (
    <aside class="side h-full overflow-auto">
      <Inspector />
    </aside>
  );
}

/* ---------------------------------- */
/* TOOLBAR */
/* ---------------------------------- */

function Toolbar() {
  const closeMenu = () => setActiveMenu(null);

  const toggleMenu = (menu, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu() === menu ? null : menu);
  };

  const importProject = async (file) => {
    if (!file) return;
    loadProject(await file.text());
    importInput.value = '';
  };

  onMount(() => {
    window.addEventListener('click', closeMenu);
  });

  onCleanup(() => {
    window.removeEventListener('click', closeMenu);
  });

  return (
    <header class="toolbar flex flex-col">
      {/* HEADER */}
      <div class="w-full border-b border-white/10">
        <div class="brand">
          <div class="logo">EZ</div>
          <h1>ElecZen</h1>
        </div>
      </div>

      {/* MENU BAR */}
      <div class="w-full px-3 border-b border-white/10 relative">
        <div class="flex items-center gap-2 py-2">

          {/* FILE */}
          <button
            class={`px-3 py-1 rounded-lg ${activeMenu() === 'file'
                ? 'bg-white/10'
                : 'hover:bg-white/5'
              }`}
            onClick={(e) => toggleMenu('file', e)}
          >
            File
          </button>

          {/* SETTINGS */}
          <button
            class={`px-3 py-1 rounded-lg ${activeMenu() === 'settings'
                ? 'bg-white/10'
                : 'hover:bg-white/5'
              }`}
            onClick={(e) => toggleMenu('settings', e)}
          >
            Settings
          </button>

          {/* ACTIONS */}
          <div class="actions ml-auto flex gap-2">
            <button onClick={undo} disabled={!history().length}>
              <Undo2 size={16} />
            </button>

            <button onClick={redo} disabled={!future().length}>
              <Redo2 size={16} />
            </button>

            <button onClick={() => zoomBy(-0.1)}>
              <ZoomOut size={16} />
            </button>

            <button onClick={() => zoomBy(0.1)}>
              <ZoomIn size={16} />
            </button>

            <button onClick={resetView}>
              <Maximize2 size={16} />
            </button>

            <button
              class="run"
              onClick={runSimulation}
              disabled={simulationRunning()}
            >
              <Play size={16} class="fill-current" />
            </button>
          </div>
        </div>

        {/* FILE MENU */}
        <Show when={activeMenu() === 'file'}>
          <div
            ref={menuRef}
            class="absolute top-12 left-3 z-50 w-52 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button class="menu-item" onClick={() => { loadDemo(); closeMenu(); }}>
              Demo Project
            </button>

            <button class="menu-item" onClick={() => { saveProject(); closeMenu(); }}>
              Save Project
            </button>

            <button class="menu-item" onClick={() => { loadSavedProject(); closeMenu(); }}>
              Load Saved
            </button>

            <button class="menu-item" onClick={() => importInput.click()}>
              Import JSON
            </button>

            <button
              class="menu-item"
              onClick={() => {
                downloadText(
                  'eleczen-project.json',
                  serializeProject(),
                  'application/json'
                );
                closeMenu();
              }}
            >
              Export JSON
            </button>

            <button
              class="menu-item text-red-400"
              onClick={() => {
                clearAll();
                closeMenu();
              }}
            >
              Clear All
            </button>
          </div>
        </Show>

        {/* SETTINGS MENU */}
        <Show when={activeMenu() === 'settings'}>
          <div
            class="absolute top-12 left-24 z-50 w-52 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <OptionsPanel />
          </div>
        </Show>

        {/* HIDDEN FILE INPUT */}
        <input
          ref={importInput}
          type="file"
          class="hidden"
          accept=".json"
          onChange={(e) => importProject(e.currentTarget.files?.[0])}
        />
      </div>
    </header>
  );
}

/* ---------------------------------- */
/* PAGE */
/* ---------------------------------- */

function EditorPage() {
  return (
    <div class="h-screen w-screen overflow-hidden">
      <Toolbar />

      <div class="flex h-[calc(100vh-96px)]">
        {/* Fixed Left Tool Rail */}
        <aside class="w-16 shrink-0 border-r border-white/10">
          <ToolsPanel />
        </aside>

        <SplitPane
          sizes={[20, 60, 20]}
          minSize={[220, 400, 260]}
          gutterSize={8}
          gutterClass="split-gutter split-gutter-vertical"
        >
          <ComponentLibrary />
          <Canvas />
          <RightRail />
        </SplitPane>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Route path="/" component={EditorPage} />
      <Route path="/netlist" component={EditorPage} />
      <Route path="/console" component={EditorPage} />
    </Router>
  );
}