import { createSignal, onCleanup, onMount } from "solid-js";
import {
    clearAll, future, history, loadDemo, loadSavedProject, redo, resetView, runSimulation, saveProject, serializeProject, setOption, settings, simulationRunning, undo, zoomBy
} from '../store/state'
import { BatteryCharging, Lightbulb, Maximize2, Play, Redo2, Undo2, WavesHorizontal, Zap, ZoomIn, ZoomOut } from "lucide-solid";

const ToolBar = () => {
    let importInput;
    let menuRef;

    const [activeMenu, setActiveMenu] = createSignal(null); // file | settings | null
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
                    class={navBtn('settings')}
                    onClick={(e) => toggleMenu('settings', e)}
                >
                    Settings
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

            {/* SETTINGS MENU */}
            <Show when={activeMenu() === 'settings'}>
                <div
                    class="absolute top-14 left-24 z-50 w-72 rounded-2xl border border-white/10 bg-[#0b0f16]/95 backdrop-blur-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <OptionsPanel />
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