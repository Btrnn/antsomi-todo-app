import { useGetTaskList } from 'queries';
import { IdentifyId } from 'types';

export const useTaskList = (boardId: IdentifyId) => {
  const { data: taskList, isLoading, error } = useGetTaskList({ boardId });

  return {
    taskList: taskList?.data || [],
    isLoading,
    error,
  };
};
