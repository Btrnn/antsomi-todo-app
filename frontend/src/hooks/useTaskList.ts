import { useGetTaskList } from 'queries';
import { useEffect } from 'react';
import { IdentifyId } from 'types';

export const useTaskList = (boardId: IdentifyId) => {
  const { data: taskList, isLoading, error, refetch } = useGetTaskList({ boardId });

  useEffect(() => {
    refetch();
  }, [boardId, refetch]);

  return {
    taskList: taskList?.data || [],
    isLoading,
    error,
  };
};
