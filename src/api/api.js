import axios from 'axios';

// export const BASE_URL = "https://quality-api.vercel.app";
  export const BASE_URL = "http://localhost:6004";

const axiosInstance = axios.create({
  timeout: 500000,
  baseURL: BASE_URL,
  // baseURL: import.meta.env.VITE_BASE_URL,
});

export default axiosInstance;

