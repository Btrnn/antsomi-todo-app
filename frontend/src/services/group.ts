import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Group } from 'models';

export const getGroupList = async (boardId: IdentifyId): Promise<ServiceResponse<Group[]>> => {
  try {
    const response = await axiosInstance.get(`group/${boardId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createGroup = async (
  boardID: IdentifyId,
  group: Partial<Group>,
): Promise<ServiceResponse<Group>> => {
  try {
    const response = await axiosInstance.post(`group/${boardID}`, group);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateGroup = async (
  boardID: IdentifyId,
  id: IdentifyId,
  group: Partial<Group>,
): Promise<ServiceResponse<Group>> => {
  try {
    const response = await axiosInstance.put(`group/${boardID}`, { id: id, groupUpdated: group });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteGroup = async (
  boardID: IdentifyId,
  id: IdentifyId,
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.delete(`group/${boardID}`, { data: { id } });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const reorderGroup = async (
  boardID: IdentifyId,
  groupPositions: { id: IdentifyId; position: number }[],
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.patch(`group/${boardID}`, groupPositions);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
