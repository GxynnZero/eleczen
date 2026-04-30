import { Canvas, ComponentsPanel, PropertiesPanel, ToolBar, ToolsPanel, TopBar } from "../components";
import { SplitPane } from "solid-split-pane";

function EditorPage() {
    return (
        <div class="h-screen w-screen overflow-hidden">
            <header class="flex flex-col border-b border-white/10 bg-[#05070b]/90 backdrop-blur-2xl">
                <TopBar />
                <ToolBar />
            </header>

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
                    <ComponentsPanel />
                    <Canvas />
                    <PropertiesPanel />
                </SplitPane>
            </div>
        </div>
    );
}

export default EditorPage;