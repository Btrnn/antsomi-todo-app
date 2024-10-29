import { useGetUserInfo } from 'queries/User';
import { useEffect } from 'react';

export const useLoggedUser = () => {
  const { data: user, isLoading, error, refetch } = useGetUserInfo();
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    user: user?.data,
    isLoading,
    error,
    refetch,
  };
};
