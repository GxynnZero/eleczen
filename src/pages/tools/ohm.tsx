// src/pages/tools/ohm.jsx
import { createSignal, createMemo } from "solid-js";
import { Zap, Activity, Battery, RefreshCcw, Info } from "lucide-solid";

export default function OhmCalculator() {
    const [voltage, setVoltage] = createSignal("");
    const [current, setCurrent] = createSignal("");
    const [resistance, setResistance] = createSignal("");
    const [power, setPower] = createSignal("");

    const calculate = () => {
        let v = parseFloat(voltage());
        let i = parseFloat(current());
        let r = parseFloat(resistance());
        let p = parseFloat(power());

        // We need exactly two values to calculate others
        const values = [v, i, r, p].filter(val => !isNaN(val));
        if (values.length < 2) return;

        // V = I * R
        // P = V * I = I^2 * R = V^2 / R

        if (!isNaN(v) && !isNaN(i)) {
            setResistance((v / i).toFixed(4));
            setPower((v * i).toFixed(4));
        } else if (!isNaN(v) && !isNaN(r)) {
            setCurrent((v / r).toFixed(4));
            setPower(((v * v) / r).toFixed(4));
        } else if (!isNaN(i) && !isNaN(r)) {
            setVoltage((i * r).toFixed(4));
            setPower((i * i * r).toFixed(4));
        } else if (!isNaN(p) && !isNaN(v)) {
            setCurrent((p / v).toFixed(4));
            setResistance(((v * v) / p).toFixed(4));
        } else if (!isNaN(p) && !isNaN(i)) {
            setVoltage((p / i).toFixed(4));
            setResistance((p / (i * i)).toFixed(4));
        } else if (!isNaN(p) && !isNaN(r)) {
            setVoltage(Math.sqrt(p * r).toFixed(4));
            setCurrent(Math.sqrt(p / r).toFixed(4));
        }
    };

    const clear = () => {
        setVoltage("");
        setCurrent("");
        setResistance("");
        setPower("");
    };

    return (
        <div class="min-h-screen bg-[#05070b] text-white">
            {/* Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-emerald-500/5 blur-[120px]" />
                <div class="absolute bottom-0 right-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-500/5 blur-[120px]" />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div class="max-w-4xl mx-auto px-6 py-20">
                <div class="text-center mb-16">
                    <div class="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs text-emerald-300 mb-6 uppercase tracking-widest font-semibold">
                        <Zap size={14} />
                        Core Calculator
                    </div>
                    <h1 class="text-5xl font-black mb-6">Ohm's Law Solver</h1>
                    <p class="text-zinc-400 max-w-xl mx-auto leading-relaxed">
                        Input any two values to solve for the rest. Our calculator handles Voltage, Current, Resistance, and Power instantly.
                    </p>
                </div>

                <div class="grid lg:grid-cols-2 gap-10 items-center">
                    {/* Inputs */}
                    <div class="space-y-6">
                        <div class="p-8 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl space-y-6">
                            <div class="space-y-2">
                                <label class="text-sm font-medium text-zinc-400 flex justify-between">
                                    Voltage (V)
                                    <span class="text-xs text-zinc-600">Volts</span>
                                </label>
                                <input 
                                    type="number" 
                                    value={voltage()} 
                                    onInput={(e) => setVoltage(e.target.value)}
                                    placeholder="Enter voltage..."
                                    class="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition text-white placeholder:text-zinc-700"
                                />
                            </div>

                            <div class="space-y-2">
                                <label class="text-sm font-medium text-zinc-400 flex justify-between">
                                    Current (I)
                                    <span class="text-xs text-zinc-600">Amperes</span>
                                </label>
                                <input 
                                    type="number" 
                                    value={current()} 
                                    onInput={(e) => setCurrent(e.target.value)}
                                    placeholder="Enter current..."
                                    class="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500 transition text-white placeholder:text-zinc-700"
                                />
                            </div>

                            <div class="space-y-2">
                                <label class="text-sm font-medium text-zinc-400 flex justify-between">
                                    Resistance (R)
                                    <span class="text-xs text-zinc-600">Ohms (Ω)</span>
                                </label>
                                <input 
                                    type="number" 
                                    value={resistance()} 
                                    onInput={(e) => setResistance(e.target.value)}
                                    placeholder="Enter resistance..."
                                    class="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500 transition text-white placeholder:text-zinc-700"
                                />
                            </div>

                            <div class="space-y-2">
                                <label class="text-sm font-medium text-zinc-400 flex justify-between">
                                    Power (P)
                                    <span class="text-xs text-zinc-600">Watts</span>
                                </label>
                                <input 
                                    type="number" 
                                    value={power()} 
                                    onInput={(e) => setPower(e.target.value)}
                                    placeholder="Enter power..."
                                    class="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-pink-500 transition text-white placeholder:text-zinc-700"
                                />
                            </div>

                            <div class="grid grid-cols-2 gap-4 pt-4">
                                <button 
                                    onClick={calculate}
                                    class="py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold rounded-2xl transition shadow-xl shadow-emerald-500/20 active:scale-95"
                                >
                                    Calculate
                                </button>
                                <button 
                                    onClick={clear}
                                    class="py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <RefreshCcw size={18} />
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visual Diagram */}
                    <div class="relative">
                        <div class="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full" />
                        <div class="relative aspect-square rounded-[60px] border border-white/10 bg-white/5 backdrop-blur-3xl flex items-center justify-center p-12 overflow-hidden group">
                            {/* SVG Triangle of Ohm's Law */}
                            <svg viewBox="0 0 400 400" class="w-full h-full drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                                <path 
                                    d="M200 50 L350 320 L50 320 Z" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    stroke-width="2" 
                                    class="text-emerald-500/40"
                                />
                                <line x1="50" y1="200" x2="350" y2="200" stroke="currentColor" stroke-width="2" class="text-white/10" />
                                <line x1="200" y1="200" x2="200" y2="320" stroke="currentColor" stroke-width="2" class="text-white/10" />
                                
                                <text x="200" y="150" text-anchor="middle" font-size="60" font-weight="900" fill="white" class="opacity-80">V</text>
                                <text x="125" y="270" text-anchor="middle" font-size="50" font-weight="900" fill="white" class="opacity-80">I</text>
                                <text x="275" y="270" text-anchor="middle" font-size="50" font-weight="900" fill="white" class="opacity-80">R</text>
                            </svg>

                            <div class="absolute bottom-8 left-8 right-8 p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md">
                                <div class="flex items-start gap-4">
                                    <Info size={20} class="text-emerald-400 flex-shrink-0 mt-1" />
                                    <p class="text-xs text-zinc-400 leading-relaxed">
                                        The Ohm's Law triangle helps you remember the relationships: 
                                        <br/><span class="text-white font-mono mt-1 block">V = I × R | I = V / R | R = V / I</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
