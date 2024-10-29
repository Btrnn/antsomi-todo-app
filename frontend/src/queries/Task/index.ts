// Libraries
import {
  useQuery,
  UseQueryOptions,
  useQueryClient,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';

// Constants
import { MUTATION_KEYS, QUERY_KEYS } from 'constants/query';

// Services
import {
  createTask,
  deleteTask,
  deleteTaskByGroupID,
  getAllTasks,
  reorderTask,
  updateTask,
} from 'services';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Task } from 'models';
import { persistTaskMutate } from 'utils/react-query/task';

type UseGetTaskListProps = {
  boardId: IdentifyId;
  options?: UseQueryOptions<ServiceResponse<Task[]>>;
};

type UseCreateTaskProps = {
  boardId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<Task>,
    Error,
    Omit<Task, 'id' | 'created_at' | 'start_date' | 'end_date' | 'owner_id'>,
    { previousTaskList: Task[] }
  >;
};

type UseDeleteTaskProps = {
  boardId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    IdentifyId,
    { previousTaskList: Task[] }
  >;
};

type UseUpdateTaskProps = {
  boardId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    Partial<Task>,
    { previousTaskList: Task[] }
  >;
};

type UseReorderTaskProps = {
  boardId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    { id: IdentifyId; position: number }[],
    { previousTaskList: Task[] }
  >;
};

export const useGetTaskList = ({ boardId, options }: UseGetTaskListProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId],
    queryFn: () => getAllTasks(boardId),
    ...options,
  });
};

export const useCreateTask = ({ boardId, options }: UseCreateTaskProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_TASK],
    mutationFn: newTask => createTask(boardId, newTask),
    onMutate: async newTask => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
      const previousTaskList = queryClient.getQueryData([QUERY_KEYS.GET_TASK_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_TASK_LIST, boardId],
        (oldData: ServiceResponse<Task[]>) => {
          return persistTaskMutate({
            task: newTask,
            oldData,
          });
        },
      );
      return { previousTaskList: previousTaskList as Task[] };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_TASK_LIST, boardId], context?.previousTaskList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
    },
    ...options,
  });
};

export const useDeleteTask = ({ boardId, options }: UseDeleteTaskProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_TASK],
    mutationFn: taskId => deleteTask(boardId, taskId),
    onMutate: async taskId => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
      const previousTaskList = queryClient.getQueryData([QUERY_KEYS.GET_TASK_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_TASK_LIST, boardId],
        (oldData: ServiceResponse<Task[]>) => {
          return persistTaskMutate({
            taskId,
            oldData,
          });
        },
      );
      return { previousTaskList: previousTaskList as Task[] };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_TASK_LIST, boardId], context?.previousTaskList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
    },
    ...options,
  });
};

export const useDeleteTaskByGroupID = ({ boardId, options }: UseDeleteTaskProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_TASK_BY_GROUPID],
    mutationFn: groupId => deleteTaskByGroupID(boardId, groupId),
    onMutate: async groupId => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
      const previousTaskList = queryClient.getQueryData([QUERY_KEYS.GET_TASK_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_TASK_LIST, boardId],
        (oldData: ServiceResponse<Task[]>) => {
          return persistTaskMutate({
            groupId,
            oldData,
          });
        },
      );
      return { previousTaskList: previousTaskList as Task[] };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_TASK_LIST, boardId], context?.previousTaskList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
    },
    ...options,
  });
};

export const useUpdateTask = ({ boardId, options }: UseUpdateTaskProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.UPDATE_TASK],
    mutationFn: task => updateTask(boardId, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
    },
    onMutate: async updatedTask => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
      const previousTaskList = queryClient.getQueryData([QUERY_KEYS.GET_TASK_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_TASK_LIST, boardId],
        (oldData: ServiceResponse<Task[]>) => {
          const newData = persistTaskMutate({
            task: updatedTask,
            oldData: oldData,
            taskId: updatedTask.id,
          });
          return newData;
        },
      );
      return { previousTaskList: previousTaskList as Task[] };
    },
    onError: (err, updatedTask, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_TASK_LIST, boardId], context?.previousTaskList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
    },
    ...options,
  });
};

export const useReorderTask = ({ boardId, options }: UseReorderTaskProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.REORDER_TASK],
    mutationFn: taskPositions => reorderTask(boardId, taskPositions),
    onMutate: async taskPositions => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
      const previousTaskList = queryClient.getQueryData([QUERY_KEYS.GET_TASK_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_TASK_LIST, boardId],
        (oldList: ServiceResponse<Task[]>) => {
          return persistTaskMutate({
            oldData: oldList,
            positions: taskPositions,
          });
        },
      );
      return { previousTaskList: previousTaskList as Task[] };
    },
    onError: (err, taskPositions, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_TASK_LIST, boardId], context?.previousTaskList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_TASK_LIST, boardId] });
    },
    ...options,
  });
};
