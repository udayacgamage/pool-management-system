import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Helper to get auth header
export const getAuthHeader = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            return { Authorization: `Bearer ${user.token}` };
        }
    } catch (err) {
        return {};
    }
    return {};
};

export default api;
