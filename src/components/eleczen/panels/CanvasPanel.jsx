"use client";
import React from 'react';
import Canvas from '@/components/simulation/Canvas';
import { useLiteSimStore } from '@/lib/simulation/state';

const CanvasPanel = () => {
    const { settings } = useLiteSimStore();

    return (
        <div className="w-full h-full relative">
            {/* We pass settings to Canvas if it accepts them, or Canvas reads from store directly */}
            {/* For now, Canvas reads from store, but let's ensure the grid respects the setting */}
            <Canvas settings={settings} />
        </div>
    );
};

export default CanvasPanel;
