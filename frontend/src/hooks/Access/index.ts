import { useGetAccessList, useGetPermission } from 'queries';
import { IdentifyId } from 'types';

export const useAccessList = (objectId: IdentifyId, objectType: string) => {
  const {
    data: accessList,
    isLoading,
    isError,
    error,
  } = useGetAccessList({ objectId, objectType });

  return {
    accessList: accessList?.data || [],
    isLoading,
    isError,
    error,
  };
};

export const usePermission = (objectId: IdentifyId, objectType: string) => {
  const {
    data: permission,
    isLoading,
    isError,
    error,
  } = useGetPermission({ objectId, objectType });

  return {
    permission: permission?.data || '',
    isLoading,
    error,
    isError,
  };
};
