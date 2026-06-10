import axios from 'axios';

// Gunakan environment variable jika ada, jika tidak gunakan relative path '/api' (untuk Vercel) atau fallback localhost
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: baseURL,
});

// Interceptor untuk menambahkan token JWT ke setiap request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
