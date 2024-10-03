import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Task } from 'models';

export const getAllTasks = async (): Promise<ServiceResponse<Task[]>> => {
  try {
    const response = await axiosInstance.get('task');
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createTask = async (
  task: Omit<Task, 'id' | 'created_at' | 'start_date' | 'end_date' | 'owner_id'>,
) => {
  try {
    const response = await axiosInstance.post('task', task);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateTask = async (id: IdentifyId, task: Partial<Task>) => {
  try {
    const response = await axiosInstance.put(`task/${id}`, task);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteTask = async (id: IdentifyId) => {
  try {
    const response = await axiosInstance.delete(`task/${id}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const reorderTask = async (taskPositions: { id: IdentifyId; position: number }[]) => {
  try {
    const response = await axiosInstance.patch('task', taskPositions);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
