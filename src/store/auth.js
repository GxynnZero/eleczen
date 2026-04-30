import { createSignal } from 'solid-js';
import * as authApi from '../api/auth.js';

const [user, setUser] = createSignal(null);
const [authLoading, setAuthLoading] = createSignal(false);
const [authError, setAuthError] = createSignal(null);

function clearError() {
    setAuthError(null);
}

async function loadSession() {
    setAuthLoading(true);
    clearError();

    try {
        const result = await authApi.session();
        if (result?.ok && result?.user) {
            setUser(result.user);
        } else {
            setUser(null);
        }
        return result;
    } catch (error) {
        setUser(null);
        setAuthError(error.message);
        return { ok: false, message: error.message };
    } finally {
        setAuthLoading(false);
    }
}

async function loginRequest({ email, password }) {
    setAuthLoading(true);
    clearError();

    try {
        const result = await authApi.login({ email, password });
        if (result?.ok && result?.user) {
            setUser(result.user);
        }
        return result;
    } catch (error) {
        setAuthError(error.message);
        return { ok: false, message: error.message };
    } finally {
        setAuthLoading(false);
    }
}

async function registerRequest({ name, email, password }) {
    setAuthLoading(true);
    clearError();

    try {
        const result = await authApi.register({ name, email, password });
        if (result?.ok && result?.user) {
            setUser(result.user);
        }
        return result;
    } catch (error) {
        setAuthError(error.message);
        return { ok: false, message: error.message };
    } finally {
        setAuthLoading(false);
    }
}

async function logoutRequest() {
    setAuthLoading(true);
    clearError();

    try {
        const result = await authApi.logout();
        setUser(null);
        return result;
    } catch (error) {
        setAuthError(error.message);
        return { ok: false, message: error.message };
    } finally {
        setAuthLoading(false);
    }
}

export {
    user,
    authLoading,
    authError,
    loadSession,
    loginRequest,
    registerRequest,
    logoutRequest,
};
