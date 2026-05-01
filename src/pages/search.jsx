// src/pages/search.jsx
import { createSignal, createMemo, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import {
    Search,
    ArrowLeft,
    Cpu,
    FileText,
    Download,
    Box,
    Zap,
    Settings,
    AlertCircle,
    CheckCircle2,
    Microchip,
} from "lucide-solid";

// Mock Database of Components
const MOCK_COMPONENTS = [
    {
        id: "NE555",
        name: "NE555",
        type: "Timer IC",
        description: "Precision timing circuit capable of producing accurate time delays or oscillation.",
        specs: {
            "Operating Voltage": "4.5V - 15V",
            "Output Current": "200mA",
            "Max Frequency": "500 kHz",
            "Power Dissipation": "600 mW"
        },
        packages: ["DIP-8", "SOIC-8"],
        alternatives: ["LM555", "TLC555", "SE555"],
        datasheetUrl: "#",
        status: "Active",
        category: "IC"
    },
    {
        id: "LM317",
        name: "LM317",
        type: "Voltage Regulator",
        description: "3-terminal adjustable positive voltage regulator capable of supplying in excess of 1.5A over a 1.2V to 37V output range.",
        specs: {
            "Input Voltage Max": "40V",
            "Output Voltage": "1.2V - 37V",
            "Output Current": "1.5A",
            "Reference Voltage": "1.25V"
        },
        packages: ["TO-220", "SOT-223", "TO-263"],
        alternatives: ["LM338", "LM350"],
        datasheetUrl: "#",
        status: "Active",
        category: "IC"
    },
    {
        id: "2N3904",
        name: "2N3904",
        type: "NPN BJT",
        description: "General purpose NPN bipolar junction transistor designed for general purpose amplifier and switching applications.",
        specs: {
            "Vce Max": "40V",
            "Ic Max": "200mA",
            "hFE": "100 - 300",
            "Transition Freq": "300 MHz"
        },
        packages: ["TO-92", "SOT-23"],
        alternatives: ["2N2222", "BC547"],
        datasheetUrl: "#",
        status: "Active",
        category: "Discrete"
    },
    {
        id: "LM358",
        name: "LM358",
        type: "Op-Amp",
        description: "Dual, low-power operational amplifier designed to operate from a single power supply over a wide range of voltages.",
        specs: {
            "Supply Voltage": "3V - 32V",
            "Input Offset Voltage": "2mV",
            "Slew Rate": "0.3 V/µs",
            "Gain Bandwidth": "1 MHz"
        },
        packages: ["DIP-8", "SOIC-8", "TSSOP-8"],
        alternatives: ["LM324", "TL072"],
        datasheetUrl: "#",
        status: "Active",
        category: "IC"
    },
    {
        id: "1N4148",
        name: "1N4148",
        type: "Switching Diode",
        description: "High-speed switching diode used in signal processing and fast logic applications.",
        specs: {
            "Reverse Voltage": "100V",
            "Forward Current": "300mA",
            "Reverse Recovery": "4ns",
            "Forward Voltage": "1V @ 10mA"
        },
        packages: ["DO-35", "SOD-123", "LL-34"],
        alternatives: ["1N914"],
        datasheetUrl: "#",
        status: "Active",
        category: "Discrete"
    },
    {
        id: "IRF540N",
        name: "IRF540N",
        type: "N-Channel MOSFET",
        description: "Advanced HEXFET Power MOSFETs provide the designer with the best combination of fast switching, ruggedized device design, low on-resistance.",
        specs: {
            "Vds Max": "100V",
            "Id Max": "33A",
            "Rds(on)": "44 mΩ",
            "Gate Charge": "71 nC"
        },
        packages: ["TO-220AB"],
        alternatives: ["IRFZ44N", "STP55NF06"],
        datasheetUrl: "#",
        status: "Active",
        category: "Discrete"
    }
];

export default function SearchPage() {
    const [query, setQuery] = createSignal("");

    const filteredComponents = createMemo(() => {
        const lowerQuery = query().toLowerCase();
        if (!lowerQuery) return [];
        
        return MOCK_COMPONENTS.filter(comp => 
            comp.name.toLowerCase().includes(lowerQuery) ||
            comp.type.toLowerCase().includes(lowerQuery) ||
            comp.description.toLowerCase().includes(lowerQuery)
        );
    });

    return (
        <div class="min-h-screen bg-[#05070b] text-white">
            {/* Ambient Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-0 right-1/4 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[150px]" />
                <div class="absolute bottom-1/4 left-0 h-[34rem] w-[34rem] rounded-full bg-blue-500/10 blur-[150px]" />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            <div class="px-6 py-12 md:px-12 md:py-16 mx-auto max-w-6xl flex flex-col min-h-screen">
                
                {/* Header */}
                <div class="flex items-center justify-between mb-12">
                    <A href="/tools" class="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-300 transition group">
                        <ArrowLeft size={18} class="transition-transform group-hover:-translate-x-1" />
                        <span>Back to Tools</span>
                    </A>
                    
                    <div class="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs text-cyan-300">
                        <Search size={14} />
                        Smart Component Search
                    </div>
                </div>

                {/* Search Hero */}
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Find Specs, Fast.
                    </h1>
                    <p class="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
                        Search over thousands of electronic components to find datasheets, alternatives, and technical specifications instantly.
                    </p>

                    <div class="relative max-w-3xl mx-auto group">
                        <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-[28px] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                        <div class="relative flex items-center bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-2 shadow-2xl">
                            <Search size={28} class="text-zinc-500 ml-4 mr-2" />
                            <input 
                                type="text"
                                placeholder="Search 'NE555', 'Op-Amp', 'Transistor'..."
                                class="w-full bg-transparent text-xl text-white placeholder:text-zinc-600 outline-none px-4 py-4"
                                value={query()}
                                onInput={(e) => setQuery(e.currentTarget.value)}
                            />
                            <Show when={query().length > 0}>
                                <div class="px-4 text-sm text-cyan-400 font-medium whitespace-nowrap border-l border-white/10 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                    <CheckCircle2 size={16} />
                                    {filteredComponents().length} Found
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div class="flex-1">
                    <Show 
                        when={query().length > 0} 
                        fallback={
                            <div class="flex flex-col items-center justify-center h-64 opacity-40">
                                <Microchip size={64} class="mb-4 text-zinc-600" />
                                <p class="text-xl text-zinc-500 font-medium">Start typing to search components</p>
                            </div>
                        }
                    >
                        <Show 
                            when={filteredComponents().length > 0}
                            fallback={
                                <div class="flex flex-col items-center justify-center h-64 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <AlertCircle size={48} class="mb-4 text-yellow-500/50" />
                                    <p class="text-xl text-zinc-300 font-medium">No components found for "{query()}"</p>
                                    <p class="text-zinc-500 mt-2">Try a different keyword or part number.</p>
                                </div>
                            }
                        >
                            <div class="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <For each={filteredComponents()}>
                                    {(comp) => (
                                        <div class="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/[0.07] hover:border-cyan-500/30 transition-all duration-300 group overflow-hidden relative">
                                            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                            
                                            <div class="flex justify-between items-start mb-4 relative z-10">
                                                <div>
                                                    <div class="flex items-center gap-2 mb-1">
                                                        <span class="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md">
                                                            {comp.category}
                                                        </span>
                                                        <span class="text-xs text-zinc-500 flex items-center gap-1">
                                                            <CheckCircle2 size={12} class="text-emerald-400" />
                                                            {comp.status}
                                                        </span>
                                                    </div>
                                                    <h2 class="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">{comp.name}</h2>
                                                    <p class="text-zinc-400 text-sm font-medium">{comp.type}</p>
                                                </div>
                                                <button class="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shadow-lg group-hover:border-cyan-500/30 group-hover:text-cyan-300">
                                                    <Download size={18} />
                                                </button>
                                            </div>

                                            <p class="text-sm text-zinc-300 leading-relaxed mb-6 line-clamp-2 relative z-10">
                                                {comp.description}
                                            </p>

                                            <div class="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                                <For each={Object.entries(comp.specs).slice(0, 4)}>
                                                    {([key, val]) => (
                                                        <div class="bg-black/20 rounded-xl p-3 border border-white/5">
                                                            <div class="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{key}</div>
                                                            <div class="text-sm font-medium text-zinc-200">{val}</div>
                                                        </div>
                                                    )}
                                                </For>
                                            </div>

                                            <div class="border-t border-white/10 pt-4 flex items-center justify-between relative z-10">
                                                <div class="flex items-center gap-4 text-xs text-zinc-400">
                                                    <div class="flex items-center gap-1.5">
                                                        <Box size={14} class="text-violet-400" />
                                                        {comp.packages.slice(0, 2).join(", ")}
                                                        {comp.packages.length > 2 && " ..."}
                                                    </div>
                                                    <div class="flex items-center gap-1.5">
                                                        <Cpu size={14} class="text-amber-400" />
                                                        {comp.alternatives.length} Alternatives
                                                    </div>
                                                </div>
                                                <a href={comp.datasheetUrl} class="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                                                    Datasheet
                                                    <FileText size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </Show>
                </div>
            </div>
        </div>
    );
}
