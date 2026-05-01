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

    /* =========================================
       State
    ========================================= */

    const [step, setStep] = createSignal(1);
    const [loading, setLoading] =
        createSignal(false);
    const [error, setError] =
        createSignal("");

    const [form, setForm] = createSignal({
        fullname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        agree: false,
    });

    /* =========================================
       Helpers
    ========================================= */

    const update = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const next = () => {
        setError("");

        if (step() === 1) {
            if (
                !form().fullname.trim() &&
                !form().username.trim()
            ) {
                setError(
                    "Enter full name or username."
                );
                return;
            }
        }

        if (step() === 2) {
            if (!form().email.trim()) {
                setError("Email required.");
                return;
            }

            if (
                form().password.length < 8
            ) {
                setError(
                    "Password must be at least 8 characters."
                );
                return;
            }
        }

        if (step() < 3) {
            setStep(step() + 1);
        }
    };

    const back = () => {
        setError("");

        if (step() > 1) {
            setStep(step() - 1);
        }
    };

    /* =========================================
       Submit
    ========================================= */

    const submit = async (e) => {
        e.preventDefault();

        setError("");

        if (
            form().password !==
            form().confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        if (!form().agree) {
            setError(
                "You must accept Terms & Privacy Policy."
            );
            return;
        }

        try {
            setLoading(true);

            const result =
                await registerRequest({
                    name:
                        form().fullname ||
                        form().username,
                    email: form().email,
                    password:
                        form().password,
                });

            if (result?.ok) {
                navigate("/editor");
                return;
            }

            setError(
                result?.message ||
                "Signup failed."
            );
        } catch (err) {
            setError(
                err?.message ||
                "Signup failed."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       UI
    ========================================= */

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
                    {/* Header */}
                    <div class="mb-8 text-center">
                        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 font-black text-black text-xl">
                            EZ
                        </div>

                        <h1 class="mt-5 text-4xl font-black">
                            Create Account
                        </h1>

                        <p class="mt-2 text-zinc-400">
                            Join ElecZen in 3 steps.
                        </p>
                    </div>

                    {/* Card */}
                    <form
                        onSubmit={submit}
                        class="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8"
                    >
                        {/* Progress */}
                        <div class="mb-10">
                            <div class="mb-4 flex items-center justify-between text-sm text-zinc-400">
                                <span>
                                    Step {step()} of 3
                                </span>

                                <span>
                                    {Math.floor(
                                        (step() / 3) * 100
                                    )}
                                    %
                                </span>
                            </div>

                            <div class="h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                                    style={{
                                        width: `${(step() / 3) * 100
                                            }%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* STEP CONTENT */}
                        <Show when={step() === 1}>
                            <StepOne
                                form={form}
                                update={update}
                            />
                        </Show>

                        <Show when={step() === 2}>
                            <StepTwo
                                form={form}
                                update={update}
                            />
                        </Show>

                        <Show when={step() === 3}>
                            <StepThree
                                form={form}
                                update={update}
                            />
                        </Show>

                        {/* Buttons */}
                        <div class="mt-10 flex gap-4">
                            <Show when={step() > 1}>
                                <button
                                    type="button"
                                    onClick={back}
                                    class="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-semibold hover:bg-white/10"
                                >
                                    <span class="inline-flex items-center gap-2">
                                        <ChevronLeft
                                            size={18}
                                        />
                                        Back
                                    </span>
                                </button>
                            </Show>

                            <Show
                                when={step() < 3}
                                fallback={
                                    <button
                                        type="submit"
                                        disabled={
                                            loading()
                                        }
                                        class="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 py-4 font-semibold disabled:opacity-70"
                                    >
                                        {loading()
                                            ? "Creating..."
                                            : "Create Account"}
                                    </button>
                                }
                            >
                                <button
                                    type="button"
                                    onClick={next}
                                    class="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 py-4 font-semibold"
                                >
                                    Continue
                                </button>
                            </Show>
                        </div>

                        {/* Error */}
                        <Show when={error()}>
                            <div class="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                {error()}
                            </div>
                        </Show>

                        {/* Footer */}
                        <p class="mt-8 text-center text-sm text-zinc-400">
                            Already have an
                            account?{" "}
                            <A
                                href="/login"
                                class="text-cyan-300 hover:text-white"
                            >
                                Login
                            </A>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

/* =========================================
   Steps
========================================= */

function StepOne(props) {
    return (
        <div class="space-y-5">
            <h2 class="text-2xl font-bold">
                Personal Info
            </h2>

            <InputBox
                icon={User}
                label="Full Name"
                value={
                    props.form().fullname
                }
                placeholder="Your full name"
                onInput={(v) =>
                    props.update(
                        "fullname",
                        v
                    )
                }
            />

            <InputBox
                icon={User}
                label="Username"
                value={
                    props.form().username
                }
                placeholder="Choose username"
                onInput={(v) =>
                    props.update(
                        "username",
                        v
                    )
                }
            />
        </div>
    );
}

function StepTwo(props) {
    return (
        <div class="space-y-5">
            <h2 class="text-2xl font-bold">
                Account Details
            </h2>

            <InputBox
                icon={Mail}
                label="Email"
                type="email"
                value={
                    props.form().email
                }
                placeholder="you@example.com"
                onInput={(v) =>
                    props.update(
                        "email",
                        v
                    )
                }
            />

            <InputBox
                icon={Lock}
                label="Password"
                type="password"
                value={
                    props.form().password
                }
                placeholder="••••••••"
                onInput={(v) =>
                    props.update(
                        "password",
                        v
                    )
                }
            />
        </div>
    );
}

function StepThree(props) {
    return (
        <div class="space-y-5">
            <h2 class="text-2xl font-bold">
                Security & Finish
            </h2>

            <InputBox
                icon={Shield}
                label="Confirm Password"
                type="password"
                value={
                    props.form()
                        .confirmPassword
                }
                placeholder="Repeat password"
                onInput={(v) =>
                    props.update(
                        "confirmPassword",
                        v
                    )
                }
            />

            <label class="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <input
                    type="checkbox"
                    checked={
                        props.form().agree
                    }
                    onInput={(e) =>
                        props.update(
                            "agree",
                            e.target.checked
                        )
                    }
                />

                <span class="text-sm text-zinc-300">
                    I agree to Terms &
                    Privacy Policy
                </span>
            </label>

            <div class="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
                <Check
                    size={16}
                    class="mr-2 inline"
                />
                Workspace ready instantly.
            </div>
        </div>
    );
}

/* =========================================
   Input
========================================= */

function InputBox(props) {
    const Icon = props.icon;

    return (
        <div>
            <label class="text-sm text-zinc-400">
                {props.label}
            </label>

            <div class="mt-2 flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
                <Icon
                    size={18}
                    class="text-zinc-500"
                />

                <input
                    type={
                        props.type ||
                        "text"
                    }
                    placeholder={
                        props.placeholder
                    }
                    value={props.value}
                    onInput={(e) =>
                        props.onInput(
                            e.target.value
                        )
                    }
                    class="w-full bg-transparent px-3 py-4 outline-none"
                />
            </div>
        </div>
    );
}