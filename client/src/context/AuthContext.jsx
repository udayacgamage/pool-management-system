import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        setError(null);
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
            }
            return response.data;
        } catch (err) {
            const message =
                (err.response && err.response.data && err.response.data.message) ||
                err.message ||
                'An error occurred';
            setError(message);
            throw message;
        }
    };

    const login = async (userData) => {
        setError(null);
        try {
            const response = await api.post('/auth/login', userData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
            }
            return response.data;
        } catch (err) {
            const message =
                (err.response && err.response.data && err.response.data.message) ||
                err.message ||
                'An error occurred';
            setError(message);
            throw message;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
