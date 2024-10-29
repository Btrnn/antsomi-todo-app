import { useGetGroupList } from 'queries';
import { IdentifyId } from 'types';

export const useGroupList = (boardId: IdentifyId) => {
  const { data: groupList, isLoading, error } = useGetGroupList({ boardId });

  return {
    groupList: groupList?.data || [],
    isLoading,
    error,
  };
};
