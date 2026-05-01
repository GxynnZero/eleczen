// src/pages/tools/resistor.jsx
import { createSignal, For } from "solid-js";
import { Activity, Info, ChevronLeft } from "lucide-solid";
import { A } from "@solidjs/router";

const COLORS = [
    { name: "Black", color: "bg-zinc-900", hex: "#000000", value: 0, multiplier: 1, tolerance: null },
    { name: "Brown", color: "bg-amber-900", hex: "#5d4037", value: 1, multiplier: 10, tolerance: 1 },
    { name: "Red", color: "bg-red-600", hex: "#dc2626", value: 2, multiplier: 100, tolerance: 2 },
    { name: "Orange", color: "bg-orange-500", hex: "#f97316", value: 3, multiplier: 1000, tolerance: null },
    { name: "Yellow", color: "bg-yellow-400", hex: "#facc15", value: 4, multiplier: 10000, tolerance: null },
    { name: "Green", color: "bg-emerald-600", hex: "#059669", value: 5, multiplier: 100000, tolerance: 0.5 },
    { name: "Blue", color: "bg-blue-600", hex: "#2563eb", value: 6, multiplier: 1000000, tolerance: 0.25 },
    { name: "Violet", color: "bg-purple-600", hex: "#9333ea", value: 7, multiplier: 10000000, tolerance: 0.1 },
    { name: "Grey", color: "bg-zinc-500", hex: "#71717a", value: 8, multiplier: 100000000, tolerance: 0.05 },
    { name: "White", color: "bg-zinc-100", hex: "#f4f4f5", value: 9, multiplier: 1000000000, tolerance: null },
    { name: "Gold", color: "bg-yellow-600", hex: "#ca8a04", value: null, multiplier: 0.1, tolerance: 5 },
    { name: "Silver", color: "bg-zinc-400", hex: "#a1a1aa", value: null, multiplier: 0.01, tolerance: 10 },
];

