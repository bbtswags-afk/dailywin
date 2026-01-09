import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../lib/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await api.auth.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const data = await api.auth.login(email, password);
        localStorage.setItem('token', data.token);
        setUser(data);
        return data; // Return for handling errors in UI overrides if needed
    };

    const signup = async (email, password, name) => {
        const data = await api.auth.signup(email, password, name);
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateLocalUser = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, updateLocalUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
