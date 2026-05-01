// src/pages/tools/capacitor.jsx
import { createSignal, createMemo } from "solid-js";
import { Battery, Info, ArrowRightLeft, RefreshCw } from "lucide-solid";

export default function CapacitorDecoder() {
    const [code, setCode] = createSignal("104");

    const calculate = createMemo(() => {
        const input = code();
        if (input.length !== 3) return null;

        const d1 = parseInt(input[0]);
        const d2 = parseInt(input[1]);
        const d3 = parseInt(input[2]);

        if (isNaN(d1) || isNaN(d2) || isNaN(d3)) return null;

        const pf = (d1 * 10 + d2) * Math.pow(10, d3);
        const nf = pf / 1000;
        const uf = nf / 1000;

        return { pf, nf, uf };
    });

    return (
        <div class="min-h-screen bg-[#05070b] text-white overflow-y-auto">
            {/* Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-0 right-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[120px]" />
                <div class="absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-yellow-500/5 blur-[120px]" />
            </div>

            <div class="max-w-4xl mx-auto px-6 py-20">
                <div class="text-center mb-16">
                    <div class="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-1.5 text-xs text-orange-300 mb-6 uppercase tracking-widest font-semibold">
                        <Battery size={14} />
                        Unit Converter
                    </div>
                    <h1 class="text-5xl font-black mb-6">Capacitor Decoder</h1>
                    <p class="text-zinc-400 max-w-xl mx-auto leading-relaxed">
                        Read 3-digit capacitor codes (like 104, 223, 471) and instantly convert them to picofarads, nanofarads, and microfarads.
                    </p>
                </div>

                <div class="grid md:grid-cols-2 gap-10">
                    {/* Input Panel */}
                    <div class="p-10 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
                        <div class="mb-10 text-center">
                            <label class="block text-sm font-medium text-zinc-500 uppercase tracking-[0.2em] mb-4">Enter 3-Digit Code</label>
                            <input 
                                type="text" 
                                maxlength="3"
                                value={code()}
                                onInput={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                class="w-full bg-black/40 border border-white/10 rounded-3xl px-8 py-10 text-center text-7xl font-black text-orange-400 focus:border-orange-500 outline-none transition shadow-inner"
                            />
                        </div>

                        <div class="grid grid-cols-3 gap-4">
                            {[103, 104, 222, 223, 473, 474].map(example => (
                                <button 
                                    onClick={() => setCode(example.toString())}
                                    class="py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-zinc-300 font-bold"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Display */}
                    <div class="flex flex-col gap-4">
                        <div class="flex-1 p-8 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col justify-center">
                            <div class="space-y-8">
                                <div class="flex items-center justify-between group">
                                    <span class="text-zinc-500 font-medium">Picofarads (pF)</span>
                                    <div class="text-right">
                                        <div class="text-3xl font-bold text-white group-hover:text-orange-400 transition">
                                            {calculate() ? calculate().pf.toLocaleString() : "---"}
                                        </div>
                                    </div>
                                </div>
                                <div class="h-px bg-white/10" />
                                <div class="flex items-center justify-between group">
                                    <span class="text-zinc-500 font-medium">Nanofarads (nF)</span>
                                    <div class="text-right">
                                        <div class="text-3xl font-bold text-white group-hover:text-orange-400 transition">
                                            {calculate() ? calculate().nf.toLocaleString() : "---"}
                                        </div>
                                    </div>
                                </div>
                                <div class="h-px bg-white/10" />
                                <div class="flex items-center justify-between group">
                                    <span class="text-zinc-500 font-medium">Microfarads (μF)</span>
                                    <div class="text-right">
                                        <div class="text-3xl font-bold text-white group-hover:text-orange-400 transition">
                                            {calculate() ? calculate().uf : "---"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/20 text-sm text-zinc-400 leading-relaxed italic">
                            "The first two digits are the value, and the third is the number of zeros added in picofarads."
                        </div>
                    </div>
                </div>
                
                <div class="mt-20 flex justify-center">
                    <div class="flex items-center gap-8 text-zinc-500">
                        <div class="flex flex-col items-center">
                            <div class="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center mb-2 font-bold">1</div>
                            <span>First Digit</span>
                        </div>
                        <ArrowRightLeft class="opacity-20" />
                        <div class="flex flex-col items-center">
                            <div class="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center mb-2 font-bold">0</div>
                            <span>Second Digit</span>
                        </div>
                        <ArrowRightLeft class="opacity-20" />
                        <div class="flex flex-col items-center text-orange-400">
                            <div class="h-10 w-10 rounded-full border border-orange-400 flex items-center justify-center mb-2 font-bold">4</div>
                            <span>Multiplier (10⁴)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
