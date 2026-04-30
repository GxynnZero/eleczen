// src/pages/Tools.jsx
import { For } from "solid-js";
import { A } from "@solidjs/router";
import {
    Camera,
    Zap,
    Cpu,
    Activity,
    Search,
    Grid,
    Battery,
    ArrowRight,
    Wrench,
    Microchip,
    Sparkles,
    Shield,
} from "lucide-solid";

const toolSections = [
    {
        title: "AI Powered Lab",
        subtitle: "Modern intelligence for electronics workflows",
        icon: Microchip,
        glow: "from-pink-500/20 to-purple-500/10",
        items: [
            {
                name: "Component Scanner",
                desc: "Detect ICs, resistors, capacitors and modules using AI vision + OCR.",
                href: "/tools/scanner",
                icon: Camera,
                color: "text-pink-400",
                bg: "bg-pink-500/10",
            },
            {
                name: "Smart Search",
                desc: "Find alternatives, specs, packages and datasheets instantly.",
                href: "/tools/search",
                icon: Search,
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
            },
            {
                name: "Circuit Recognizer",
                desc: "Convert hand-drawn schematics into clean digital diagrams.",
                href: "/tools/recognizer",
                icon: Grid,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
            },
        ],
    },

    {
        title: "Core Calculators",
        subtitle: "Everyday engineering tools with fast results",
        icon: Wrench,
        glow: "from-emerald-500/20 to-cyan-500/10",
        items: [
            {
                name: "Ohm's Law",
                desc: "Solve voltage, current, resistance and power values instantly.",
                href: "/tools/ohm",
                icon: Zap,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
            },
            {
                name: "Resistor Codes",
                desc: "Decode 4, 5 and 6 band resistor color values visually.",
                href: "/tools/resistor",
                icon: Activity,
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
            },
            {
                name: "Capacitor Decoder",
                desc: "Read capacitor labels and convert units in one click.",
                href: "/tools/capacitor",
                icon: Battery,
                color: "text-orange-400",
                bg: "bg-orange-500/10",
            },
        ],
    },
];

function ToolCard(props) {
    const Icon = props.item.icon;

    return (
        <A
            href={props.item.href}
            class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.07]"
        >
            {/* glow */}
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />

            {/* bg icon */}
            <div class="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition duration-700">
                <Icon size={130} class={props.item.color} />
            </div>

            <div class="relative z-10">
                <div
                    class={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 ${props.item.bg}`}
                >
                    <Icon size={28} class={props.item.color} />
                </div>

                <h3 class="text-2xl font-bold text-white group-hover:text-cyan-300 transition">
                    {props.item.name}
                </h3>

                <p class="mt-3 text-sm leading-7 text-zinc-400 min-h-[72px]">
                    {props.item.desc}
                </p>

                <div class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 group-hover:text-white transition">
                    Launch Tool
                    <ArrowRight
                        size={16}
                        class="transition group-hover:translate-x-1"
                    />
                </div>
            </div>
        </A>
    );
}

export default function Tools() {
    return (
        <div class="min-h-screen bg-[#05070b] text-white overflow-y-auto">
            {/* Ambient Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden">
                <div class="absolute top-0 right-0 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[150px]" />
                <div class="absolute bottom-0 left-0 h-[34rem] w-[34rem] rounded-full bg-pink-500/10 blur-[150px]" />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            <div class="px-6 py-20">
                <div class="mx-auto max-w-7xl">
                    {/* HERO */}
                    <section class="text-center">
                        <div class="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                            <Sparkles size={15} />
                            Premium Engineering Workspace
                        </div>

                        <h1 class="text-5xl font-black leading-tight md:text-7xl">
                            Engineering{" "}
                            <span class="bg-gradient-to-r from-cyan-400 via-blue-400 to-white bg-clip-text text-transparent">
                                Tools
                            </span>
                        </h1>

                        <p class="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
                            A modern toolkit for students, creators and engineers. AI
                            utilities, instant calculators, and precision helpers inside one
                            elegant workspace.
                        </p>

                        <div class="mt-10 flex flex-wrap justify-center gap-4">
                            <A
                                href="/tools/ohm"
                                class="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-4 font-semibold hover:scale-[1.02] transition"
                            >
                                Open Calculator
                            </A>

                            <A
                                href="/signup"
                                class="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 hover:bg-white/10 transition"
                            >
                                Create Account
                            </A>
                        </div>
                    </section>

                    {/* Stats */}
                    <section class="mt-20 grid gap-6 md:grid-cols-3">
                        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                            <p class="text-4xl font-black text-cyan-300">12+</p>
                            <p class="mt-2 text-zinc-400">Smart tools available</p>
                        </div>

                        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                            <p class="text-4xl font-black text-emerald-300">Fast</p>
                            <p class="mt-2 text-zinc-400">Instant calculations & outputs</p>
                        </div>

                        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                            <p class="text-4xl font-black text-pink-300">AI</p>
                            <p class="mt-2 text-zinc-400">Next-gen assisted workflows</p>
                        </div>
                    </section>

                    {/* Sections */}
                    <section class="mt-24 space-y-24">
                        <For each={toolSections}>
                            {(section) => {
                                const Icon = section.icon;

                                return (
                                    <div>
                                        {/* Header */}
                                        <div class="mb-10 flex items-center gap-5">
                                            <div
                                                class={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${section.glow}`}
                                            >
                                                <Icon size={24} class="text-white" />
                                            </div>

                                            <div>
                                                <h2 class="text-3xl font-bold">{section.title}</h2>
                                                <p class="text-zinc-400">{section.subtitle}</p>
                                            </div>

                                            <div class="hidden h-px flex-1 bg-gradient-to-r from-white/10 to-transparent md:block" />
                                        </div>

                                        {/* Grid */}
                                        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                            <For each={section.items}>
                                                {(item) => <ToolCard item={item} />}
                                            </For>
                                        </div>
                                    </div>
                                );
                            }}
                        </For>
                    </section>

                    {/* CTA */}
                    <section class="mt-28">
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl">
                            <div class="grid gap-8 lg:grid-cols-2 lg:items-center">
                                <div>
                                    <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                                        <Shield size={15} />
                                        Built for Engineers
                                    </div>

                                    <h3 class="text-4xl font-black leading-tight">
                                        Everything you need in one clean dashboard.
                                    </h3>

                                    <p class="mt-4 text-zinc-400 leading-8">
                                        Stop jumping between random websites. Use one elegant system
                                        for electronics calculations, recognition, search and
                                        productivity.
                                    </p>
                                </div>

                                <div class="flex flex-wrap gap-4 lg:justify-end">
                                    <A
                                        href="/signup"
                                        class="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-4 font-semibold"
                                    >
                                        Get Started
                                    </A>

                                    <A
                                        href="/login"
                                        class="rounded-2xl border border-white/10 bg-white/5 px-7 py-4"
                                    >
                                        Login
                                    </A>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}