export default function ResistorDecoder() {
    const [bands, setBands] = createSignal([1, 0, 2, 10]); // Brown, Black, Red, Gold

    const calculateValue = () => {
        const b = bands();
        const val = (COLORS[b[0]].value * 10 + COLORS[b[1]].value) * COLORS[b[2]].multiplier;
        const tol = COLORS[b[3]].tolerance;

        let unit = "Ω";
        let displayVal = val;
        if (val >= 1000000) {
            displayVal = val / 1000000;
            unit = "MΩ";
        } else if (val >= 1000) {
            displayVal = val / 1000;
            unit = "kΩ";
        }

        // Round to 2 decimal places if needed
        displayVal = Math.round(displayVal * 100) / 100;

        return { val: displayVal.toLocaleString(), unit, tol };
    };

    const updateBand = (index, colorIndex) => {
        const newBands = [...bands()];
        newBands[index] = colorIndex;
        setBands(newBands);
    };

    return (
        <div class="min-h-screen bg-[#05070b] text-white overflow-y-auto pb-20">
            {/* Ambient Lighting */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-0 right-0 h-[50rem] w-[50rem] rounded-full bg-cyan-500/5 blur-[120px]" />
                <div class="absolute bottom-0 left-0 h-[50rem] w-[50rem] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <div class="max-w-6xl mx-auto px-6 pt-12">
                <A href="/tools" class="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition mb-12 group">
                    <ChevronLeft size={20} class="group-hover:-translate-x-1 transition" />
                    Back to Tools
                </A>

                <div class="text-center mb-16">
                    <div class="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-1.5 text-xs text-yellow-300 mb-6 uppercase tracking-widest font-bold">
                        <Activity size={14} />
                        Engineering Utility
                    </div>
                    <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight">Resistor Decoder</h1>
                    <p class="text-zinc-400 max-w-xl mx-auto leading-relaxed text-base md:text-lg">
                        Select color bands to calculate resistance and tolerance with visual feedback.
                    </p>
                </div>

                {/* Resistor Visualization Container */}
                <div class="relative bg-white/5 border border-white/10 rounded-[32px] md:rounded-[48px] p-6 md:p-12 mb-16 backdrop-blur-3xl overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    
                    <div class="relative h-48 md:h-64 flex flex-col items-center justify-center">
                        {/* Wires */}
                        <div class="absolute w-full h-1 md:h-2 bg-gradient-to-r from-zinc-800 via-zinc-400 to-zinc-800 rounded-full" />
                        
                        {/* Body */}
                        <div class="relative flex items-center h-24 md:h-36 w-full max-w-[560px] bg-[#dcb38b] rounded-[40px] md:rounded-[60px] border-2 md:border-4 border-[#c49b74] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden">
                            {/* Realistic shading */}
                            <div class="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />
                            
                            {/* Bands Container */}
                            <div class="flex w-full h-full relative">
                                {/* Band 1 & 2 & 3 Grouped */}
                                <div class="flex gap-4 md:gap-12 pl-12 md:pl-24 h-full items-center">
                                    <div 
                                        class="w-6 md:w-10 h-full transition-colors duration-500 shadow-[5px_0_15px_rgba(0,0,0,0.2)]" 
                                        style={{ "background-color": COLORS[bands()[0]].hex }}
                                    />
                                    <div 
                                        class="w-6 md:w-10 h-full transition-colors duration-500 shadow-[5px_0_15px_rgba(0,0,0,0.2)]" 
                                        style={{ "background-color": COLORS[bands()[1]].hex }}
                                    />
                                    <div 
                                        class="w-6 md:w-10 h-full transition-colors duration-500 shadow-[5px_0_15px_rgba(0,0,0,0.2)]" 
                                        style={{ "background-color": COLORS[bands()[2]].hex }}
                                    />
                                </div>
                                
                                {/* Tolerance Band (Separated) */}
                                <div class="ml-auto pr-12 md:pr-24 h-full items-center flex">
                                    <div 
                                        class="w-6 md:w-10 h-full transition-colors duration-500 shadow-[-5px_0_15px_rgba(0,0,0,0.2)]" 
                                        style={{ "background-color": COLORS[bands()[3]].hex }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Result Display */}
                        <div class="mt-12 md:mt-16 text-center">
                            <div class="text-4xl md:text-6xl font-black text-white flex items-baseline justify-center gap-2 md:gap-3 tracking-tighter">
                                {calculateValue().val}
                                <span class="text-2xl md:text-3xl text-cyan-400 font-bold">{calculateValue().unit}</span>
                            </div>
                            <div class="text-lg md:text-xl text-zinc-500 mt-2 font-medium tracking-wide">
                                Precision: ±{calculateValue().tol}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Control Panel */}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    <For each={[0, 1, 2, 3]}>
                        {(bandIndex) => (
                            <div class="group relative space-y-4 md:space-y-6 p-6 md:p-8 rounded-[24px] md:rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-2xl transition duration-500 hover:border-white/20 hover:bg-white/[0.07]">
                                <div class="flex items-center justify-between mb-2 md:mb-4">
                                    <h3 class="text-xs md:text-sm font-black text-zinc-500 uppercase tracking-widest">
                                        Band {bandIndex + 1}
                                    </h3>
                                    <span class="text-[9px] md:text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-zinc-300 font-bold uppercase tracking-tighter">
                                        {bandIndex < 2 ? "Value" : bandIndex === 2 ? "Mult" : "Tol"}
                                    </span>
                                </div>
                                
                                <div class="grid grid-cols-4 gap-2 md:gap-3">
                                    <For each={COLORS}>
                                        {(color, colorIdx) => {
                                            const isSelectable = (bandIndex < 2 && color.value !== null) || 
                                                               (bandIndex === 2 && color.multiplier !== undefined) ||
                                                               (bandIndex === 3 && color.tolerance !== null);

                                            return (
                                                <button 
                                                    disabled={!isSelectable}
                                                    onClick={() => updateBand(bandIndex, colorIdx())}
                                                    class={`group/btn relative h-10 md:h-12 rounded-lg md:rounded-xl transition-all duration-300 ${
                                                        !isSelectable ? 'opacity-5 cursor-not-allowed grayscale' : 'hover:scale-110 active:scale-95 cursor-pointer shadow-lg'
                                                    } ${bands()[bandIndex] === colorIdx() ? 'ring-2 ring-white ring-offset-4 ring-offset-[#05070b] scale-110 z-10' : ''}`}
                                                    style={{ "background-color": isSelectable ? color.hex : "transparent" }}
                                                    title={color.name}
                                                >
                                                    <span class="absolute inset-0 rounded-lg md:rounded-xl border border-white/10 group-hover/btn:border-white/30" />
                                                </button>
                                            );
                                        }}
                                    </For>
                                </div>
                            </div>
                        )}
                    </For>
                </div>


                {/* Educational Note */}
                <div class="mt-16 grid md:grid-cols-2 gap-8">
                    <div class="p-10 rounded-[40px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl">
                        <div class="flex gap-6">
                            <div class="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-500/20">
                                <Info size={24} />
                            </div>
                            <div>
                                <h4 class="text-2xl font-bold mb-4">Reading 4-Band Resistors</h4>
                                <p class="text-zinc-400 leading-relaxed">
                                    The first two bands are digits. The third is the multiplier (10<sup>x</sup>). The gap indicates the tolerance band, which tells you how much the actual resistance might vary.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="p-10 rounded-[40px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl flex items-center justify-center">
                        <div class="text-center">
                            <p class="text-zinc-500 text-sm mb-4 uppercase tracking-[0.2em] font-bold">Quick Example</p>
                            <p class="text-2xl font-bold text-white italic">"Brown Black Red Gold"</p>
                            <p class="text-cyan-400 text-3xl font-black mt-2">1,000 Ω (1 kΩ) ± 5%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

