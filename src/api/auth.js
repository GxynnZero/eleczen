const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const defaultHeaders = {
    'content-type': 'application/json',
};

async function fetchAuth(path, init = {}) {
    const response = await fetch(`${apiBase}${path}`, {
        credentials: 'include',
        ...init,
        headers: {
            ...defaultHeaders,
            ...(init.headers || {}),
        },
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(result?.message || response.statusText || 'Authentication request failed');
    }

    return result;
}

export function login({ email, password }) {
    return fetchAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export function register({ name, email, password }) {
    return fetchAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export function logout() {
    return fetchAuth('/api/auth/logout', {
        method: 'POST',
    });
}

export function session() {
    return fetchAuth('/api/auth/session', {
        method: 'GET',
    });
}
