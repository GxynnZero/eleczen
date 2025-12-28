"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { AuthService } from "@/services/auth";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email");
    const mode = searchParams.get("mode"); // 'reset' or 'verify'

    const [email, setEmail] = useState(emailParam || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = async () => {
        setResendLoading(true);
        setError("");
        setMessage("");

        try {
            await AuthService.sendOtp({ email });
            setMessage("Code resent successfully!");
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            setError(err.message || "Failed to resend code");
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const body = { email, otp };
            if (mode === 'reset') {
                body.newPassword = newPassword;
            }

            await AuthService.verify(body);
            setMessage("Success! Redirecting to login...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-white/10 relative z-10 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                    {mode === 'reset' ? 'Reset Password' : 'Verify Email'}
                </h1>
                <p className="text-gray-400">Enter the code sent to {email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {message}
                    </div>
                )}
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                        Verification Code (OTP)
                    </label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neon-blue focus:border-neon-blue transition-all text-center tracking-[0.5em] font-mono text-lg"
                        placeholder="000000"
                        maxLength={6}
                        required
                    />
                </div>

                {mode === 'reset' && (
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                            New Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neon-blue focus:border-neon-blue transition-all hover:bg-white/10"
                                placeholder="New secure password"
                                required
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.3)] text-sm font-bold text-black bg-gradient-to-r from-neon-blue to-cyan-400 hover:from-white hover:to-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'reset' ? "Reset Password" : "Verify Account")}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={handleResend}
                    disabled={!canResend || resendLoading}
                    className="text-sm text-neon-blue hover:text-white transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                >
                    {resendLoading ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Resending...</span>
                    ) : canResend ? (
                        "Resend Code"
                    ) : (
                        `Resend code in ${timer}s`
                    )}
                </button>
            </div>

            <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px] animate-pulse delay-1000" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
