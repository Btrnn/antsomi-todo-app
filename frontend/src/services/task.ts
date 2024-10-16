import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Task } from 'models';

export const getAllTasks = async (boardID: IdentifyId): Promise<ServiceResponse<Task[]>> => {
  try {
    const response = await axiosInstance.get(`task/${boardID}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createTask = async (
  boardID: IdentifyId,
  task: Omit<Task, 'id' | 'created_at' | 'start_date' | 'end_date' | 'owner_id'>,
) => {
  try {
    const response = await axiosInstance.post(`task/${boardID}`, task);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateTask = async (boardId: IdentifyId, task: Partial<Task>) => {
  try {
    const response = await axiosInstance.put(`task/${boardId}`, task);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteTask = async (boardID: IdentifyId, id: IdentifyId) => {
  try {
    const response = await axiosInstance.delete(`task/${boardID}`, { data: { id } });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteTaskByGroupID = async (boardID: IdentifyId, id: IdentifyId) => {
  try {
    const response = await axiosInstance.delete(`task/clear/${boardID}`, { data: { id } });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const reorderTask = async (
  boardID: IdentifyId,
  taskPositions: { id: IdentifyId; position: number }[],
) => {
  try {
    const response = await axiosInstance.patch(`task/reorder/${boardID}`, taskPositions);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
