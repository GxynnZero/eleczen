"use client";
import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap } from 'lucide-react';
import { useLiteSimStore } from '@/lib/simulation/state';
import { saveCircuitAction } from '@/app/actions/circuit';

const NavbarPanel = () => {
    const { isRunning, setIsRunning, runSimulation, clearCanvas, components, wires, openModal, requestExport } = useLiteSimStore();
    const [activeMenu, setActiveMenu] = useState(null);

    // Simulation Loop
    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                runSimulation();
            }, 100); // 10Hz simulation
        }
        return () => clearInterval(interval);
    }, [isRunning, runSimulation]);

    const handleSaveToCloud = () => {
        openModal('SAVE_CIRCUIT');
        setActiveMenu(null);
    };

    const handleExportJSON = () => {
        const data = JSON.stringify({ components, wires }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circuit-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setActiveMenu(null);
    };

    const handleExportPNG = () => {
        requestExport('PNG');
        setActiveMenu(null);
    };

    return (
        <div className="w-full h-full flex items-center justify-between px-6" onClick={() => setActiveMenu(null)}>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    {/* File Menu */}
                    <div className="relative">
                        <button
                            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${activeMenu === 'file' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'file' ? null : 'file'); }}
                        >
                            File
                        </button>
                        {activeMenu === 'file' && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden backdrop-blur-xl">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors flex items-center gap-2" onClick={clearCanvas}>
                                    <span>New Circuit</span>
                                </button>
                                <div className="h-px bg-white/5 my-1" />
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors" onClick={handleSaveToCloud}>
                                    Save to Cloud
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors" onClick={handleExportJSON}>
                                    Export JSON
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors" onClick={handleExportPNG}>
                                    Export PNG Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Edit Menu */}
                    <div className="relative">
                        <button
                            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${activeMenu === 'edit' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'edit' ? null : 'edit'); }}
                        >
                            Edit
                        </button>
                        {activeMenu === 'edit' && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-xl">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed">Undo (Ctrl+Z)</button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed">Redo (Ctrl+Y)</button>
                            </div>
                        )}
                    </div>

                    {/* View Menu */}
                    <div className="relative">
                        <button
                            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${activeMenu === 'view' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'view' ? null : 'view'); }}
                        >
                            View
                        </button>
                        {activeMenu === 'view' && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-xl">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors">Zoom In (+)</button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors">Zoom Out (-)</button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors">Fit to Screen</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-white/10" />

                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-lg ${isRunning
                        ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-neon-green/10 text-neon-green border border-neon-green/50 hover:bg-neon-green/20 shadow-[0_0_15px_rgba(10,255,10,0.2)]'
                        }`}
                >
                    {isRunning ? (
                        <>
                            <Pause size={14} className="fill-current" /> Pause
                        </>
                    ) : (
                        <>
                            <Play size={14} className="fill-current" /> Run
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NavbarPanel;
