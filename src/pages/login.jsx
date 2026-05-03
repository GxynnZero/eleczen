// src/pages/Login.jsx

import { createSignal } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { loginRequest, loginWithOAuth } from "../utils/auth.js";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
    ChevronRight,
} from "lucide-solid";

export default function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = createSignal(false);
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await loginRequest({ email: email(), password: password() });
        setLoading(false);

        if (result.ok) {
            navigate("/editor");
            return;
        }

        setError(result.message || "Unable to sign in. Please try again.");
    };

    return (
        <div class="min-h-screen overflow-y-auto overflow-x-hidden bg-[#05070b] text-white flex items-center justify-center px-6 py-10">
            {/* Background */}
            <div class="fixed inset-0 -z-10">
                <div class="absolute -top-24 left-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[150px]" />
                <div class="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-[150px]" />
                <div class="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-400/10 blur-[150px]" />

                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            {/* Card */}
            <div class="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">
                {/* Header */}
                <div class="text-center">
                    <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-black shadow-[0_0_30px_rgba(34,211,238,.35)]">
                        <Sparkles size={24} />
                    </div>

                    <h1 class="text-3xl font-black">Welcome Back</h1>
                    <p class="mt-2 text-zinc-400">
                        Login to continue your ElecZen journey.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} class="mt-8 space-y-5">
                    {/* Email */}
                    <div>
                        <label class="mb-2 block text-sm text-zinc-300">Email</label>

                        <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <Mail size={18} class="text-zinc-500" />

                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={email()}
                                onInput={(e) => setEmail(e.currentTarget.value)}
                                class="w-full bg-transparent outline-none placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label class="mb-2 block text-sm text-zinc-300">Password</label>

                        <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <Lock size={18} class="text-zinc-500" />

                            <input
                                type={showPassword() ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={password()}
                                onInput={(e) => setPassword(e.currentTarget.value)}
                                class="w-full bg-transparent outline-none placeholder:text-zinc-600"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword())}
                                class="text-zinc-500 hover:text-white"
                            >
                                {showPassword() ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Row */}
                    <div class="flex items-center justify-between text-sm">
                        <label class="flex items-center gap-2 text-zinc-400">
                            <input type="checkbox" class="accent-cyan-400" />
                            Remember me
                        </label>

                        <A href="/forgot-password" class="text-cyan-300 hover:text-white">
                            Forgot Password?
                        </A>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading()}
                        class="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-70"
                    >
                        {loading() ? "Signing In..." : "Login"}
                        {!loading() && <ChevronRight size={18} />}
                    </button>

                    {error() && (
                        <div class="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                            {error()}
                        </div>
                    )}
                </form>

                {/* Divider */}
                <div class="my-6 flex items-center gap-4">
                    <div class="h-px flex-1 bg-white/10" />
                    <span class="text-xs uppercase tracking-[0.3em] text-zinc-500">
                        Or
                    </span>
                    <div class="h-px flex-1 bg-white/10" />
                </div>

                {/* Social */}
                <div class="grid gap-3">
                    <button
                        type="button"
                        onClick={() => loginWithOAuth('google')}
                        class="rounded-2xl border border-white/10 bg-white/5 py-3 hover:bg-white/10 transition"
                    >
                        Continue with Google
                    </button>

                    <button
                        type="button"
                        onClick={() => loginWithOAuth('github')}
                        class="rounded-2xl border border-white/10 bg-white/5 py-3 hover:bg-white/10 transition"
                    >
                        Continue with GitHub
                    </button>
                </div>

                {/* Footer */}
                <p class="mt-8 text-center text-sm text-zinc-400">
                    Don’t have an account?{" "}
                    <A href="/signup" class="text-cyan-300 hover:text-white">
                        Create one
                    </A>
                </p>
            </div>
        </div>
    );
}