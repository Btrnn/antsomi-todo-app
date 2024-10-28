// Libraries
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Constants
import { QUERY_KEYS } from 'constants/query';

// Services
import { getAllTasks } from 'services';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Task } from 'models';

type UseGetTaskListProps = {
  boardId: IdentifyId;
  options?: UseQueryOptions<ServiceResponse<Task[]>>;
};

export const useGetTaskList = (props?: UseGetTaskListProps) => {
  const { boardId: boardID, options } = props || {};

  return useQuery({
    queryKey: [QUERY_KEYS.GET_TASK_LIST],
    queryFn: () => getAllTasks(boardID || ''),
    ...options,
  });
};
