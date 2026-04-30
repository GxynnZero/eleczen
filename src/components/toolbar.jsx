import { createSignal, onCleanup, onMount } from "solid-js";
import {
    analysisMode,
    clearAll,
    duplicateSelected,
    deleteSelected,
    future,
    history,
    loadDemo,
    loadSavedProject,
    redo,
    resetView,
    runSimulation,
    saveProject,
    serializeProject,
    setAnalysisMode,
    setOption,
    settings,
    simulationRunning,
    undo,
    zoomBy,
} from '../store/state'
import { BatteryCharging, Lightbulb, Maximize2, Play, Redo2, Undo2, WavesHorizontal, Zap, ZoomIn, ZoomOut } from "lucide-solid";

const ToolBar = () => {
    let importInput;
    let menuRef;

    const [activeMenu, setActiveMenu] = createSignal(null); // file | edit | view | graph | settings | help
    const [settingsTab, setSettingsTab] = createSignal('view');
    const closeMenu = () => setActiveMenu(null);
    const toggleMenu = (menu, e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu() === menu ? null : menu);
    };

    function downloadText(filename, text, type = 'text/plain') {
        const url = URL.createObjectURL(new Blob([text], { type }));
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
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



    function OptionsPanel() {
        const options = () => settings();
        const tab = () => settingsTab();

        const tabButton = (value, label) => (
            <button
                class={`rounded-full px-3 py-1 text-xs font-semibold transition ${tab() === value ? 'bg-white/10 text-white' : 'bg-transparent text-slate-300 hover:bg-white/5'}`}
                onClick={() => setSettingsTab(value)}
            >
                {label}
            </button>
        );

        return (
            <section class="options">
                <div class="mb-4 flex items-center gap-2">
                    {tabButton('view', 'View')}
                    {tabButton('routing', 'Routing')}
                    {tabButton('simulation', 'Simulation')}
                </div>

                {tab() === 'view' && (
                    <div class="rounded-3xl border border-white/10 bg-[#0b0f16]/80 p-4 space-y-4">
                        <Toggle
                            label="Grid"
                            checked={options().grid}
                            onChange={(v) => setOption('grid', v)}
                        />
                        <Toggle
                            label="Console"
                            checked={options().console}
                            onChange={(v) => setOption('console', v)}
                        />
                        <Toggle
                            label="Labels"
                            checked={options().showLabels}
                            onChange={(v) => setOption('showLabels', v)}
                        />
                    </div>
                )}

                {tab() === 'routing' && (
                    <div class="rounded-3xl border border-white/10 bg-[#0b0f16]/80 p-4 space-y-4">
                        <Toggle
                            label="Snap"
                            checked={options().snap}
                            onChange={(v) => setOption('snap', v)}
                        />
                        <label class="flex flex-col gap-2 text-sm text-slate-200">
                            <span class="font-medium">Snap Size</span>
                            <input
                                type="range"
                                min="4"
                                max="48"
                                step="4"
                                value={options().snapSize}
                                onInput={(e) => setOption('snapSize', Number(e.currentTarget.value))}
                                class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400"
                            />
                            <span class="text-xs text-slate-400">{options().snapSize}px</span>
                        </label>
                        <label class="flex flex-col gap-2 text-sm text-slate-200">
                            <span class="font-medium">Routing Mode</span>
                            <select
                                value={options().routing}
                                onChange={(e) => setOption('routing', e.currentTarget.value)}
                                class="rounded-2xl border border-white/10 bg-black/80 px-3 py-2 text-sm text-white outline-none"
                            >
                                <option value="smart">Smart</option>
                                <option value="straight">Straight</option>
                            </select>
                        </label>
                    </div>
                )}

                {tab() === 'simulation' && (
                    <div class="rounded-3xl border border-white/10 bg-[#0b0f16]/80 p-4 space-y-4">
                        <label class="flex flex-col gap-2 text-sm text-slate-200">
                            <span class="font-medium">Engine</span>
                            <select
                                value={options().engine}
                                onChange={(e) => setOption('engine', e.currentTarget.value)}
                                class="rounded-2xl border border-white/10 bg-black/80 px-3 py-2 text-sm text-white outline-none"
                            >
                                <option value="eecircuit">eecircuit</option>
                                <option value="local">local</option>
                            </select>
                        </label>
                        <Toggle
                            label="Auto Run"
                            checked={options().autoRun}
                            onChange={(v) => setOption('autoRun', v)}
                        />
                    </div>
                )}
            </section>
        );
    }


    const importProject = async (file) => {
        if (!file) return;
        loadProject(await file.text());
        importInput.value = '';
    };

    const handleShortcut = (event) => {
        const isCommand = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;

        if (!isCommand && event.key !== 'Delete' && event.key !== 'Escape') return;

        switch (event.key.toLowerCase()) {
            case 'z':
                if (isCommand) {
                    event.preventDefault();
                    if (isShift) {
                        redo();
                    } else {
                        undo();
                    }
                }
                break;
            case 'y':
                if (isCommand) {
                    event.preventDefault();
                    redo();
                }
                break;
            case 's':
                if (isCommand) {
                    event.preventDefault();
                    saveProject();
                }
                break;
            case 'd':
                if (isCommand) {
                    event.preventDefault();
                    duplicateSelected();
                }
                break;
            case 'r':
                if (isCommand) {
                    event.preventDefault();
                    runSimulation();
                }
                break;
            case 'delete':
                event.preventDefault();
                deleteSelected();
                break;
            case 'escape':
                closeMenu();
                break;
            default:
                break;
        }
    };

    onMount(() => {
        window.addEventListener('click', closeMenu);
        window.addEventListener('keydown', handleShortcut);
    });

    onCleanup(() => {
        window.removeEventListener('click', closeMenu);
        window.removeEventListener('keydown', handleShortcut);
    });

    const navBtn = (name) =>
        `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu() === name
            ? 'bg-white/10 text-white shadow-inner'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`;

    const iconBtn =
        'h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-40 disabled:pointer-events-none';
    return (
        <div class="relative px-4 py-3">
            <div class="flex items-center gap-2">
                {/* MENUS */}
                <button
                    class={navBtn('file')}
                    onClick={(e) => toggleMenu('file', e)}
                >
                    File
                </button>

                <button
                    class={navBtn('edit')}
                    onClick={(e) => toggleMenu('edit', e)}
                >
                    Edit
                </button>

                <button
                    class={navBtn('settings')}
                    onClick={(e) => toggleMenu('settings', e)}
                >
                    Settings
                </button>

                <button
                    class={navBtn('view')}
                    onClick={(e) => toggleMenu('view', e)}
                >
                    View
                </button>

                <button
                    class={navBtn('graph')}
                    onClick={(e) => toggleMenu('graph', e)}
                >
                    Graph
                </button>

                <button
                    class={navBtn('help')}
                    onClick={(e) => toggleMenu('help', e)}
                >
                    Help
                </button>

                {/* DIVIDER */}
                <div class="mx-2 h-8 w-px bg-white/10" />

                {/* ACTIONS */}
                <div class="ml-auto flex items-center gap-2">
                    <button
                        class={iconBtn}
                        onClick={undo}
                        disabled={!history().length}
                        title="Undo"
                    >
                        <Undo2 size={16} />
                    </button>

                    <button
                        class={iconBtn}
                        onClick={redo}
                        disabled={!future().length}
                        title="Redo"
                    >
                        <Redo2 size={16} />
                    </button>

                    <button
                        class={iconBtn}
                        onClick={() => zoomBy(-0.1)}
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </button>

                    <button
                        class={iconBtn}
                        onClick={() => zoomBy(0.1)}
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </button>

                    <button
                        class={iconBtn}
                        onClick={resetView}
                        title="Reset View"
                    >
                        <Maximize2 size={16} />
                    </button>

                    <button
                        class="ml-2 h-10 px-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 text-black font-semibold shadow-[0_0_25px_rgba(34,211,238,.35)] transition hover:scale-[1.03] active:scale-95 disabled:opacity-50"
                        onClick={runSimulation}
                        disabled={simulationRunning()}
                    >
                        <Play size={16} class="fill-current" />
                        Run
                    </button>
                </div>
            </div>

            {/* FILE MENU */}
            <Show when={activeMenu() === 'file'}>
                <div
                    ref={menuRef}
                    class="absolute top-14 left-0 z-50 w-60 rounded-2xl border border-white/10 bg-[#0b0f16]/95 backdrop-blur-2xl shadow-2xl p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        class="menu-item"
                        onClick={() => {
                            loadDemo();
                            closeMenu();
                        }}
                    >
                        Demo Project
                    </button>

                    <button
                        class="menu-item"
                        onClick={() => {
                            saveProject();
                            closeMenu();
                        }}
                    >
                        Save Project
                    </button>

                    <button
                        class="menu-item"
                        onClick={() => {
                            loadSavedProject();
                            closeMenu();
                        }}
                    >
                        Load Saved
                    </button>

                    <button
                        class="menu-item"
                        onClick={() => importInput.click()}
                    >
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

                    <div class="my-1 h-px bg-white/10" />

                    <button
                        class="menu-item text-red-400 hover:bg-red-500/10"
                        onClick={() => {
                            clearAll();
                            closeMenu();
                        }}
                    >
                        Clear All
                    </button>
                </div>
            </Show>

            {/* EDIT MENU */}
            <Show when={activeMenu() === 'edit'}>
                <div
                    class="absolute top-14 left-20 z-50 w-60 rounded-2xl border border-white/10 bg-[#0b0f16]/95 backdrop-blur-2xl shadow-2xl p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button class="menu-item" onClick={() => { undo(); closeMenu(); }} disabled={!history().length}>Undo</button>
                    <button class="menu-item" onClick={() => { redo(); closeMenu(); }} disabled={!future().length}>Redo</button>
                    <button class="menu-item" onClick={() => { duplicateSelected(); closeMenu(); }}>Duplicate Selection</button>
                    <button class="menu-item" onClick={() => { deleteSelected(); closeMenu(); }}>Delete Selection</button>
                    <div class="my-1 h-px bg-white/10" />
                    <button class="menu-item text-red-400 hover:bg-red-500/10" onClick={() => { clearAll(); closeMenu(); }}>Clear Workspace</button>
                </div>
            </Show>

            {/* VIEW MENU */}
            <Show when={activeMenu() === 'view'}>
                <div
                    class="absolute top-14 left-28 z-50 w-64 rounded-2xl border border-white/10 bg-[#0b0f16]/95 backdrop-blur-2xl shadow-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button class="menu-item" onClick={() => { zoomBy(-0.1); closeMenu(); }}>Zoom Out</button>
                    <button class="menu-item" onClick={() => { zoomBy(0.1); closeMenu(); }}>Zoom In</button>
                    <button class="menu-item" onClick={() => { resetView(); closeMenu(); }}>Reset View</button>
                    <div class="my-1 h-px bg-white/10" />
                    <label class="menu-item flex items-center justify-between gap-3">
                        <span>Grid</span>
                        <input type="checkbox" checked={settings().grid} onChange={(e) => setOption('grid', e.currentTarget.checked)} />
                    </label>
                    <label class="menu-item flex items-center justify-between gap-3">
                        <span>Snap</span>
                        <input type="checkbox" checked={settings().snap} onChange={(e) => setOption('snap', e.currentTarget.checked)} />
                    </label>
                </div>
            </Show>

            {/* GRAPH MENU */}
            <Show when={activeMenu() === 'graph'}>
                <div
                    class="absolute top-14 left-36 z-50 w-72 rounded-2xl border border-white/10 bg-[#0b0f16]/95 backdrop-blur-2xl shadow-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button class="menu-item" onClick={() => { setOption('console', true); closeMenu(); }}>Show Console</button>
                    <button class="menu-item" onClick={() => { runSimulation(); closeMenu(); }}>Run Simulation</button>
                    <div class="my-1 h-px bg-white/10" />
                    <div class="px-2 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">Analysis Mode</div>
                    <button class={`menu-item ${analysisMode() === 'dc' ? 'bg-white/10' : ''}`} onClick={() => { setAnalysisMode('dc'); closeMenu(); }}>DC</button>
                    <button class={`menu-item ${analysisMode() === 'ac' ? 'bg-white/10' : ''}`} onClick={() => { setAnalysisMode('ac'); closeMenu(); }}>AC</button>
                    <button class={`menu-item ${analysisMode() === 'transient' ? 'bg-white/10' : ''}`} onClick={() => { setAnalysisMode('transient'); closeMenu(); }}>Transient</button>
                </div>
            </Show>

            {/* SETTINGS MENU */}
            <Show when={activeMenu() === 'settings'}>
                <div
                    class="absolute top-14 left-24 z-50 w-80 rounded-2xl border border-white/10 bg-[#0b0f16]/95 backdrop-blur-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <OptionsPanel />
                </div>
            </Show>

            {/* HELP MENU */}
            <Show when={activeMenu() === 'help'}>
                <div
                    class="absolute top-14 left-32 z-50 w-80 rounded-2xl border border-white/10 bg-[#0b0f16]/95 backdrop-blur-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div class="mb-3 text-sm font-semibold text-white">Help</div>
                    <div class="space-y-3 text-sm text-slate-200">
                        <div>
                            <div class="text-xs uppercase tracking-[0.3em] text-slate-500">Shortcuts</div>
                            <ul class="mt-2 space-y-1">
                                <li><span class="font-semibold">Ctrl/Cmd + Z</span> — Undo</li>
                                <li><span class="font-semibold">Ctrl/Cmd + Y</span> — Redo</li>
                                <li><span class="font-semibold">Ctrl/Cmd + S</span> — Save</li>
                                <li><span class="font-semibold">Ctrl/Cmd + D</span> — Duplicate</li>
                                <li><span class="font-semibold">Ctrl/Cmd + R</span> — Run</li>
                                <li><span class="font-semibold">Delete</span> — Delete selection</li>
                                <li><span class="font-semibold">Escape</span> — Close menus</li>
                            </ul>
                        </div>
                        <div>
                            <div class="text-xs uppercase tracking-[0.3em] text-slate-500">Quick Tips</div>
                            <ul class="mt-2 space-y-1">
                                <li>Use the <span class="font-semibold">Edit</span> menu for undo/redo.</li>
                                <li>Switch graph modes from the <span class="font-semibold">Graph</span> menu.</li>
                                <li>Enable/disable panels from <span class="font-semibold">Settings</span>.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Show>

            {/* FILE INPUT */}
            <input
                ref={importInput}
                type="file"
                class="hidden"
                accept=".json"
                onChange={(e) => importProject(e.currentTarget.files?.[0])}
            />
        </div>
    );
};

export default ToolBar;