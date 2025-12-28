"use client";
import React from 'react';
import { useLiteSimStore } from '@/lib/simulation/state';

const SettingsPanel = () => {
    const { settings, upgrades, updateSetting, toggleUpgrade, simulation } = useLiteSimStore();

    return (
        <div className="w-full h-full flex flex-col bg-transparent text-gray-300">
            <div className="p-4 border-b border-white/10 font-semibold text-sm text-cyan-400 bg-white/5">
                Settings & Upgrades
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {/* General Settings */}
                <section>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">General</h3>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between text-xs cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <span className="group-hover:text-white transition-colors">Snap to Grid</span>
                            <input
                                type="checkbox"
                                checked={settings.snapToGrid}
                                onChange={(e) => updateSetting('snapToGrid', e.target.checked)}
                                className="accent-cyan-500 w-4 h-4"
                            />
                        </label>
                        <label className="flex items-center justify-between text-xs cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <span className="group-hover:text-white transition-colors">Show Labels</span>
                            <input
                                type="checkbox"
                                checked={settings.showLabels}
                                onChange={(e) => updateSetting('showLabels', e.target.checked)}
                                className="accent-cyan-500 w-4 h-4"
                            />
                        </label>
                        <label className="flex items-center justify-between text-xs cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <span className="group-hover:text-white transition-colors">Animations</span>
                            <input
                                type="checkbox"
                                checked={settings.enableAnimations}
                                onChange={(e) => updateSetting('enableAnimations', e.target.checked)}
                                className="accent-cyan-500 w-4 h-4"
                            />
                        </label>
                    </div>
                </section>

                {/* Simulation Parameters */}
                <section>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">Simulation</h3>
                    <div className="space-y-3 bg-black/20 rounded-xl p-3 border border-white/5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Mode</span>
                            <span className="text-cyan-400 font-mono bg-cyan-500/10 px-2 py-1 rounded">{simulation.mode}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Time Step</span>
                            <span className="text-gray-300 font-mono bg-white/5 px-2 py-1 rounded">{simulation.parameters.timeStep}</span>
                        </div>
                    </div>
                </section>

                {/* Upgrades (Feature Flags) */}
                <section>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">Modules</h3>
                    <div className="space-y-3">
                        {upgrades.map(upgrade => (
                            <div key={upgrade.feature} className="bg-white/5 border border-white/5 rounded-xl p-3 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-200 group-hover:text-cyan-300 transition-colors">{upgrade.feature}</span>
                                    <button
                                        onClick={() => toggleUpgrade(upgrade.feature)}
                                        className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${upgrade.enabled ? 'bg-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${upgrade.enabled ? 'left-5' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed">{upgrade.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPanel;
