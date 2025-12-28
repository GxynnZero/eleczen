import { fetchClient } from "@/lib/api";

export const AuthService = {
    /**
     * Get current session data
     */
    getSession: () => fetchClient("/api/auth/session"),

    /**
     * Send OTP for email verification or password reset
     * @param {Object} data - { email }
     */
    sendOtp: (data) => fetchClient("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    /**
     * Verify OTP and complete action (register/reset)
     * @param {Object} data - { email, otp, newPassword? }
     */
    verify: (data) => fetchClient("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify(data),
    }),
};
