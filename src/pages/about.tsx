// src/pages/about.jsx
import { createSignal, Show } from "solid-js";
import { 
    Mail, 
    MessageSquare, 
    Globe, 
    X, 
    Code, 
    Users, 
    Send,
    Sparkles,
    Zap,
    Cpu,
    BookOpen
} from "lucide-solid";

export default function About() {
    const [sent, setSent] = createSignal(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 5000);
    };

    return (
        <div class="min-h-screen bg-[#05070b] text-white">
            {/* Ambient Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-0 left-1/4 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[150px]" />
                <div class="absolute bottom-0 right-1/4 h-[34rem] w-[34rem] rounded-full bg-blue-500/10 blur-[150px]" />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            <div class="px-6 py-20 md:px-12 md:py-32 mx-auto max-w-7xl">
                {/* Hero Section */}
                <div class="text-center mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div class="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs text-cyan-300 mb-6 uppercase tracking-widest">
                        <Sparkles size={14} />
                        Our Story
                    </div>
                    <h1 class="text-5xl md:text-7xl font-black mb-8 leading-tight">
                        Revolutionizing the <br />
                        <span class="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-300 bg-clip-text text-transparent">
                            Circuit Workspace.
                        </span>
                    </h1>
                    <p class="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        ElecZen was born from a simple idea: making electronics design as fluid and beautiful as modern software development. We bridge the gap between simulation and creativity.
                    </p>
                </div>

                {/* Values Grid */}
                <div class="grid md:grid-cols-3 gap-8 mb-32">
                    <div class="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl group hover:border-cyan-500/30 transition duration-500">
                        <div class="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition duration-500">
                            <Zap size={28} />
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Fast Performance</h3>
                        <p class="text-zinc-400 leading-7">
                            Built with SolidJS and custom physics engines for sub-millisecond interaction latency. Every wire move is instant.
                        </p>
                    </div>
                    <div class="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl group hover:border-blue-500/30 transition duration-500">
                        <div class="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition duration-500">
                            <Cpu size={28} />
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Smart Intelligence</h3>
                        <p class="text-zinc-400 leading-7">
                            Context-aware components and predictive routing that understands your intent before you even place a terminal.
                        </p>
                    </div>
                    <div class="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl group hover:border-emerald-500/30 transition duration-500">
                        <div class="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition duration-500">
                            <BookOpen size={28} />
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Educational Core</h3>
                        <p class="text-zinc-400 leading-7">
                            Not just a tool, but a learning platform. We believe in visual clarity to help users understand electron flow intuitively.
                        </p>
                    </div>
                </div>

                {/* Contact Section */}
                <div class="grid lg:grid-cols-2 gap-16 items-start">
                    <div class="animate-in fade-in slide-in-from-left-8 duration-700">
                        <h2 class="text-4xl font-bold mb-6">Get in touch</h2>
                        <p class="text-lg text-zinc-400 mb-10 leading-relaxed">
                            Have questions about our simulation engine? Need help with your account? Or just want to say hi? We'd love to hear from you.
                        </p>

                        <div class="space-y-6">
                            <div class="flex items-center gap-4 text-zinc-300">
                                <div class="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Mail size={20} class="text-cyan-400" />
                                </div>
                                <div>
                                    <p class="text-sm text-zinc-500">Email us at</p>
                                    <p class="font-medium">support@eleczen.io</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4 text-zinc-300">
                                <div class="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Globe size={20} class="text-blue-400" />
                                </div>
                                <div>
                                    <p class="text-sm text-zinc-500">Location</p>
                                    <p class="font-medium">Remote, Worldwide</p>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-4 mt-12">
                            {[X, Code, Users].map((Icon) => (
                                <a href="#" class="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div class="p-8 md:p-10 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
                        <Show when={!sent()} fallback={
                            <div class="py-20 text-center animate-in zoom-in duration-500">
                                <div class="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                    <Send size={32} class="text-emerald-400" />
                                </div>
                                <h3 class="text-2xl font-bold mb-2">Message Sent!</h3>
                                <p class="text-zinc-400">Thanks for reaching out. We'll get back to you shortly.</p>
                                <button onClick={() => setSent(false)} class="mt-8 text-cyan-400 font-semibold hover:underline">Send another message</button>
                            </div>
                        }>
                            <form onSubmit={handleSubmit} class="space-y-6">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-2">
                                        <label class="text-sm font-medium text-zinc-400">Name</label>
                                        <input required type="text" class="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500 transition" placeholder="John Doe" />
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-sm font-medium text-zinc-400">Email</label>
                                        <input required type="email" class="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500 transition" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium text-zinc-400">Subject</label>
                                    <select class="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500 transition text-zinc-400">
                                        <option>General Inquiry</option>
                                        <option>Technical Support</option>
                                        <option>Business Collaboration</option>
                                        <option>Feedback</option>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium text-zinc-400">Message</label>
                                    <textarea required rows="4" class="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500 transition resize-none" placeholder="Tell us more about your project..."></textarea>
                                </div>
                                <button type="submit" class="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-2xl transition shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 active:scale-95">
                                    <Send size={18} />
                                    Send Message
                                </button>
                            </form>
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    );
}
