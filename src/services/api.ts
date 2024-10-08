// Libraries
import axios from 'axios';
import { Cookies } from 'react-cookie';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
});

axiosInstance.interceptors.request.use(config => {
  const cookies = new Cookies();
  const value = cookies.get('authToken');
  config.headers.Authorization = `Bearer ${value}`;

  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      return Promise.reject(error.response?.data?.statusMessage);
    }
  },
);
