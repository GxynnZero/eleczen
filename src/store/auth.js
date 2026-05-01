import { createSignal } from "solid-js";
import { supabase } from "../lib/supabase.js";

/* =========================================
   Global Auth State
========================================= */

const [user, setUser] = createSignal(null);
const [authLoading, setAuthLoading] = createSignal(false);
const [authError, setAuthError] = createSignal("");

/* =========================================
   Helpers
========================================= */

function clearError() {
    setAuthError("");
}

function fail(error) {
    const message = error?.message || "Authentication failed.";
    setAuthError(message);
    return { ok: false, message };
}

/* =========================================
   Session Loader
========================================= */

async function loadSession() {
    setAuthLoading(true);
    clearError();

    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setUser(session?.user || null);
        return { ok: true, user: session?.user };
    } catch (error) {
        setUser(null);
        return fail(error);
    } finally {
        setAuthLoading(false);
    }
}

/* =========================================
   Auth Listeners
========================================= */

supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user || null);
});

/* =========================================
   Login
========================================= */

async function loginRequest({ email, password }) {
    setAuthLoading(true);
    clearError();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        setUser(data.user);
        return { ok: true, user: data.user };
    } catch (error) {
        return fail(error);
    } finally {
        setAuthLoading(false);
    }
}

async function loginWithOAuth(provider) {
    setAuthLoading(true);
    clearError();

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin,
            }
        });

        if (error) throw error;
        return { ok: true };
    } catch (error) {
        return fail(error);
    } finally {
        setAuthLoading(false);
    }
}

/* =========================================
   Register
========================================= */

async function registerRequest({ name, email, password }) {
    setAuthLoading(true);
    clearError();

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                }
            }
        });

        if (error) throw error;

        setUser(data.user);
        return { ok: true, user: data.user };
    } catch (error) {
        return fail(error);
    } finally {
        setAuthLoading(false);
    }
}

/* =========================================
   Logout
========================================= */

async function logoutRequest() {
    setAuthLoading(true);
    clearError();

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        setUser(null);
        return { ok: true };
    } catch (error) {
        return fail(error);
    } finally {
        setAuthLoading(false);
    }
}

/* =========================================
   Manual State Helpers
========================================= */

function setAuthUser(data) {
    setUser(data);
}

function clearUser() {
    setUser(null);
}

/* =========================================
   Export
========================================= */

export {
    user,
    authLoading,
    authError,

    loadSession,
    loginRequest,
    loginWithOAuth,
    registerRequest,
    logoutRequest,

    setAuthUser,
    clearUser,
    clearError,
};