
// src/pages/Onboarding.jsx
import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import {
    Zap,
    Cpu,
    Lightbulb,
    Play,
    ChevronRight,
    Sparkles,
    BookOpen,
    Wrench,
    ShieldCheck,
    Globe,
    Rocket,
    ArrowDown,
    Mail,
    ChevronUp,
    Orbit,
    Layers3,
    Stars,
} from "lucide-solid";

const features = [
    {
        icon: Zap,
        title: "Live Simulation",
        desc: "Instant current, voltage, and response while wiring in real time.",
    },
    {
        icon: Cpu,
        title: "Smart Builder",
        desc: "Fast drag-and-drop component workflows with clean feedback.",
    },
    {
        icon: Lightbulb,
        title: "Visual Learning",
        desc: "Understand circuits by watching behavior, flow, and state change.",
    },
];

const pages = [
    {
        icon: Globe,
        title: "Home",
        desc: "A cinematic landing experience with premium motion and depth.",
    },
    {
        icon: Wrench,
        title: "Tools",
        desc: "Converters, calculators, and engineering helpers in one place.",
    },
    {
        icon: BookOpen,
        title: "Blogs",
        desc: "Structured learning content for beginners through advanced users.",
    },
    {
        icon: ShieldCheck,
        title: "Account",
        desc: "Save projects, manage your workspace, and keep everything synced.",
    },
];

const metrics = [
    { value: 120, suffix: "+", label: "Components modeled" },
    { value: 99, suffix: "%", label: "Fluid visual clarity" },
    { value: 24, suffix: "ms", label: "Interaction latency target" },
    { value: 8, suffix: "x", label: "More engaging workflow" },
];

const testimonials = [
    {
        quote:
            "The interface feels like a premium design tool, but it still teaches electronics clearly. The motion is excellent without getting in the way.",
        name: "Ava Morgan",
        role: "Hardware Product Lead",
    },
    {
        quote:
            "The landing page is polished enough to sell the vision on its own. It feels like Linear met a circuit simulator and raised the bar.",
        name: "Noah Chen",
        role: "Frontend Engineer",
    },
    {
        quote:
            "The cinematic sections and glass cards make the product feel expensive immediately. That is exactly the right first impression for SaaS.",
        name: "Maya Patel",
        role: "Design Systems Consultant",
    },
];

const trustBadges = [
    "Realtime Physics",
    "Clean Routing",
    "Precision Tools",
    "Premium UI",
    "Team Ready",
    "Learning First",
];

const socialLinks = [
    { label: "Orbit", icon: Orbit },
    { label: "Mail", icon: Mail },
    { label: "Top", icon: ChevronUp, href: "#top" },
];

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
}

function Reveal(props) {
    let node;
    const [shown, setShown] = createSignal(false);

    onMount(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);

                    if (props.once !== false) {
                        observer.disconnect();
                    }
                }
            },
            {
                threshold: props.threshold ?? 0.18,
                rootMargin: props.rootMargin ?? "0px 0px -8% 0px",
            }
        );

        if (node) {
            observer.observe(node);
        }

        onCleanup(() => observer.disconnect());
    });

    return (
        <div
            ref={node}
            class={`transition-all duration-1000 ease-out will-change-transform ${shown()
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-14 scale-[0.98]"
                } ${props.class ?? ""}`}
            style={props.style}
        >
            {props.children}
        </div>
    );
}

function GlowCard(props) {
    let node;
    const [spot, setSpot] = createSignal({ x: "50%", y: "30%" });

    const updateSpot = (event) => {
        if (!node) {
            return;
        }

        const rect = node.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        setSpot({
            x: `${clamp(x, 0, 100)}%`,
            y: `${clamp(y, 0, 100)}%`,
        });
    };

    return (
        <div
            ref={node}
            onMouseMove={updateSpot}
            onMouseLeave={() => setSpot({ x: "50%", y: "30%" })}
            class={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_18px_80px_rgba(0,0,0,0.35)] transition-all duration-500 will-change-transform hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-[0_28px_90px_rgba(0,0,0,0.48)] ${props.class ?? ""
                }`}
            style={props.style}
        >
            <div
                class="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(480px circle at ${spot().x} ${spot().y}, rgba(34,211,238,0.16), transparent 42%)`,
                }}
            />
            <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_34%,rgba(255,255,255,0.03)_68%,transparent)] opacity-20" />
            <div class="relative z-10">{props.children}</div>
        </div>
    );
}

