import { Show, createSignal, createMemo, For } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
    BatteryCharging,
    Lightbulb,
    Plus,
    Search,
    Waves,
    X,
    Zap,
} from "lucide-solid";

import { PARTS } from "../lib/simulation/engine";
import { addComponent } from "../utils/simulation";
import { icons } from ".";

export default function Library() {
    const [open, setOpen] = createSignal(false);
    const [query, setQuery] = createSignal("");
    const [selected, setSelected] = createSignal("battery");

    const filteredParts = createMemo(() =>
        Object.entries(PARTS).filter(([type, spec]) =>
            spec.label.toLowerCase().includes(query().toLowerCase()) ||
            type.toLowerCase().includes(query().toLowerCase())
        )
    );

    const currentPart = createMemo(() => PARTS[selected()]);
    const CurrentIcon = createMemo(() => icons[selected()] || Zap);

    const handleAdd = (type) => {
        addComponent(type);
        setOpen(false);
    };

    return (
        <>
            {/* Trigger */}
            <button
                class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition"
                onClick={() => setOpen(true)}
            >
                Parts
            </button>

            {/* Modal */}
            <Show when={open()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        class="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={() => setOpen(false)}
                    />

                    {/* Modal */}
                    <div class="relative z-10 w-full max-w-5xl h-[80vh] rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex">

                        {/* LEFT SIDEBAR */}
                        <div class="w-80 border-r border-white/10 flex flex-col bg-zinc-900/70">

                            {/* Header */}
                            <div class="p-5 border-b border-white/10 flex items-center justify-between">
                                <h2 class="text-xl font-semibold text-white">
                                    Component Library
                                </h2>

                                <button
                                    class="p-2 rounded-lg hover:bg-white/10 transition"
                                    onClick={() => setOpen(false)}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Search */}
                            <div class="p-4">
                                <div class="relative">
                                    <Search
                                        size={16}
                                        class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Search parts..."
                                        value={query()}
                                        onInput={(e) => setQuery(e.currentTarget.value)}
                                        class="w-full pl-10 pr-3 py-2 rounded-xl bg-zinc-800 border border-white/10 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div class="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
                                <For each={filteredParts()}>
                                    {([type, spec]) => {
                                        const Icon = icons[type] || Zap;

                                        return (
                                            <button
                                                class={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition ${selected() === type
                                                    ? "bg-blue-600 text-white"
                                                    : "hover:bg-white/5 text-zinc-300"
                                                    }`}
                                                onClick={() => setSelected(type)}
                                            >
                                                <Icon size={18} />
                                                <div class="flex-1">
                                                    <div class="font-medium">{spec.label}</div>
                                                    <div class="text-xs opacity-70">{type}</div>
                                                </div>
                                            </button>
                                        );
                                    }}
                                </For>
                            </div>
                        </div>

                        {/* RIGHT PREVIEW */}
                        <div class="flex-1 flex flex-col bg-zinc-950">

                            {/* Preview Header */}
                            <div class="p-6 border-b border-white/10">
                                <h3 class="text-2xl font-semibold text-white">
                                    {currentPart()?.label}
                                </h3>
                                <p class="text-sm text-zinc-400 mt-1">
                                    Ready to place into your circuit workspace.
                                </p>
                            </div>

                            {/* Preview Body */}
                            <div class="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                                <div class="w-36 h-36 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner">
                                    <Dynamic component={CurrentIcon()} size={64} class="text-blue-400" />
                                </div>

                                <div class="text-center max-w-md">
                                    <p class="text-zinc-300 text-sm leading-relaxed">
                                        {currentPart()?.label} component can be added instantly to
                                        the board. Use it to build and simulate your DC circuits.
                                    </p>
                                </div>

                                <div class="grid grid-cols-2 gap-4 w-full max-w-md">
                                    <div class="rounded-2xl bg-zinc-900 border border-white/10 p-4">
                                        <div class="text-xs text-zinc-500">Type</div>
                                        <div class="text-white font-medium mt-1">
                                            {selected()}
                                        </div>
                                    </div>

                                    <div class="rounded-2xl bg-zinc-900 border border-white/10 p-4">
                                        <div class="text-xs text-zinc-500">Status</div>
                                        <div class="text-green-400 font-medium mt-1">
                                            Available
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div class="p-5 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    class="px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-300 transition"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition shadow-lg"
                                    onClick={() => handleAdd(selected())}
                                >
                                    <Plus size={16} />
                                    Add Component
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}