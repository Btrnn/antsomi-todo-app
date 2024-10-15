import { useGetUserInfo } from 'queries/User';

export const useLoggedUser = () => {
  const { data: user, isLoading, error } = useGetUserInfo();

  return {
    user: user?.data,
    isLoading,
    error,
  };
};
