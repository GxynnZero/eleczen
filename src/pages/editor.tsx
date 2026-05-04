import { Canvas, ComponentsPanel, ConsolePanel, PropertiesPanel, ToolBar, ToolsPanel, TopBar } from "../components";
import { SplitPane } from "solid-split-pane";
const SplitPaneAny = SplitPane as any;
import { Show } from 'solid-js';
import { settings } from '../utils/simulation';
import { cm, wm, es, sm } from '../utils/simulation/store';
import { CanvasProvider } from '../utils/canvas/canvasCtx';

function EditorPage() {
    return (
        <div class="flex h-screen w-screen flex-col overflow-hidden">
            <header class="flex flex-col border-b border-white/10 bg-[#05070b]/90 backdrop-blur-2xl">
                <ToolBar />
            </header>

            <SplitPaneAny
                class="flex-1"
                direction="vertical"
                sizes={[72, 28]}
                minSize={[240, 180]}
                gutterSize={8}
                gutterClass="split-gutter split-gutter-horizontal"
            >
                <div class="flex flex-col h-full">
                    <div class="flex flex-1 overflow-hidden">
                        <aside class="w-16 shrink-0 border-r border-white/10">
                            <ToolsPanel />
                        </aside>

                        <SplitPaneAny
                            sizes={[20, 60, 20]}
                            minSize={[220, 400, 260]}
                            gutterSize={8}
                            gutterClass="split-gutter split-gutter-vertical"
                        >
                            <ComponentsPanel />

                            {/* Canvas wrapped in its context provider */}
                            <CanvasProvider cm={cm} wm={wm} es={es} sm={sm}>
                                <Canvas />
                            </CanvasProvider>

                            <PropertiesPanel />
                        </SplitPaneAny>
                    </div>
                </div>

                <Show when={settings().console}>
                    <ConsolePanel />
                </Show>
            </SplitPaneAny>
        </div>
    );
}

export default EditorPage;