
// Helper to determine the correct base URL
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // Client-side
        return process.env.NEXT_PUBLIC_API_BASE_URL || '';
    }
    // Server-side
    return process.env.API_BASE_URL || 'http://localhost:3001';
};

export const fetchClient = async (endpoint, options = {}) => {
    const baseUrl = getBaseUrl();
    // Ensure we don't double-slash or miss a slash, but simplest is to assume endpoint starts with /
    // or handle absolute URLs.
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `API Error: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
};