function AnimatedButton(props) {
    const classes =
        props.variant === "ghost"
            ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            : "border border-cyan-300/20 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_60px_rgba(34,211,238,0.25)]";

    const content = (
        <>
            <span class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span class="relative z-10 flex items-center gap-2">{props.children}</span>
        </>
    );

    const shared = `group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-6 py-4 text-sm font-semibold tracking-wide transition-all duration-300 will-change-transform hover:-translate-y-0.5 hover:scale-[1.02] ${classes} ${props.class ?? ""
        }`;

    if (props.href) {
        return (
            <A href={props.href} class={shared}>
                {content}
            </A>
        );
    }

    return (
        <button type="button" class={shared} onClick={props.onClick}>
            {content}
        </button>
    );
}

function StatCounter(props) {
    let node;
    const [value, setValue] = createSignal(0);

    const animate = () => {
        const duration = props.duration ?? 1400;
        const start = performance.now();

        const tick = (now) => {
            const progress = clamp((now - start) / duration, 0, 1);
            setValue(Math.round(easeOutCubic(progress) * props.value));

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    };

    onMount(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    animate();
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (node) {
            observer.observe(node);
        }

        onCleanup(() => observer.disconnect());
    });

    return (
        <div ref={node} class="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div class="text-4xl font-black tracking-tight text-white md:text-5xl">
                {value()}
                <span class="text-cyan-300">{props.suffix}</span>
            </div>
            <p class="mt-2 text-sm text-zinc-400">{props.label}</p>
        </div>
    );
}

