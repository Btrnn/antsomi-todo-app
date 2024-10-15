import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Board } from 'models';

export const getAllBoards = async (type: string): Promise<ServiceResponse<Board[]>> => {
  try {
    const response = await axiosInstance.get(`board/${type}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createBoard = async (board: Partial<Board>): Promise<ServiceResponse<Board>> => {
  try {
    const response = await axiosInstance.post('board/create', board);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getPermission = async (boardID: IdentifyId): Promise<ServiceResponse<string>> => {
  try {
    const response = await axiosInstance.get(`board/permission/${boardID}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateBoard = async (
  boardID: IdentifyId,
  board: Partial<Board>,
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.put(`board/${boardID}`, board);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteBoard = async (boardID: IdentifyId): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.delete(`board/${boardID}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const shareBoard = async (
  boardID: IdentifyId,
  userPermission: { user_id: IdentifyId; permission: string }[],
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.post(`board/share/${boardID}`, userPermission);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateAccessBoard = async (
  boardID: IdentifyId,
  userPermission: { user_id: IdentifyId; permission: string }[],
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.put(`board/updateAccess/${boardID}`, userPermission);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getAccessList = async (
  boardID: IdentifyId,
): Promise<ServiceResponse<{ id: string; name: string; email: string; permission: string }[]>> => {
  try {
    const response = await axiosInstance.get(`board/accessList/${boardID}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const reorderBoard = async (
  boardPositions: { id: IdentifyId; position: number }[],
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.patch('board', boardPositions);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
