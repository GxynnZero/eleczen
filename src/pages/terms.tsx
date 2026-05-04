// src/pages/terms.jsx
import { createSignal, For } from "solid-js";
import { Shield, Lock, FileText, ChevronRight, Scale } from "lucide-solid";

export default function Terms() {
    const [activeSection, setActiveSection] = createSignal("terms");

    const sections = [
        { id: "terms", title: "Terms of Service", icon: Scale },
        { id: "privacy", title: "Privacy Policy", icon: Shield },
    ];

    return (
        <div class="min-h-screen bg-[#05070b] text-white">
            {/* Ambient Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-0 right-0 h-[40rem] w-[40rem] rounded-full bg-cyan-500/5 blur-[150px]" />
                <div class="absolute bottom-0 left-0 h-[40rem] w-[40rem] rounded-full bg-blue-500/5 blur-[150px]" />
            </div>

            <div class="max-w-7xl mx-auto px-6 py-20 md:py-32">
                <div class="flex flex-col lg:flex-row gap-12">
                    {/* Sticky Sidebar Navigation */}
                    <aside class="lg:w-80 lg:sticky lg:top-32 h-fit">
                        <div class="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs text-cyan-300 mb-8 uppercase tracking-widest font-semibold">
                            <FileText size={14} />
                            Legal
                        </div>
                        <h1 class="text-4xl font-black mb-10 tracking-tight">Legal Center</h1>
                        
                        <div class="space-y-2">
                            <For each={sections}>
                                {(section) => (
                                    <button 
                                        onClick={() => setActiveSection(section.id)}
                                        class={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                                            activeSection() === section.id 
                                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                                            : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div class="flex items-center gap-3">
                                            <section.icon size={20} />
                                            <span class="font-medium">{section.title}</span>
                                        </div>
                                        <ChevronRight size={18} class={`transition-transform ${activeSection() === section.id ? 'rotate-90' : ''}`} />
                                    </button>
                                )}
                            </For>
                        </div>

                        <div class="mt-12 p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                            <div class="flex items-center gap-2 text-zinc-300 font-semibold mb-4">
                                <Lock size={18} class="text-emerald-400" />
                                Data Security
                            </div>
                            <p class="text-sm text-zinc-500 leading-relaxed">
                                We use industry-standard encryption to protect your circuit designs and personal data. Your privacy is our priority.
                            </p>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main class="flex-1 max-w-4xl animate-in fade-in slide-in-from-right-8 duration-700">
                        {activeSection() === 'terms' ? (
                            <div class="space-y-12">
                                <section>
                                    <h2 class="text-3xl font-bold mb-6 text-white">Terms of Service</h2>
                                    <p class="text-sm text-zinc-500 mb-8">Last Updated: May 1, 2026</p>
                                    <div class="prose prose-invert max-w-none space-y-6 text-zinc-400 leading-relaxed">
                                        <p>Welcome to ElecZen. By using our platform, you agree to comply with and be bound by the following terms of service. Please read them carefully.</p>
                                        
                                        <h4 class="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h4>
                                        <p>By accessing or using ElecZen, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

                                        <h4 class="text-xl font-semibold text-white mt-8">2. Use License</h4>
                                        <p>Permission is granted to temporarily use ElecZen for personal or commercial circuit simulation. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                                        <ul class="list-disc pl-6 space-y-2">
                                            <li>Modify or copy the core simulation engine materials.</li>
                                            <li>Use the materials for any public display without attribution.</li>
                                            <li>Attempt to decompile or reverse engineer any software contained on the platform.</li>
                                            <li>Remove any copyright or other proprietary notations from the materials.</li>
                                        </ul>

                                        <h4 class="text-xl font-semibold text-white mt-8">3. Simulation Accuracy</h4>
                                        <p>While we strive for high precision, the simulations provided by ElecZen are for educational and prototyping purposes. We do not guarantee that simulated circuits will behave identically in real-world hardware environments due to environmental factors and component tolerances.</p>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div class="space-y-12">
                                <section>
                                    <h2 class="text-3xl font-bold mb-6 text-white">Privacy Policy</h2>
                                    <p class="text-sm text-zinc-500 mb-8">Last Updated: May 1, 2026</p>
                                    <div class="prose prose-invert max-w-none space-y-6 text-zinc-400 leading-relaxed">
                                        <p>Your privacy is important to us. It is ElecZen's policy to respect your privacy regarding any information we may collect from you across our website.</p>
                                        
                                        <h4 class="text-xl font-semibold text-white mt-8">1. Information We Collect</h4>
                                        <p>We only ask for personal information when we truly need it to provide a service to you (such as account creation). We collect it by fair and lawful means, with your knowledge and consent.</p>

                                        <h4 class="text-xl font-semibold text-white mt-8">2. Data Storage</h4>
                                        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>

                                        <h4 class="text-xl font-semibold text-white mt-8">3. Cookie Policy</h4>
                                        <p>We use cookies to handle session management and remember your workspace preferences. We do not use tracking cookies for third-party advertising.</p>

                                        <h4 class="text-xl font-semibold text-white mt-8">4. Project Privacy</h4>
                                        <p>Your circuit designs are private to your account by default. We do not share your project data with third parties unless you explicitly choose to make a project public for community sharing.</p>
                                    </div>
                                </section>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
