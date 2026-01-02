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

// Admin Endpoint Helpers
export const getHolidays = () => api.get('/holidays', { headers: getAuthHeader() });
export const createHoliday = (data) => api.post('/holidays', data, { headers: getAuthHeader() });
export const deleteHoliday = (id) => api.delete(`/holidays/${id}`, { headers: getAuthHeader() });

export const getNotices = () => api.get('/notices'); // Public
export const createNotice = (data) => api.post('/notices', data, { headers: getAuthHeader() });
export const deleteNotice = (id) => api.delete(`/notices/${id}`, { headers: getAuthHeader() });

export const getAllocations = () => api.get('/coach-allocations'); // Public/Private
export const createAllocation = (data) => api.post('/coach-allocations', data, { headers: getAuthHeader() });
export const deleteAllocation = (id) => api.delete(`/coach-allocations/${id}`, { headers: getAuthHeader() });

export const getCoaches = () => api.get('/auth/coaches'); // Public

// Upload Helper
export const uploadProfilePic = (formData) => api.post('/auth/upload', formData, {
    headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
    }
});
