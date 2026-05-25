import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
