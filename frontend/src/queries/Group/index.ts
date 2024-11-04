// Libraries
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

// Constants
import { MUTATION_KEYS, QUERY_KEYS } from 'constants/query';

// Services
import { createGroup, deleteGroup, getGroupList, reorderGroup, updateGroup } from 'services';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Group } from 'models';

// Utils
import { persistGroupMutate } from 'utils';

type UseGetGroupListProps = {
  boardId: IdentifyId;
  options?: UseQueryOptions<ServiceResponse<Group[]>>;
};

type UseCreateGroupProps = {
  boardId: IdentifyId;

  options?: UseMutationOptions<
    ServiceResponse<Group>,
    Error,
    Partial<Group>,
    { previousGroupList: Group[] }
  >;
};

type UseDeleteGroupProps = {
  boardId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    IdentifyId,
    { previousGroupList: Group[] }
  >;
};

type UseUpdateGroupProps = {
  boardId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<Group>,
    Error,
    Partial<Group>,
    { previousGroupList: Group[] }
  >;
};

type UseReorderGroupProps = {
  boardId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    { id: IdentifyId; position: number }[],
    { previousGroupList: Group[] }
  >;
};

export const useGetGroupList = ({ boardId, options }: UseGetGroupListProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId],
    queryFn: () => getGroupList(boardId),
    ...options,
  });
};

export const useCreateGroup = ({ boardId, options }: UseCreateGroupProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_GROUP],
    mutationFn: newGroup => createGroup(boardId, newGroup),
    onMutate: async group => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
      const previousGroupList = queryClient.getQueryData([QUERY_KEYS.GET_GROUP_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_GROUP_LIST, boardId],
        (oldData: ServiceResponse<Group[]>) => {
          return persistGroupMutate({
            group,
            oldData,
          });
        },
      );
      return { previousGroupList: previousGroupList as Group[] };
    },
    onError: (err, newGroup, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_GROUP_LIST, boardId], context?.previousGroupList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
    },
    ...options,
  });
};

export const useDeleteGroup = ({ boardId, options }: UseDeleteGroupProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_GROUP],
    mutationFn: groupId => deleteGroup(boardId, groupId),
    onMutate: async groupId => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
      const previousGroupList = queryClient.getQueryData([QUERY_KEYS.GET_GROUP_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_GROUP_LIST, boardId],
        (oldData: ServiceResponse<Group[]>) => {
          return persistGroupMutate({
            groupId,
            oldData,
          });
        },
      );
      return { previousGroupList: previousGroupList as Group[] };
    },
    onError: (err, updatedGroup, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_GROUP_LIST, boardId], context?.previousGroupList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
    },
    ...options,
  });
};

export const useUpdateGroup = ({ boardId, options }: UseUpdateGroupProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.UPDATE_GROUP],
    mutationFn: group => updateGroup(boardId, group),
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
    // },
    onMutate: async updatedGroup => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
      const previousGroupList = queryClient.getQueryData([QUERY_KEYS.GET_GROUP_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_GROUP_LIST, boardId],
        (oldData: ServiceResponse<Group[]>) => {
          return persistGroupMutate({
            group: updatedGroup,
            oldData,
            groupId: updatedGroup.id,
          });
        },
      );
      return { previousGroupList: previousGroupList as Group[] };
    },
    onError: (err, updatedGroup, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_GROUP_LIST, boardId], context?.previousGroupList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
    },
    ...options,
  });
};

export const useReorderGroup = ({ boardId, options }: UseReorderGroupProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.REORDER_GROUP],
    mutationFn: groupPositions => reorderGroup(boardId, groupPositions),
    onMutate: async groupPositions => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
      const previousGroupList = queryClient.getQueryData([QUERY_KEYS.GET_GROUP_LIST, boardId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_GROUP_LIST, boardId],
        (oldData: ServiceResponse<Group[]>) => {
          return persistGroupMutate({
            oldData,
            positions: groupPositions,
          });
        },
      );
      return { previousGroupList: previousGroupList as Group[] };
    },
    onError: (err, groupPositions, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_GROUP_LIST, boardId], context?.previousGroupList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_GROUP_LIST, boardId] });
    },
    ...options,
  });
};
