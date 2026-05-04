// src/pages/not-found.jsx
import { A } from "@solidjs/router";
import { AlertTriangle, ArrowLeft, Home, ZapOff } from "lucide-solid";

export default function NotFound() {
    return (
        <div class="min-h-screen bg-[#05070b] text-white flex items-center justify-center p-6">
            {/* Ambient Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-1/4 left-1/4 h-[30rem] w-[30rem] rounded-full bg-red-500/10 blur-[150px]" />
                <div class="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-500/10 blur-[150px]" />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            <div class="max-w-2xl w-full text-center animate-in fade-in zoom-in-95 duration-700">
                <div class="relative inline-block mb-8">
                    {/* Glowing background behind the icon */}
                    <div class="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                    <div class="relative h-32 w-32 mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.15)]">
                        <ZapOff size={64} class="text-red-400" />
                    </div>
                </div>

                <div class="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-1.5 text-xs text-red-300 mb-6 tracking-widest uppercase">
                    <AlertTriangle size={14} />
                    Open Circuit Detected
                </div>

                <h1 class="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
                    404
                </h1>
                
                <h2 class="text-2xl md:text-3xl font-bold mb-6">
                    Connection Lost.
                </h2>

                <p class="text-lg text-zinc-400 max-w-lg mx-auto mb-10">
                    The page you are looking for has been disconnected, moved, or never existed in the first place. Let's get you back to a working circuit.
                </p>

                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <A 
                        href="/"
                        class="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95"
                    >
                        <Home size={20} />
                        Back to Home
                    </A>
                    <button 
                        onClick={() => window.history.back()}
                        class="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
