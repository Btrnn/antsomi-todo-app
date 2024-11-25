// Constants
import { API_QUERY_KEY } from 'constant';
import { axiosInstance } from './api';

// Types
import { IdentifyId, ServiceResponse } from 'types';

export const getPermission = async (
  objectID: IdentifyId,
  objectType: string,
): Promise<ServiceResponse<string>> => {
  try {
    const response = await axiosInstance.get(
      `share-access/permission/${objectID}?${API_QUERY_KEY.OBJECT_TYPE}=${objectType}`,
    );
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
    const response = await axiosInstance.post(
      `share-access/create/${objectID}?${API_QUERY_KEY.OBJECT_TYPE}=${objectType}`,
      {
        permissionList: userPermission,
      },
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateAccess = async (
  objectID: IdentifyId,
  objectType: string,
  userPermission: { user_id: IdentifyId; permission: string }[],
): Promise<ServiceResponse<boolean>> => {
  try {
    const response = await axiosInstance.put(
      `share-access/update/${objectID}?${API_QUERY_KEY.OBJECT_TYPE}=${objectType}`,
      {
        permissionList: userPermission,
      },
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
    const response = await axiosInstance.put(
      `share-access/changeOwner/${objectID}?${API_QUERY_KEY.OBJECT_TYPE}=${objectType}`,
      {
        new_owner: newOwnerID,
      },
    );
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
    const response = await axiosInstance.delete(
      `share-access/delete/${boardID}?${API_QUERY_KEY.OBJECT_TYPE}=${objectType}`,
      {
        data: { user_id: userID },
      },
    );
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
    const response = await axiosInstance.get(
      `share-access/accessList/${objectID}?${API_QUERY_KEY.OBJECT_TYPE}=${objectType}`,
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
