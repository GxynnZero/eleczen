"use client";
import React from 'react';
import NavbarPanel from '../panels/NavbarPanel';
import InspectorPanel from '../panels/InspectorPanel';
import ConsolePanel from '../panels/ConsolePanel';
import CanvasPanel from '../panels/CanvasPanel';
import ModalManager from '../modals/ModalManager';
import { usePreventDevTools } from '@/hooks/usePreventDevTools';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const ResizeHandle = ({ className = "" }) => (
    <PanelResizeHandle className={`w-1 bg-white/5 data-[resize-handle-active]:bg-neon-blue outline-none relative z-50 hover:bg-neon-blue/20 transition-colors ${className}`} />
);

const ResizeHandleHorizontal = ({ className = "" }) => (
    <PanelResizeHandle className={`h-1 bg-white/5 data-[resize-handle-active]:bg-neon-blue outline-none relative z-50 hover:bg-neon-blue/20 transition-colors ${className}`} />
);

import { useLiteSimStore } from '@/lib/simulation/state';

const Workbench = ({ circuitId }) => {
    const { loadCircuit } = useLiteSimStore();

    React.useEffect(() => {
        const fetchCircuit = async () => {
            if (!circuitId) return;
            try {
                // Import supabase dynamically from root
                const { supabase } = await import('../../../../supabase/supabase');

                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', circuitId)
                    .single();

                if (error) throw error;

                if (data && data.content) {
                    console.log("Loading circuit:", data.name);
                    // Parse if string/JSON
                    const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                    loadCircuit(content);
                }
            } catch (err) {
                console.error("Failed to load circuit:", err);
            }
        };

        fetchCircuit();
    }, [circuitId, loadCircuit]);

    usePreventDevTools();

    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans selection:bg-neon-blue/30 relative">
            {/* Lightweight Background: Single gradient, no heavy blurs */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black pointer-events-none" />

            {/* Top Navbar */}
            <div className="h-12 border-b border-white/10 bg-black/60 z-50 flex items-center">
                <NavbarPanel />
            </div>

            {/* Main Workspace Grid */}
            <div className="flex-1 flex overflow-hidden relative z-40">
                <aside className="w-14 flex flex-col items-center py-4 bg-black border-r border-white/10 z-50">
                    <button className="w-9 h-9 rounded-lg bg-neon-blue/10 flex items-center justify-center mb-3 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-all">
                        <span className="text-lg">⚡</span>
                    </button>
                    {[1, 2, 3].map(i => (
                        <button key={i} className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center mb-2 text-gray-500 hover:text-white transition-colors">
                            <div className="w-4 h-4 bg-current opacity-20 rounded-sm" />
                        </button>
                    ))}
                </aside>

                <PanelGroup direction="horizontal">
                    {/* Center: Canvas & Console */}
                    <Panel className="flex flex-col relative">
                        <PanelGroup direction="vertical">
                            <Panel className="bg-transparent relative overflow-hidden">
                                <CanvasPanel />
                            </Panel>

                            <ResizeHandleHorizontal />

                            <Panel defaultSize={30} minSize={10} maxSize={50} className="border-t border-white/10 bg-black/90 z-40">
                                <ConsolePanel />
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    <ResizeHandle />

                    {/* Right: Inspector Panel */}
                    <Panel defaultSize={20} minSize={15} maxSize={30} className="flex flex-col border-l border-white/10 bg-black/80 z-40">
                        <InspectorPanel />
                    </Panel>
                </PanelGroup>
            </div>

            {/* Modal Layer */}
            <ModalManager />
        </div>
    );
};

export default Workbench;
