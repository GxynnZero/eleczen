// src/pages/tools/scanner.jsx
import { createSignal, onMount, Show } from "solid-js";
import { Camera, Scan, Search, RefreshCw, Cpu, CheckCircle } from "lucide-solid";

export default function ComponentScanner() {
    const [scanning, setScanning] = createSignal(false);
    const [result, setResult] = createSignal(null);

    const startScan = () => {
        setScanning(true);
        setResult(null);
        setTimeout(() => {
            setScanning(false);
            setResult({
                name: "NE555P",
                type: "Precision Timer IC",
                confidence: "98.4%",
                pins: 8,
                package: "PDIP-8",
                manufacturer: "Texas Instruments"
            });
        }, 2500);
    };

    return (
        <div class="min-h-screen bg-[#05070b] text-white">
            {/* Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-1/4 left-0 h-[30rem] w-[30rem] rounded-full bg-pink-500/5 blur-[120px]" />
                <div class="absolute bottom-1/4 right-0 h-[30rem] w-[30rem] rounded-full bg-purple-500/5 blur-[120px]" />
            </div>

            <div class="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center">
                <div class="text-center mb-12">
                    <div class="inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-400/10 px-4 py-1.5 text-xs text-pink-300 mb-6 uppercase tracking-widest font-semibold">
                        <Camera size={14} />
                        AI Vision
                    </div>
                    <h1 class="text-5xl font-black mb-6 leading-tight">Component Scanner</h1>
                    <p class="text-zinc-400 max-w-xl mx-auto leading-relaxed">
                        Hold your component in front of the camera. Our AI vision system will identify the part, decode labels, and find datasheets instantly.
                    </p>
                </div>

                <div class="grid lg:grid-cols-2 gap-12 w-full items-start">
                    {/* Viewport */}
                    <div class="relative group">
                        <div class="aspect-video rounded-[40px] border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl relative">
                            {/* Mock Camera View */}
                            <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
                            
                            {/* Scan Line Animation */}
                            <Show when={scanning()}>
                                <div class="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_20px_rgba(236,72,153,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                            </Show>

                            {/* Detection Box */}
                            <Show when={result()}>
                                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-pink-500 rounded-2xl animate-in zoom-in duration-500">
                                    <div class="absolute -top-10 left-0 bg-pink-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                        Component Detected: 98%
                                    </div>
                                    <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-lg" />
                                    <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-lg" />
                                    <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-lg" />
                                    <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-lg" />
                                </div>
                            </Show>

                            {/* UI Overlays */}
                            <div class="absolute top-6 left-6 flex gap-2">
                                <div class="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-2">
                                    <div class="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                    Live View
                                </div>
                                <div class="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] uppercase tracking-wider">
                                    1080p · AI-E v2.4
                                </div>
                            </div>

                            {/* Center Button (if not scanning) */}
                            <Show when={!scanning() && !result()}>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <button 
                                        onClick={startScan}
                                        class="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition duration-500"
                                    >
                                        <Scan size={32} class="text-white" />
                                    </button>
                                </div>
                            </Show>
                        </div>
                        
                        <div class="mt-6 flex justify-center gap-4">
                            <button 
                                onClick={startScan}
                                disabled={scanning()}
                                class="px-8 py-3 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-lg shadow-pink-500/20 flex items-center gap-2"
                            >
                                {scanning() ? <RefreshCw size={18} class="animate-spin" /> : <Camera size={18} />}
                                {scanning() ? "Scanning..." : "Capture Frame"}
                            </button>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div class="space-y-6">
                        <Show when={result()} fallback={
                            <div class="h-full min-h-[400px] rounded-[40px] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center p-12 text-center text-zinc-500">
                                <Scan size={48} class="mb-6 opacity-20" />
                                <h3 class="text-xl font-bold mb-2">No Results Yet</h3>
                                <p class="text-sm">Place a component in frame and click capture to start the analysis.</p>
                            </div>
                        }>
                            <div class="p-8 rounded-[40px] border border-pink-500/30 bg-pink-500/5 backdrop-blur-3xl animate-in slide-in-from-right-8 duration-700">
                                <div class="flex items-center gap-4 mb-8">
                                    <div class="h-16 w-16 rounded-2xl bg-pink-500 text-black flex items-center justify-center">
                                        <Cpu size={32} />
                                    </div>
                                    <div>
                                        <h2 class="text-3xl font-black">{result().name}</h2>
                                        <p class="text-pink-400 font-medium">{result().type}</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-4 mb-8">
                                    <div class="p-4 rounded-2xl bg-black/20 border border-white/5">
                                        <p class="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">Manufacturer</p>
                                        <p class="font-bold">{result().manufacturer}</p>
                                    </div>
                                    <div class="p-4 rounded-2xl bg-black/20 border border-white/5">
                                        <p class="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">Package</p>
                                        <p class="font-bold">{result().package}</p>
                                    </div>
                                    <div class="p-4 rounded-2xl bg-black/20 border border-white/5">
                                        <p class="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">Pins</p>
                                        <p class="font-bold">{result().pins} Pins</p>
                                    </div>
                                    <div class="p-4 rounded-2xl bg-black/20 border border-white/5">
                                        <p class="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">Confidence</p>
                                        <p class="font-bold text-emerald-400">{result().confidence}</p>
                                    </div>
                                </div>

                                <div class="space-y-3">
                                    <button class="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition flex items-center justify-center gap-2">
                                        <Search size={18} />
                                        Find Datasheet
                                    </button>
                                    <button class="w-full py-4 bg-white/10 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition">
                                        Buy from Mouser/DigiKey
                                    </button>
                                </div>
                            </div>
                        </Show>

                        <div class="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                            <h4 class="font-bold mb-4 flex items-center gap-2">
                                <CheckCircle size={18} class="text-emerald-400" />
                                Pro Tips
                            </h4>
                            <ul class="text-xs text-zinc-500 space-y-3 leading-relaxed">
                                <li>• Ensure good lighting for better OCR label decoding.</li>
                                <li>• Hold the part approximately 10-15cm from the lens.</li>
                                <li>• Focus on the top-side marking for integrated circuits.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0%, 100% { top: 10%; }
                    50% { top: 90%; }
                }
            `}</style>
        </div>
    );
}
