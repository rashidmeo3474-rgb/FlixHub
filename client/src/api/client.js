import axios from 'axios';

const fallbackBaseUrl = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
  ? 'https://flixhub-0len.onrender.com/api'
  : '/api';

const rawBaseUrl = import.meta.env.VITE_API_URL || fallbackBaseUrl;
const baseURL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pv_token');
  if (config.url && !/^(https?:)?\/\//.test(config.url)) {
    config.url = config.url.replace(/^\/+/, '');
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(Object.assign(error, { message }));
  }
);

export default api;
