import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Board } from 'models';

export type UpdateBoardArgs = {
  board: Partial<Board> & { id: IdentifyId };
};

export const getAllBoards = async (): Promise<
  ServiceResponse<{ owned: Board[]; shared: Board[] }>
> => {
  try {
    const response = await axiosInstance.get('board/accessed-board');
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

export const getPermission = async (
  objectID: IdentifyId,
  objectType: string,
): Promise<ServiceResponse<string>> => {
  try {
    const response = await axiosInstance.get(`${objectType}/permission/${objectID}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateBoard = async ({
  board,
}: UpdateBoardArgs): Promise<ServiceResponse<boolean>> => {
  try {
    const { id, ...restOfBoard } = board || {};

    const response = await axiosInstance.put(`board/${id}`, restOfBoard);
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

export const shareAccess = async (
  objectID: IdentifyId,
  objectType: string,
  userPermission: { user_id: IdentifyId; permission: string }[],
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.post(`${objectType}/share/${objectID}`, userPermission);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateAccessBoard = async (
  objectID: IdentifyId,
  objectType: string,
  userPermission: { user_id: IdentifyId; permission: string }[],
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.put(
      `${objectType}/updateAccess/${objectID}`,
      userPermission,
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const changeObjectOwner = async (
  objectID: IdentifyId,
  newOwnerID: IdentifyId,
  objectType: string,
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.put(`${objectType}/changeOwner/${objectID}`, {
      new_owner: newOwnerID,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteAccess = async (
  boardID: IdentifyId,
  userID: IdentifyId,
  objectType: string,
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.delete(`${objectType}/deleteAccess/${boardID}`, {
      data: { userID },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getAccessList = async (
  objectID: IdentifyId,
  objectType: string,
): Promise<ServiceResponse<{ id: string; name: string; email: string; permission: string }[]>> => {
  try {
    const response = await axiosInstance.get(`${objectType}/accessList/${objectID}`);
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
