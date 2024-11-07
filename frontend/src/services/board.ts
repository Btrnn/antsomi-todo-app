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
    const response = await axiosInstance.get('board/list');
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createBoard = async (
  board: Omit<Board, 'id' | 'created_at' | 'owner_id'>,
): Promise<ServiceResponse<Board>> => {
  try {
    const response = await axiosInstance.post('board/create', board);
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

// export const reorderBoard = async (
//   boardPositions: { id: IdentifyId; position: number }[],
// ): Promise<ServiceResponse<boolean>> => {
//   try {
//     const response = await axiosInstance.patch('board', boardPositions);
//     return response.data;
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };
