"use client";
import React, { useState } from 'react';
import { useLiteSimStore } from '@/lib/simulation/state';
import SettingsPanel from './SettingsPanel';
import * as Tabs from '@radix-ui/react-tabs';

// Reusable lightweight components
const Input = ({ label, value, onChange, placeholder, type = "number" }) => (
    <div className="flex items-center justify-between gap-4">
        <label className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{label}</label>
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 bg-black/30 text-right text-xs text-cyan-50 border border-white/10 rounded px-2 py-1 focus:border-cyan-500/50 outline-none transition-colors"
        />
    </div>
);

const Section = ({ title, children }) => (
    <div className="space-y-3">
        {title && <h3 className="text-[10px] uppercase font-bold text-gray-600 tracking-wider mb-2">{title}</h3>}
        <div className="grid gap-2">{children}</div>
    </div>
);

const InspectorPanel = () => {
    const { selection, components, updateComponentProperty, removeSelection } = useLiteSimStore();
    const [activeTab, setActiveTab] = useState('properties');

    if (!selection) {
        return (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-600">
                Select an item
            </div>
        );
    }

    const comp = selection.type === 'component' ? components.find(c => c.id === selection.id) : null;
    if (selection.type === 'component' && !comp) return null;

    return (
        <Tabs.Root className="flex-1 flex flex-col bg-black" value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex border-b border-white/10">
                {['properties', 'settings'].map(tab => (
                    <Tabs.Trigger
                        key={tab}
                        value={tab}
                        className="flex-1 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:text-white data-[state=active]:text-neon-blue data-[state=active]:bg-white/5 transition-colors outline-none"
                    >
                        {tab}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            <Tabs.Content value="properties" className="flex-1 overflow-y-auto p-4 space-y-6">
                {selection.type === 'component' ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neon-blue" />
                                <span className="text-xs font-bold text-white uppercase">{comp.type}</span>
                            </div>
                            <button onClick={removeSelection} className="text-[10px] text-red-500 hover:text-red-400">DELETE</button>
                        </div>

                        <Section title="Position">
                            <div className="grid grid-cols-2 gap-2">
                                <Input label="X" value={Math.round(comp.x)} onChange={() => { }} placeholder="X" />
                                <Input label="Y" value={Math.round(comp.y)} onChange={() => { }} placeholder="Y" />
                            </div>
                        </Section>

                        <Section title="Parameters">
                            {/* Dynamic Rendering based on Component Type */}
                            {comp.type === 'resistor' && <Input label="Resistance (Ω)" value={comp.properties?.resistance} onChange={(v) => updateComponentProperty(comp.id, 'resistance', Number(v))} />}
                            {comp.type === 'capacitor' && <Input label="Capacitance" value={comp.properties?.capacitance} onChange={(v) => updateComponentProperty(comp.id, 'capacitance', v)} type="text" />}
                            {comp.type === 'inductor' && <Input label="Inductance" value={comp.properties?.inductance} onChange={(v) => updateComponentProperty(comp.id, 'inductance', v)} type="text" />}
                            {comp.type === 'battery' && <Input label="Voltage (V)" value={comp.properties?.voltage} onChange={(v) => updateComponentProperty(comp.id, 'voltage', Number(v))} />}
                            {/* Add more mappings here simply */}
                        </Section>

                        <div className="h-px bg-white/5 my-2" />

                        <Section title="Limits">
                            <Input label="Max V" value={comp.properties?.maxVoltage || ''} onChange={(v) => updateComponentProperty(comp.id, 'maxVoltage', v ? Number(v) : undefined)} placeholder="∞" />
                            <Input label="Max I" value={comp.properties?.maxCurrent || ''} onChange={(v) => updateComponentProperty(comp.id, 'maxCurrent', v ? Number(v) : undefined)} placeholder="∞" />
                        </Section>
                    </>
                ) : (
                    <div>
                        <div className="text-xs text-gray-500 mb-4">Wire Selected</div>
                        <button onClick={removeSelection} className="w-full py-1 text-xs bg-red-900/20 text-red-500 border border-red-500/20 rounded hover:bg-red-900/40">Delete Wire</button>
                    </div>
                )}
            </Tabs.Content>

            <Tabs.Content value="settings" className="flex-1 p-4">
                <SettingsPanel />
            </Tabs.Content>
        </Tabs.Root>
    );
};

export default InspectorPanel;
