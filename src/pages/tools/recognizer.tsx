// src/pages/tools/recognizer.jsx
import { createSignal, Show } from "solid-js";
import { Grid, Image, RefreshCw, Layers, CheckCircle, Sparkles } from "lucide-solid";

export default function CircuitRecognizer() {
    const [status, setStatus] = createSignal("idle"); // idle, uploading, processing, done

    const startProcessing = () => {
        setStatus("uploading");
        setTimeout(() => setStatus("processing"), 1500);
        setTimeout(() => setStatus("done"), 4500);
    };

    return (
        <div class="min-h-screen bg-[#05070b] text-white">
            {/* Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-violet-500/5 blur-[150px]" />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            <div class="max-w-6xl mx-auto px-6 py-20">
                <div class="text-center mb-16">
                    <div class="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-1.5 text-xs text-violet-300 mb-6 uppercase tracking-widest font-semibold">
                        <Grid size={14} />
                        Sketch-to-Schema
                    </div>
                    <h1 class="text-5xl font-black mb-6">Circuit Recognizer</h1>
                    <p class="text-zinc-400 max-w-xl mx-auto leading-relaxed">
                        Convert your hand-drawn napkin sketches into clean, simulation-ready digital schematics using our advanced geometry neural network.
                    </p>
                </div>

                <div class="flex flex-col items-center">
                    <Show when={status() === 'idle'}>
                        <div 
                            onClick={startProcessing}
                            class="w-full max-w-3xl aspect-[16/10] rounded-[48px] border-2 border-dashed border-white/10 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center cursor-pointer group hover:border-violet-500/40 hover:bg-white/[0.07] transition-all duration-500"
                        >
                            <div class="h-24 w-24 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-8 group-hover:scale-110 transition duration-500">
                                <Image size={48} />
                            </div>
                            <h3 class="text-2xl font-bold mb-3">Upload your sketch</h3>
                            <p class="text-zinc-500 text-center max-w-sm">
                                Drag and drop your image file here, or click to browse. Supports JPG, PNG and PDF.
                            </p>
                        </div>
                    </Show>

                    <Show when={status() === 'uploading' || status() === 'processing'}>
                        <div class="w-full max-w-3xl aspect-[16/10] rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center p-12 overflow-hidden relative">
                            <div class="relative z-10 text-center">
                                <div class="h-24 w-24 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-8 relative">
                                    <RefreshCw size={40} class="text-violet-400 animate-spin" />
                                    <div class="absolute inset-0 rounded-full border-t-2 border-white animate-spin duration-[3s]" />
                                </div>
                                <h3 class="text-3xl font-black mb-3">
                                    {status() === 'uploading' ? "Uploading Sketch..." : "Analyzing Geometry..."}
                                </h3>
                                <p class="text-zinc-400">
                                    {status() === 'uploading' ? "Securing your image on our servers..." : "Our AI is identifying symbols, nodes and connections."}
                                </p>
                            </div>

                            {/* Processing Visuals */}
                            <div class="absolute inset-0 opacity-20 pointer-events-none">
                                <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.2)_0%,transparent_70%)]" />
                                <div class="grid grid-cols-10 grid-rows-10 h-full w-full opacity-30">
                                    {Array(100).fill(0).map((_, i) => (
                                        <div class={`border border-white/20 transition-all duration-1000 ${Math.random() > 0.8 ? 'bg-violet-500/40' : ''}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Show>

                    <Show when={status() === 'done'}>
                        <div class="w-full max-w-5xl grid lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-700">
                            {/* Original */}
                            <div class="space-y-4">
                                <div class="flex items-center justify-between text-zinc-500 text-sm font-bold uppercase tracking-wider px-2">
                                    Original Sketch
                                    <span class="flex items-center gap-1"><Image size={14} /> Sketch.jpg</span>
                                </div>
                                <div class="aspect-square rounded-[32px] border border-white/10 bg-zinc-900 overflow-hidden relative grayscale contrast-125">
                                    <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60" />
                                </div>
                            </div>

                            {/* Recognized */}
                            <div class="space-y-4">
                                <div class="flex items-center justify-between text-violet-400 text-sm font-bold uppercase tracking-wider px-2">
                                    Digital Schematic
                                    <span class="flex items-center gap-1 text-emerald-400"><CheckCircle size={14} /> Recognized</span>
                                </div>
                                <div class="aspect-square rounded-[32px] border border-violet-500/30 bg-white/5 backdrop-blur-2xl overflow-hidden relative p-8">
                                    <div class="h-full w-full border border-white/10 rounded-2xl bg-black/20 flex items-center justify-center">
                                        {/* Mock Schematic Lines */}
                                        <svg viewBox="0 0 200 200" class="w-2/3 h-2/3 text-white">
                                            <rect x="80" y="80" width="40" height="20" fill="none" stroke="currentColor" stroke-width="2" />
                                            <line x1="20" y1="90" x2="80" y2="90" stroke="currentColor" stroke-width="2" />
                                            <line x1="120" y1="90" x2="180" y2="90" stroke="currentColor" stroke-width="2" />
                                            <circle cx="20" cy="90" r="3" fill="currentColor" />
                                            <circle cx="180" cy="90" r="3" fill="currentColor" />
                                            <path d="M100 40 L100 80 M100 100 L100 160" stroke="currentColor" stroke-width="2" stroke-dasharray="4" />
                                        </svg>
                                    </div>
                                    
                                    <div class="absolute bottom-6 left-6 right-6">
                                        <button class="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition shadow-xl shadow-violet-500/20 flex items-center justify-center gap-2">
                                            <Sparkles size={18} />
                                            Import to Editor
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setStatus("idle")}
                            class="mt-12 text-zinc-500 hover:text-white transition flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Start New Recognition
                        </button>
                    </Show>
                </div>

                {/* Features */}
                <div class="mt-32 grid md:grid-cols-3 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                    <div class="p-6">
                        <Layers size={24} class="text-violet-400 mb-4" />
                        <h4 class="font-bold mb-2">Layer Separation</h4>
                        <p class="text-xs text-zinc-500">Automatically separates grid lines from component symbols.</p>
                    </div>
                    <div class="p-6">
                        <Grid size={24} class="text-blue-400 mb-4" />
                        <h4 class="font-bold mb-2">Node Alignment</h4>
                        <p class="text-xs text-zinc-500">Snaps hand-drawn lines to a perfect engineering grid.</p>
                    </div>
                    <div class="p-6">
                        <Sparkles size={24} class="text-cyan-400 mb-4" />
                        <h4 class="font-bold mb-2">Auto-Labeling</h4>
                        <p class="text-xs text-zinc-500">Recognizes handwritten values like '10k' or '22uF'.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
