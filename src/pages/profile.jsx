// src/pages/profile.jsx
import { createSignal, For } from "solid-js";
import { A } from "@solidjs/router";
import {
    User,
    Settings as SettingsIcon,
    Folder,
    Activity,
    LogOut,
    Home,
    Plus,
    Cpu,
    ArrowRight,
    Save,
    CreditCard,
    Bell,
    Shield
} from "lucide-solid";

const MOCK_PROJECTS = [
    { id: 1, name: "Audio Amplifier", date: "2 days ago", parts: 14, status: "stable" },
    { id: 2, name: "555 Timer Blinker", date: "1 week ago", parts: 8, status: "draft" },
    { id: 3, name: "Logic Gate Full Adder", date: "2 weeks ago", parts: 22, status: "stable" },
];

function Dashboard() {
    return (
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:bg-white/[0.07] transition">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                            <Folder size={24} class="text-cyan-400" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-400">Total Projects</p>
                            <p class="text-2xl font-bold text-white">12</p>
                        </div>
                    </div>
                </div>
                <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:bg-white/[0.07] transition">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <Cpu size={24} class="text-emerald-400" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-400">Custom Components</p>
                            <p class="text-2xl font-bold text-white">4</p>
                        </div>
                    </div>
                </div>
                <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:bg-white/[0.07] transition">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <Activity size={24} class="text-blue-400" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-400">Simulation Hours</p>
                            <p class="text-2xl font-bold text-white">47h</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Projects */}
            <div>
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-semibold text-white">Recent Projects</h2>
                    <A href="/editor" class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-sm font-medium">
                        <Plus size={16} />
                        New Project
                    </A>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <For each={MOCK_PROJECTS}>
                        {(project) => (
                            <div class="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:bg-white/[0.07] hover:border-cyan-500/30 transition duration-300">
                                <div class="flex justify-between items-start mb-6">
                                    <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                                        <Cpu size={20} class="text-cyan-300" />
                                    </div>
                                    <span class={`text-xs px-2.5 py-1 rounded-full font-medium ${project.status === 'stable' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                        {project.status}
                                    </span>
                                </div>
                                
                                <h3 class="text-xl font-semibold text-white mb-2">{project.name}</h3>
                                
                                <div class="flex items-center gap-4 text-sm text-zinc-400 mb-6">
                                    <span>{project.parts} components</span>
                                    <span class="h-1 w-1 rounded-full bg-zinc-600" />
                                    <span>{project.date}</span>
                                </div>

                                <A href="/editor" class="flex items-center justify-between text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition w-full">
                                    Open Project
                                    <ArrowRight size={16} class="transform group-hover:translate-x-1 transition" />
                                </A>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
}

function Settings() {
    return (
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <div class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <h3 class="text-xl font-semibold text-white mb-6">Profile Settings</h3>
                
                <div class="space-y-6">
                    <div class="flex items-center gap-6 pb-6 border-b border-white/10">
                        <div class="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                            EZ
                        </div>
                        <div>
                            <button class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition mb-2">
                                Change Avatar
                            </button>
                            <p class="text-xs text-zinc-400">JPG, GIF or PNG. 1MB max.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-zinc-400 mb-2">First Name</label>
                            <input type="text" value="Elec" class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-zinc-400 mb-2">Last Name</label>
                            <input type="text" value="Zen" class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition" />
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                            <input type="email" value="hello@eleczen.com" class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition" />
                        </div>
                    </div>
                </div>

                <div class="mt-8 flex justify-end">
                    <button class="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20">
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div class="flex items-center gap-3 mb-4 text-white font-medium">
                        <Bell size={20} class="text-cyan-400" />
                        Notifications
                    </div>
                    <div class="space-y-4">
                        <label class="flex items-center justify-between text-sm text-zinc-300">
                            <span>Project updates</span>
                            <input type="checkbox" checked class="accent-cyan-500 w-4 h-4 rounded" />
                        </label>
                        <label class="flex items-center justify-between text-sm text-zinc-300">
                            <span>Marketing emails</span>
                            <input type="checkbox" class="accent-cyan-500 w-4 h-4 rounded" />
                        </label>
                    </div>
                </div>

                <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div class="flex items-center gap-3 mb-4 text-white font-medium">
                        <Shield size={20} class="text-emerald-400" />
                        Security
                    </div>
                    <button class="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition mb-3 text-zinc-300">
                        Change Password
                    </button>
                    <button class="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition text-zinc-300">
                        Enable 2FA
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Profile() {
    const [activeTab, setActiveTab] = createSignal("dashboard");

    return (
        <div class="min-h-screen bg-[#05070b] text-white">
            {/* Ambient Background */}
            <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div class="absolute top-0 left-1/4 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[150px]" />
                <div class="absolute bottom-1/4 right-0 h-[34rem] w-[34rem] rounded-full bg-blue-500/10 blur-[150px]" />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            <div class="flex min-h-screen pt-16">
                {/* Sidebar */}
                <aside class="w-64 border-r border-white/10 bg-black/20 backdrop-blur-3xl hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
                    <div class="p-6 border-b border-white/10">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
                                EZ
                            </div>
                            <div>
                                <p class="font-semibold text-sm">ElecZen User</p>
                                <p class="text-xs text-zinc-400">Pro Plan</p>
                            </div>
                        </div>
                    </div>
                    
                    <nav class="flex-1 p-4 space-y-2">
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            class={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab() === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Home size={18} />
                            Dashboard
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            class={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab() === 'settings' ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <SettingsIcon size={18} />
                            Settings
                        </button>
                        <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition">
                            <CreditCard size={18} />
                            Billing
                        </button>
                    </nav>

                    <div class="p-4 border-t border-white/10">
                        <A href="/" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition">
                            <LogOut size={18} />
                            Log Out
                        </A>
                    </div>
                </aside>

                {/* Main Content */}
                <main class="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <div class="max-w-6xl mx-auto">
                        {/* Mobile Header Tabs */}
                        <div class="flex md:hidden gap-2 mb-8 overflow-x-auto pb-2">
                            <button 
                                onClick={() => setActiveTab('dashboard')}
                                class={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeTab() === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-zinc-400'}`}
                            >
                                Dashboard
                            </button>
                            <button 
                                onClick={() => setActiveTab('settings')}
                                class={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeTab() === 'settings' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-zinc-400'}`}
                            >
                                Settings
                            </button>
                        </div>

                        {/* Page Header */}
                        <div class="mb-10">
                            <h1 class="text-3xl md:text-4xl font-bold tracking-tight">
                                {activeTab() === 'dashboard' ? 'Welcome back, ElecZen' : 'Account Settings'}
                            </h1>
                            <p class="text-zinc-400 mt-2">
                                {activeTab() === 'dashboard' ? "Here's what's happening with your projects today." : "Manage your profile preferences and account security."}
                            </p>
                        </div>

                        {/* Tab Content */}
                        <Show when={activeTab() === 'dashboard'}>
                            <Dashboard />
                        </Show>
                        <Show when={activeTab() === 'settings'}>
                            <Settings />
                        </Show>
                    </div>
                </main>
            </div>
        </div>
    );
}
