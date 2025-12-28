import React from 'react';
import Workbench from '@/components/eleczen/layout/Workbench';

export const metadata = {
    title: 'ElecZen - Design',
    description: 'Modular Electronics Workbench',
};

export default function DesignIdPage({ params }) {
    return (
        <main className="w-screen h-155.5 overflow-hidden bg-black text-white font-sans selection:bg-cyan-500/30">
            <Workbench circuitId={params.id} />

            {/* Branding Overlay */}
            <div className="absolute top-4 right-4 pointer-events-none opacity-50">
                <h1 className="text-xl font-bold tracking-tighter text-cyan-500">LITESIM <span className="text-xs font-normal text-white">0.1</span></h1>
            </div>
        </main>
    );
}
