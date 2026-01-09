const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

// Helper for authenticated requests
const fetchWithAuth = async (endpoint, options = {}) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getHeaders(),
            ...options.headers,
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return { data };
};

export const api = {
    auth: {
        signup: async (email, password, name) => {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email, password, name }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Signup failed');
            return res.json();
        },
        login: async (email, password) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
            return res.json();
        },
        me: async () => {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: getHeaders(),
            });
            if (!res.ok) return null;
            return res.json();
        },
        upgrade: async () => {
            const res = await fetch(`${API_URL}/auth/upgrade`, {
                method: 'POST',
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error('Upgrade failed');
            return res.json();
        },
        forgotPassword: async (email) => {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
            return res.json();
        },
        resetPassword: async (token, password) => {
            const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ password }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Reset failed');
            return res.json();
        },
        updateProfile: async (data) => {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Update profile failed');
            return res.json();
        }
    },
    paystack: {
        initialize: (data) => fetchWithAuth('/paystack/initialize', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        verify: (data) => fetchWithAuth('/paystack/verify', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
    admin: {
        upgradeUser: (email) => fetchWithAuth('/admin/upgrade', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
        getUsers: () => fetchWithAuth('/admin/users'),
        downgradeUser: (email) => fetchWithAuth('/admin/downgrade', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
        deleteUser: (email) => fetchWithAuth('/admin/delete', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
    },
    predictions: {
        getAll: async (view) => {
            const url = view ? `${API_URL}/predictions?view=${view}` : `${API_URL}/predictions`;
            const res = await fetch(url, {
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error('Failed to fetch predictions');
            return res.json();
        }
    }
};
