import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { database, provider, authSchema, ensureAuthSchema } from "./db.js";

const PORT = Number(process.env.PORT || 3000);
const BASE_PATH = "/api/auth";
const BASE_URL = process.env.AUTH_BASE_URL || `http://localhost:${PORT}`;

await ensureAuthSchema();

export const auth = betterAuth({
    database: drizzleAdapter(database, {
        provider,
        schema: authSchema,
        usePlural: false,
        camelCase: true,
        debugLogs: false,
    }),
    basePath: BASE_PATH,
    baseURL: BASE_URL,
    session: {
        maxAge: 60 * 60 * 24 * 7,
        rolling: true,
    },
    user: {
        fields: {
            name: { required: false },
            image: { required: false },
            emailVerified: { required: false },
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        password: {
            minLength: 8,
        },
        sendResetPassword: async ({ email, resetURL }) => {
            console.log("[AUTH] password reset requested:", email, resetURL);
        },
    },
    verification: {
        enabled: false,
    },
});

export const authHandler = async (request) => auth.handler(request);
