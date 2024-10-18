import { useGetUserList } from 'queries/User';

export const useUserList = () => {
  const { data: userList, isLoading, error } = useGetUserList();

  return {
    list: userList?.data || [],
    isLoading,
    error,
  };
};
