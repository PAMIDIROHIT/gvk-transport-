import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token
        const token = localStorage.getItem('gvk_token');
        const role = localStorage.getItem('gvk_role');

        if (token && role) {
            setUser({ token, role });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('gvk_token', data.token);
                localStorage.setItem('gvk_role', data.role);
                setUser({ token: data.token, role: data.role });
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    };

    const logout = () => {
        localStorage.removeItem('gvk_token');
        localStorage.removeItem('gvk_role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
