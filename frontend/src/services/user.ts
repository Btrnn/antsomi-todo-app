import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { User } from 'models';

export const getAllUsers = async (): Promise<ServiceResponse<User[]>> => {
  try {
    const response = await axiosInstance.get('user');
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getUserInfo = async (): Promise<ServiceResponse<Omit<User, 'id' | 'password'>>> => {
  try {
    const response = await axiosInstance.get('user/info');
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getInfo = async (email: string): Promise<ServiceResponse<Partial<User>>> => {
  try {
    const response = await axiosInstance.get(`user/${email}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createUser = async (
  user: Omit<User, 'id' | 'created_at'>,
): Promise<ServiceResponse<User> | unknown> => {
  try {
    const response = await axiosInstance.post('user/create', user);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateUser = async (id: IdentifyId, user: Partial<User>) => {
  try {
    const response = await axiosInstance.put(`user/${id}`, user);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteUser = async (id: IdentifyId) => {
  try {
    const response = await axiosInstance.delete(`user/${id}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