function TestimonialsCarousel() {
    const [active, setActive] = createSignal(0);

    onMount(() => {
        const interval = setInterval(() => {
            setActive((current) => (current + 1) % testimonials.length);
        }, 4600);

        onCleanup(() => clearInterval(interval));
    });

    return (
        <div class="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_24px_100px_rgba(0,0,0,0.35)]">
            <div
                class="flex transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translate3d(-${active() * 100}%, 0, 0)` }}
            >
                <For each={testimonials}>
                    {(item) => (
                        <div class="min-w-full p-8 md:p-10">
                            <div class="mb-6 flex items-center gap-2 text-cyan-300">
                                <Stars size={16} />
                                <Stars size={16} />
                                <Stars size={16} />
                                <Stars size={16} />
                                <Stars size={16} />
                            </div>

                            <p class="max-w-3xl text-lg leading-8 text-zinc-200 md:text-xl">
                                “{item.quote}”
                            </p>

                            <div class="mt-8 flex items-center gap-4">
                                <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                                    {item.name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .join("")}
                                </div>

                                <div>
                                    <p class="font-semibold text-white">{item.name}</p>
                                    <p class="text-sm text-zinc-400">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </For>
            </div>

            <div class="flex items-center justify-center gap-2 border-t border-white/10 px-6 py-4">
                <For each={testimonials}>
                    {(_, index) => (
                        <button
                            type="button"
                            onClick={() => setActive(index())}
                            class={`h-2.5 rounded-full transition-all duration-300 ${active() === index()
                                    ? "w-10 bg-cyan-300"
                                    : "w-2.5 bg-white/30 hover:bg-white/50"
                                }`}
                            aria-label={`Show testimonial ${index() + 1}`}
                        />
                    )}
                </For>
            </div>
        </div>
    );
}

function Marquee() {
    const [offset, setOffset] = createSignal(0);

    onMount(() => {
        let frame = 0;

        const loop = (time) => {
            setOffset((time * 0.004) % 50);
            frame = requestAnimationFrame(loop);
        };

        frame = requestAnimationFrame(loop);
        onCleanup(() => cancelAnimationFrame(frame));
    });

    return (
        <div class="overflow-hidden rounded-[26px] border border-white/10 bg-white/5 py-4 backdrop-blur-xl">
            <div
                class="flex w-max items-center gap-3 will-change-transform"
                style={{ transform: `translate3d(-${offset()}%, 0, 0)` }}
            >
                <For each={[...trustBadges, ...trustBadges]}>
                    {(badge) => (
                        <div class="mx-2 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                            <div class="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
                            {badge}
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
}

function CursorGlow(props) {
    return (
        <div class="pointer-events-none fixed inset-0 z-[2] hidden xl:block">
            <div
                class="absolute h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px] mix-blend-screen transition-transform duration-150 will-change-transform"
                style={{ transform: `translate3d(${props.x * 0.92}px, ${props.y * 0.92}px, 0) translate(-50%, -50%)` }}
            />
            <div
                class="absolute h-44 w-44 rounded-full bg-blue-400/12 blur-[90px] mix-blend-screen transition-transform duration-300 will-change-transform"
                style={{ transform: `translate3d(${props.x}px, ${props.y}px, 0) translate(-50%, -50%)` }}
            />
        </div>
    );
}

export default function Home() {
    const [introVisible, setIntroVisible] = createSignal(true);
    const [mouse, setMouse] = createSignal({ x: 0, y: 0 });
    const [heroReady, setHeroReady] = createSignal(false);

    const onMouseMove = (event) => {
        setMouse({ x: event.clientX, y: event.clientY });
    };

    onMount(() => {
        const introTimer = setTimeout(() => {
            setIntroVisible(false);
        }, 950);

        const heroTimer = setTimeout(() => {
            setHeroReady(true);
        }, 200);

        window.addEventListener("mousemove", onMouseMove, { passive: true });

        onCleanup(() => {
            clearTimeout(introTimer);
            clearTimeout(heroTimer);
            window.removeEventListener("mousemove", onMouseMove);
        });
    });

    const heroParallaxStyle = () => ({
        transform: `translate3d(${mouse().x * 0.008}px, ${mouse().y * 0.008}px, 0)`,
    });

    const heroMockupStyle = () => ({
        transform: `translate3d(${mouse().x * -0.01}px, ${mouse().y * -0.01}px, 0) rotateX(${clamp((mouse().y - window.innerHeight / 2) * 0.01, -8, 8)}deg) rotateY(${clamp((mouse().x - window.innerWidth / 2) * -0.01, -8, 8)}deg)`,
    });

    const stars = Array.from({ length: 28 }, (_, index) => ({
        left: (index * 7.3) % 100,
        top: (index * 13.1) % 100,
        size: 1 + (index % 3),
        delay: (index % 8) * 0.35,
        opacity: 0.15 + (index % 5) * 0.08,
    }));

    return (
        <div class="relative min-h-screen bg-[#05070b] text-white scroll-smooth snap-y snap-mandatory">
            <Show when={introVisible()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#05070b] transition-all duration-700" style={{ opacity: introVisible() ? 1 : 0, transform: introVisible() ? "scale(1)" : "scale(1.03)" }}>
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_30%)]" />
                    <div class="relative flex flex-col items-center gap-5">
                        <div class="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(34,211,238,0.22)]">
                            <div class="absolute inset-0 rounded-[28px] bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-emerald-400/20 blur-xl" />
                            <div class="relative text-black">
                                <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 flex items-center justify-center font-black shadow-[0_0_35px_rgba(34,211,238,0.25)]">
                                    EZ
                                </div>
                            </div>
                        </div>
                        <p class="text-sm uppercase tracking-[0.45em] text-cyan-200/80">Loading Experience</p>
                        <div class="h-px w-48 overflow-hidden rounded-full bg-white/10">
                            <div class="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-300" />
                        </div>
                    </div>
                </div>
            </Show>

            <CursorGlow x={mouse().x} y={mouse().y} />

            <div class="fixed inset-0 -z-20 overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_26%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_32%)]" />
                <div class="absolute -left-24 top-[-6rem] h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-[180px]" style={heroParallaxStyle()} />
                <div class="absolute right-[-6rem] top-1/4 h-[28rem] w-[28rem] rounded-full bg-blue-500/16 blur-[180px]" style={heroParallaxStyle()} />
                <div class="absolute bottom-[-8rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-emerald-400/10 blur-[180px]" style={heroParallaxStyle()} />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] opacity-70" />
                <div class="absolute inset-0 bg-[radial-gradient(circle,transparent_0_72%,rgba(0,0,0,0.48)_100%)]" />

                <For each={stars}>
                    {(star) => (
                        <div
                            class="absolute rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.9)] animate-pulse"
                            style={{
                                left: `${star.left}%`,
                                top: `${star.top}%`,
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                opacity: `${star.opacity}`,
                                "animation-delay": `${star.delay}s`,
                            }}
                        />
                    )}
                </For>
            </div>

            <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div class="absolute left-[8%] top-[12%] h-24 w-24 rounded-full border border-cyan-400/20 bg-cyan-400/5 blur-3xl animate-pulse" />
                <div class="absolute right-[12%] top-[28%] h-20 w-20 rounded-full border border-blue-400/20 bg-blue-400/5 blur-3xl animate-pulse" />
                <div class="absolute left-[38%] bottom-[12%] h-28 w-28 rounded-full border border-emerald-400/20 bg-emerald-400/5 blur-3xl animate-pulse" />
            </div>

            <section id="top" class="snap-start relative min-h-screen px-6 py-8 md:px-8 md:py-14">
                <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center">
                    <Reveal class="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]" style={{ "transition-delay": "40ms" }}>
                        <div class="relative z-10" style={heroParallaxStyle()}>
                            <div class={`inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-100 backdrop-blur-xl transition-all duration-700 ${heroReady() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                                <Sparkles size={14} />
                                Next Generation Electronics Workspace
                            </div>

                            <h1 class={`mt-7 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.05em] text-white md:text-7xl lg:text-[5.4rem] transition-all duration-900 ${heroReady() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
                                Build Smart.
                                <span class="mt-3 block bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.18)]">
                                    Learn Faster.
                                </span>
                            </h1>

                            <p class={`mt-6 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg transition-all duration-900 delay-150 ${heroReady() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
                                ElecZen combines simulation, tools, blogs, and projects into a luxurious circuit studio with world-class motion, glass layers, and real product energy.
                            </p>

                            <div class={`mt-9 flex flex-wrap items-center gap-4 transition-all duration-900 delay-200 ${heroReady() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
                                <AnimatedButton href="/editor">
                                    Launch Simulator
                                    <ChevronRight size={18} class="transition-transform duration-300 group-hover:translate-x-1" />
                                </AnimatedButton>

                                <AnimatedButton variant="ghost" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                                    <Play size={16} />
                                    Watch Demo
                                </AnimatedButton>
                            </div>

                            <div class={`mt-8 flex flex-wrap items-center gap-5 text-sm text-zinc-400 transition-all duration-900 delay-300 ${heroReady() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
                                <div class="flex items-center gap-2">
                                    <div class="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.75)]" />
                                    Realtime physics
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)]" />
                                    Premium motion
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="h-2.5 w-2.5 rounded-full bg-blue-300 shadow-[0_0_18px_rgba(96,165,250,0.85)]" />
                                    Built for creators
                                </div>
                            </div>
                        </div>

                        <div class="relative mx-auto w-full max-w-2xl" style={heroMockupStyle()}>
                            <div class={`absolute -left-6 top-20 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-cyan-100 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-1000 ${heroReady() ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}>
                                Signal trace
                            </div>
                            <div class={`absolute right-2 top-10 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-emerald-100 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-1000 delay-150 ${heroReady() ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"}`}>
                                Live diagnostics
                            </div>
                            <div class={`absolute -bottom-6 left-10 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-blue-100 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-1000 delay-200 ${heroReady() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                                Premium routing
                            </div>

                            <GlowCard class="p-5 md:p-6">
                                <div class="mb-4 flex items-center justify-between">
                                    <div class="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                                        <div class="h-2.5 w-2.5 rounded-full bg-red-400" />
                                        <div class="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                                        <div class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                        Studio Canvas
                                    </div>
                                    <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-300">
                                        v2.0 live
                                    </div>
                                </div>

                                <div class="relative h-[540px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
                                    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
                                    <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/10 to-transparent" />
                                    <div class="absolute inset-0 overflow-hidden">
                                        <div class="absolute left-12 top-20 h-1 w-52 rounded-full bg-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.85)]" />
                                        <div class="absolute left-64 top-20 h-28 w-1 rounded-full bg-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.85)]" />
                                        <div class="absolute left-64 top-48 h-1 w-44 rounded-full bg-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.85)]" />

                                        <div class="absolute left-16 top-8 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-100 backdrop-blur-lg">
                                            Resistor
                                        </div>
                                        <div class="absolute left-[52%] top-32 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 backdrop-blur-lg">
                                            LED
                                        </div>
                                        <div class="absolute right-10 top-[18%] rounded-2xl border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-100 backdrop-blur-lg">
                                            Sensor node
                                        </div>
                                        <div class="absolute bottom-10 left-12 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-300 backdrop-blur-xl">
                                            Voltage: 4.8V
                                        </div>
                                        <div class="absolute bottom-16 right-10 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-300 backdrop-blur-xl">
                                            Current: 18mA
                                        </div>
                                    </div>
                                </div>
                            </GlowCard>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section class="snap-start px-6 py-20 md:px-8">
                <Reveal>
                    <div class="mx-auto max-w-7xl">
                        <Marquee />
                    </div>
                </Reveal>
            </section>

            <section id="features" class="snap-start px-6 py-24 md:px-8">
                <Reveal>
                    <div class="mx-auto max-w-7xl">
                        <div class="mx-auto mb-14 max-w-3xl text-center">
                            <p class="text-xs uppercase tracking-[0.45em] text-cyan-200/80">Features</p>
                            <h2 class="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">
                                A Core Experience Built Like a Premium Product
                            </h2>
                            <p class="mt-4 text-zinc-400 md:text-lg">
                                Every interaction is tuned for clarity, depth, and a polished sense of motion.
                            </p>
                        </div>

                        <div class="grid gap-6 md:grid-cols-3">
                            <For each={features}>
                                {(item, index) => {
                                    const Icon = item.icon;

                                    return (
                                        <GlowCard
                                            class="p-8"
                                            style={{ "transition-delay": `${index() * 120}ms` }}
                                        >
                                            <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                                                <Icon size={22} />
                                            </div>
                                            <h3 class="text-xl font-semibold tracking-[-0.02em] text-white">
                                                {item.title}
                                            </h3>
                                            <p class="mt-3 leading-7 text-zinc-400">
                                                {item.desc}
                                            </p>
                                        </GlowCard>
                                    );
                                }}
                            </For>
                        </div>
                    </div>
                </Reveal>
            </section>

            <section class="snap-start px-6 py-24 md:px-8">
                <Reveal>
                    <div class="mx-auto max-w-7xl">
                        <div class="mx-auto mb-14 max-w-3xl text-center">
                            <p class="text-xs uppercase tracking-[0.45em] text-emerald-200/80">Ecosystem</p>
                            <h2 class="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">
                                Everything Connected in One Beautiful Surface
                            </h2>
                        </div>

                        <div class="grid gap-6 md:grid-cols-2">
                            <For each={pages}>
                                {(page, index) => {
                                    const Icon = page.icon;

                                    return (
                                        <GlowCard class="p-8" style={{ "transition-delay": `${index() * 140}ms` }}>
                                            <div class="flex gap-5">
                                                <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-emerald-500/20 text-cyan-200 shadow-[0_0_36px_rgba(34,211,238,0.12)]">
                                                    <Icon size={24} />
                                                </div>
                                                <div>
                                                    <h3 class="text-xl font-semibold tracking-[-0.02em] text-white">
                                                        {page.title}
                                                    </h3>
                                                    <p class="mt-2 leading-7 text-zinc-400">
                                                        {page.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </GlowCard>
                                    );
                                }}
                            </For>
                        </div>
                    </div>
                </Reveal>
            </section>

            <section class="snap-start px-6 py-24 md:px-8">
                <Reveal>
                    <div class="mx-auto max-w-7xl">
                        <div class="grid gap-6 md:grid-cols-4">
                            <For each={metrics}>
                                {(metric) => <StatCounter {...metric} />}
                            </For>
                        </div>
                    </div>
                </Reveal>
            </section>

            <section class="snap-start px-6 py-24 md:px-8">
                <Reveal>
                    <div class="mx-auto max-w-7xl grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                        <div>
                            <p class="text-xs uppercase tracking-[0.45em] text-cyan-200/80">Testimonials</p>
                            <h2 class="mt-4 max-w-xl text-4xl font-black tracking-[-0.04em] md:text-5xl">
                                Built to Feel Premium at Every Scroll.
                            </h2>
                            <p class="mt-4 max-w-xl text-zinc-400 md:text-lg leading-8">
                                The motion system stays smooth, the glass layers stay clean, and the interactions keep the interface feeling alive.
                            </p>

                            <div class="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                                <div class="flex items-center gap-3 text-sm text-zinc-300">
                                    <Layers3 size={18} class="text-cyan-200" />
                                    Seamless motion, polished depth, and a subtle premium finish.
                                </div>
                            </div>
                        </div>

                        {/* <TestimonialsCarousel /> */}
                    </div>
                </Reveal>
            </section>

            <section class="snap-start px-6 py-24 md:px-8">
                <Reveal>
                    <div class="mx-auto max-w-7xl rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-8 backdrop-blur-2xl md:p-12 relative overflow-hidden">
                        <div class="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />
                        <div class="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-[120px]" />

                        <div class="relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                            <div>
                                <div class="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-cyan-100 backdrop-blur-xl">
                                    <Rocket size={14} />
                                    Premium CTA
                                </div>

                                <h2 class="mt-6 text-4xl font-black tracking-[-0.04em] md:text-5xl">
                                    Ready to Start Building Something Exceptional?
                                </h2>

                                <p class="mt-4 max-w-xl text-zinc-400 md:text-lg leading-8">
                                    Enter the smartest electronics playground and create circuits with a polished product experience from first click to final build.
                                </p>

                                <div class="mt-8 flex flex-wrap gap-4">
                                    <AnimatedButton href="/editor">
                                        Open Simulator
                                        <ChevronRight size={18} class="transition-transform duration-300 group-hover:translate-x-1" />
                                    </AnimatedButton>

                                    <AnimatedButton href="/signup" variant="ghost">
                                        Create Account
                                    </AnimatedButton>
                                </div>
                            </div>

                            <GlowCard class="p-6 md:p-8">
                                <div class="grid gap-4 md:grid-cols-2">
                                    <div class="rounded-[24px] border border-white/10 bg-black/20 p-5">
                                        <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Acceleration</p>
                                        <p class="mt-3 text-3xl font-black text-white">Fast</p>
                                        <p class="mt-2 text-sm leading-6 text-zinc-400">Smooth reveal timing and efficient transform-based interactions.</p>
                                    </div>
                                    <div class="rounded-[24px] border border-white/10 bg-black/20 p-5">
                                        <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Experience</p>
                                        <p class="mt-3 text-3xl font-black text-white">Lux</p>
                                        <p class="mt-2 text-sm leading-6 text-zinc-400">Glass layers, glow borders, and premium motion language.</p>
                                    </div>
                                </div>
                            </GlowCard>
                        </div>
                    </div>
                </Reveal>
            </section>

            <footer class="snap-start px-6 pb-10 md:px-8">
                <Reveal>
                    <div class="mx-auto max-w-7xl rounded-[30px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-[0_24px_120px_rgba(0,0,0,0.35)]">
                        <div class="grid gap-10 md:grid-cols-4">
                            <div>
                                <div class="flex items-center gap-3">
                                    <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-400 to-emerald-300 font-black text-black shadow-[0_0_36px_rgba(34,211,238,0.22)]">
                                        EZ
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-white">ElecZen</h3>
                                        <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Circuit Playground</p>
                                    </div>
                                </div>

                                <p class="mt-4 max-w-xs text-sm leading-7 text-zinc-400">
                                    Build, simulate, and learn electronics with a premium modern experience designed to feel sharp and memorable.
                                </p>
                            </div>

                            <div>
                                <h4 class="mb-4 font-semibold text-white">Platform</h4>
                                <div class="space-y-2 text-sm text-zinc-400">
                                    <a href="/editor" class="block transition hover:text-white">Simulator</a>
                                    <a href="/tools" class="block transition hover:text-white">Tools</a>
                                    <a href="/blogs" class="block transition hover:text-white">Blogs</a>
                                </div>
                            </div>

                            <div>
                                <h4 class="mb-4 font-semibold text-white">Account</h4>
                                <div class="space-y-2 text-sm text-zinc-400">
                                    <a href="/login" class="block transition hover:text-white">Login</a>
                                    <a href="/signup" class="block transition hover:text-white">Signup</a>
                                    <a href="/account" class="block transition hover:text-white">Dashboard</a>
                                </div>
                            </div>

                            <div>
                                <h4 class="mb-4 font-semibold text-white">Connect</h4>
                                <div class="flex gap-3">
                                    <For each={socialLinks}>
                                        {(social) => {
                                            const Icon = social.icon;

                                            return social.href ? (
                                                <a href={social.href} class="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
                                                    <Icon size={18} class="transition-transform duration-300 group-hover:scale-110" />
                                                </a>
                                            ) : (
                                                <button type="button" class="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
                                                    <Icon size={18} class="transition-transform duration-300 group-hover:scale-110" />
                                                </button>
                                            );
                                        }}
                                    </For>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
                            <span>© 2026 ElecZen. All rights reserved.</span>
                            <span>Crafted for engineers with precision and glow.</span>
                        </div>
                    </div>
                </Reveal>
            </footer>
        </div>
    );
}