import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Comment } from 'models';

// Constants
import { API_QUERY_KEY } from 'constant';

export const getAllComments = async (
  boardID: IdentifyId,
  objectID: IdentifyId,
): Promise<ServiceResponse<Comment[]>> => {
  try {
    const response = await axiosInstance.get(
      `comment/${boardID}?${API_QUERY_KEY.OBJECT_ID}=${objectID}`,
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
