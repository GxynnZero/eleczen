import { Canvas, ComponentsPanel, ConsolePanel, PropertiesPanel, ToolBar, ToolsPanel } from "../components";
import { Panel, PanelGroup, PanelResizeHandle } from "resizable-panels-solid";
import { Show } from 'solid-js';
import { settings } from '../utils/simulation';
import { cm, wm, es, sm, toggleConsoleMaximized } from '../utils/simulation/store';
import { CanvasProvider } from '../utils/canvas/canvasCtx';

function ResizeHandle(props: { direction: "horizontal" | "vertical" }) {
    return (
        <PanelResizeHandle 
            class={`split-gutter ${props.direction === 'horizontal' ? 'split-gutter-vertical' : 'split-gutter-horizontal'}`} 
        />
    );
}

function EditorPage() {
    return (
        <div class={`flex ${toggleConsoleMaximized ? "h-screen" : "h-0"} w-screen flex-col overflow-hidden bg-[#08090c]`}>

            <main class="flex-1 min-h-0 relative z-10">
                <PanelGroup direction="vertical" id="eleczen-main-vertical">
                    <Panel defaultSize={83} minSize={0}>
                        <header class="flex flex-col border-b border-white/10 bg-[#05070b]/90 backdrop-blur-2xl relative z-20">
                <ToolBar />
            </header>
                        <div class="flex h-full overflow-hidden">
                            <aside class="w-16 shrink-0 border-r border-white/10 bg-[#0a0d14]">
                                <ToolsPanel />
                            </aside>

                            <div class="flex-1 min-w-0">
                                <PanelGroup direction="horizontal" id="eleczen-main-horizontal">
                                    <Panel defaultSize={20} maxSize={20}>
                                        <ComponentsPanel />
                                    </Panel>
                                    
                                    <ResizeHandle direction="horizontal" />
                                    
                                    <Panel defaultSize={60} minSize={30}>
                                        <CanvasProvider cm={cm} wm={wm} es={es} sm={sm}>
                                            <Canvas />
                                        </CanvasProvider>
                                    </Panel>
                                    
                                    <ResizeHandle direction="horizontal" />
                                    
                                    <Panel defaultSize={20} maxSize={25}>
                                        <PropertiesPanel />
                                    </Panel>
                                </PanelGroup>
                            </div>
                        </div>
                    </Panel>

                    <Show when={settings().console}>
                        <ResizeHandle direction="vertical" />
                        <Panel defaultSize={17} minSize={17} maxSize={100}>
                            <ConsolePanel />
                        </Panel>
                    </Show>
                </PanelGroup>
            </main>
        </div>
    );
}

export default EditorPage;