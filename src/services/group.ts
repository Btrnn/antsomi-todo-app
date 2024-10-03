import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Group } from 'models';

export const getAllGroups = async (): Promise<ServiceResponse<Group[]>> => {
  try {
    const response = await axiosInstance.get('group');
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createGroup = async (group: Partial<Group>): Promise<ServiceResponse<Group>> => {
  try {
    const response = await axiosInstance.post('group', group);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateGroup = async (
  id: IdentifyId,
  group: Partial<Group>,
): Promise<ServiceResponse<Group>> => {
  try {
    const response = await axiosInstance.put(`group/${id}`, group);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteGroup = async (id: IdentifyId): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.delete(`group/${id}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const reorderGroup = async (
  groupPositions: { id: IdentifyId; position: number }[],
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.patch('group', groupPositions);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
