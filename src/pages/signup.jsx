// src/pages/Signup.jsx
import { createSignal, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { registerRequest } from "../store/auth.js";
import {
    Mail,
    Lock,
    User,
    ChevronRight,
    ChevronLeft,
    Check,
    Shield,
} from "lucide-solid";

export default function Signup() {
    const navigate = useNavigate();

    const [step, setStep] = createSignal(1);
    const [error, setError] = createSignal(null);
    const [loading, setLoading] = createSignal(false);

    const [form, setForm] = createSignal({
        fullname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        agree: false,
    });

    const update = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const next = () => {
        if (step() < 3) setStep(step() + 1);
    };

    const back = () => {
        if (step() > 1) setStep(step() - 1);
    };

    const submit = async (e) => {
        e.preventDefault();
        setError(null);

        if (form().password !== form().confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!form().agree) {
            setError("You must agree to the terms and privacy policy.");
            return;
        }

        setLoading(true);
        const result = await registerRequest({
            name: form().fullname || form().username || form().email,
            email: form().email,
            password: form().password,
        });
        setLoading(false);

        if (result.ok) {
            navigate("/editor");
            return;
        }

        setError(result.message || "Unable to register. Please try again.");
    };

    return (
        <div class="min-h-screen bg-[#05070b] text-white overflow-y-auto">
            {/* Background */}
            <div class="fixed inset-0 -z-10">
                <div class="absolute top-0 left-0 h-80 w-80 bg-cyan-500/10 blur-[140px]" />
                <div class="absolute bottom-0 right-0 h-80 w-80 bg-blue-500/10 blur-[140px]" />
                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            <div class="px-6 py-12">
                <div class="mx-auto max-w-xl">
                    {/* Logo */}
                    <div class="mb-8 text-center">
                        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 font-black text-black text-xl">
                            EZ
                        </div>

                        <h1 class="mt-5 text-4xl font-black">Create Account</h1>
                        <p class="mt-2 text-zinc-400">
                            Join ElecZen in just 3 simple steps.
                        </p>
                    </div>

                    {/* Card */}
                    <form
                        onSubmit={submit}
                        class="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8"
                    >
                        {/* Progress */}
                        <div class="mb-10">
                            <div class="flex items-center justify-between text-sm text-zinc-400 mb-4">
                                <span>Step {step()} of 3</span>
                                <span>{Math.floor((step() / 3) * 100)}%</span>
                            </div>

                            <div class="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                                    style={{ width: `${(step() / 3) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* STEP 1 */}
                        <Show when={step() === 1}>
                            <div class="space-y-5">
                                <h2 class="text-2xl font-bold">Personal Info</h2>

                                <div>
                                    <label class="text-sm text-zinc-400">Full Name</label>
                                    <div class="mt-2 flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
                                        <User size={18} class="text-zinc-500" />
                                        <input
                                            type="text"
                                            placeholder="Your full name"
                                            class="w-full bg-transparent px-3 py-4 outline-none"
                                            value={form().fullname}
                                            onInput={(e) => update("fullname", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label class="text-sm text-zinc-400">Username</label>
                                    <div class="mt-2 flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
                                        <User size={18} class="text-zinc-500" />
                                        <input
                                            type="text"
                                            placeholder="Choose username"
                                            class="w-full bg-transparent px-3 py-4 outline-none"
                                            value={form().username}
                                            onInput={(e) => update("username", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Show>

                        {/* STEP 2 */}
                        <Show when={step() === 2}>
                            <div class="space-y-5">
                                <h2 class="text-2xl font-bold">Account Details</h2>

                                <div>
                                    <label class="text-sm text-zinc-400">Email</label>
                                    <div class="mt-2 flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
                                        <Mail size={18} class="text-zinc-500" />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            class="w-full bg-transparent px-3 py-4 outline-none"
                                            value={form().email}
                                            onInput={(e) => update("email", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label class="text-sm text-zinc-400">Password</label>
                                    <div class="mt-2 flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
                                        <Lock size={18} class="text-zinc-500" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            class="w-full bg-transparent px-3 py-4 outline-none"
                                            value={form().password}
                                            onInput={(e) => update("password", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Show>

                        {/* STEP 3 */}
                        <Show when={step() === 3}>
                            <div class="space-y-5">
                                <h2 class="text-2xl font-bold">Security & Finish</h2>

                                <div>
                                    <label class="text-sm text-zinc-400">Confirm Password</label>
                                    <div class="mt-2 flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
                                        <Shield size={18} class="text-zinc-500" />
                                        <input
                                            type="password"
                                            placeholder="Repeat password"
                                            class="w-full bg-transparent px-3 py-4 outline-none"
                                            value={form().confirmPassword}
                                            onInput={(e) =>
                                                update("confirmPassword", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <label class="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form().agree}
                                        onInput={(e) => update("agree", e.target.checked)}
                                    />
                                    <span class="text-sm text-zinc-300">
                                        I agree to Terms & Privacy Policy
                                    </span>
                                </label>

                                <div class="rounded-2xl bg-cyan-500/10 border border-cyan-400/20 p-4 text-sm text-cyan-200">
                                    <Check size={16} class="inline mr-2" />
                                    Your workspace will be ready instantly after signup.
                                </div>
                            </div>
                        </Show>

                        {/* Buttons */}
                        <div class="mt-10 flex gap-4">
                            <Show when={step() > 1}>
                                <button
                                    type="button"
                                    onClick={back}
                                    class="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-semibold hover:bg-white/10 transition"
                                >
                                    <span class="inline-flex items-center gap-2">
                                        <ChevronLeft size={18} />
                                        Back
                                    </span>
                                </button>
                            </Show>

                            <Show
                                when={step() < 3}
                                fallback={
                                    <button
                                        type="submit"
                                        disabled={loading()}
                                        class="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 py-4 font-semibold hover:scale-[1.02] transition disabled:opacity-70"
                                    >
                                        {loading() ? 'Creating...' : 'Create Account'}
                                    </button>
                                }
                            >
                                <button
                                    type="button"
                                    onClick={next}
                                    class="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 py-4 font-semibold hover:scale-[1.02] transition"
                                >
                                    <span class="inline-flex items-center gap-2">
                                        Continue
                                        <ChevronRight size={18} />
                                    </span>
                                </button>
                            </Show>
                        </div>

                        {error() && (
                            <div class="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                {error()}
                            </div>
                        )}

                        {/* Footer */}
                        <p class="mt-8 text-center text-sm text-zinc-400">
                            Already have an account?{" "}
                            <A href="/login" class="text-cyan-300 hover:text-white">
                                Login
                            </A>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}