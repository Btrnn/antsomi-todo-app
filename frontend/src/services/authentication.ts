import { ServiceResponse } from 'types';
import { axiosInstance } from './api';
import axios from 'axios';

export const authenticationServices = {
  checkToken: async () => {
    try {
      const response = await axiosInstance.post('auth/check-token');
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  checkAuthentication: async (
    username: string,
    password: string,
  ): Promise<ServiceResponse<string>> => {
    try {
      const response = await axiosInstance.post('auth/login', { username, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.statusText,
          data: 'Wrong password or username. Please try again',
          meta: {},
        };
      }
      return Promise.reject(error);
    }
  },
};

export const checkAuthority = async () => {
  try {
    const response = await axiosInstance.post('auth/check-token');
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const checkAuthentication = async (
  username: string,
  password: string,
): Promise<ServiceResponse<string>> => {
  try {
    const response = await axiosInstance.post('auth/login', { username, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        statusCode: error.response.status,
        statusMessage: error.response.statusText,
        data: 'Wrong password or username. Please try again',
        meta: {},
      };
    }
    return Promise.reject(error);
  }
};
