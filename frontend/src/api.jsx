import axios from 'axios';

const API = axios.create({
  baseURL: 'https://focustrack-e58k.onrender.com/api', // baad mein live URL daal dena
});

// Har request ke saath token bhejne ke liye
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;