import { IdentifyId } from 'types';
import { axiosInstance } from './api';

export const uploadFile = async (id: IdentifyId, type: string, boardID: IdentifyId, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', id as string);
    formData.append('type', type);
    const response = await axiosInstance.post(`file/upload/${boardID}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteFile = async (
  id: IdentifyId,
  type: string,
  boardID: IdentifyId,
  path: string,
) => {
  try {
    const response = await axiosInstance.delete(`file/${boardID}`, {
      data: { id, path },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
