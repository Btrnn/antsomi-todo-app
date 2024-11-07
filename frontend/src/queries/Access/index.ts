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
import {
  changeObjectOwner,
  deleteAccess,
  getAccessList,
  getPermission,
  shareAccess,
  updateAccess,
} from 'services';

// Types
import { IdentifyId, ServiceResponse } from 'types';

type UseGetAccessListProps = {
  objectType: string;
  objectId: IdentifyId;
  options?: UseQueryOptions<
    ServiceResponse<{ id: string; name: string; email: string; permission: string }[]>
  >;
};

type UseGetPermissionProps = {
  objectType: string;
  objectId: IdentifyId;
  options?: UseQueryOptions<ServiceResponse<string>>;
};

type UseChangeOwnerProps = {
  objectType: string;
  objectId: IdentifyId;
  options?: UseMutationOptions<ServiceResponse<boolean>, Error, IdentifyId>;
};

type UseDeleteAccessProps = {
  objectType: string;
  objectId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    IdentifyId,
    { previousAccessList: { id: string; name: string; email: string; permission: string }[] }
  >;
};

type UseShareAccessProps = {
  objectType: string;
  objectId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    { user_id: IdentifyId; permission: string }[],
    { previousAccessList: { id: string; name: string; email: string; permission: string }[] }
  >;
};

type UseUpdateAccessProps = {
  objectType: string;
  objectId: IdentifyId;
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    { user_id: IdentifyId; permission: string }[],
    { previousAccessList: { id: string; name: string; email: string; permission: string }[] }
  >;
};

export const useGetAccessList = ({ objectId, objectType, options }: UseGetAccessListProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ACCESS_LIST, objectId],
    queryFn: () => getAccessList(objectId, objectType),
    enabled: !!objectId,
    ...options,
  });
};

export const useGetPermission = ({ objectId, objectType, options }: UseGetPermissionProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_PERMISSION, objectId],
    queryFn: () => getPermission(objectId, objectType),
    enabled: !!objectId,
    ...options,
  });
};

export const useChangeOwner = ({ objectId, objectType, options }: UseChangeOwnerProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CHANGE_OWNER],
    mutationFn: newOwner => changeObjectOwner(objectId, newOwner, objectType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ACCESS_LIST, objectId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_PERMISSION, objectId],
      });
    },
    ...options,
  });
};

export const useDeleteAccess = ({ objectId, objectType, options }: UseDeleteAccessProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_ACCESS],
    mutationFn: userId => deleteAccess(objectId, userId, objectType),
    onMutate: async userId => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.GET_ACCESS_LIST, objectId],
      });
      const previousAccessList = queryClient.getQueryData([QUERY_KEYS.GET_ACCESS_LIST, objectId]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_ACCESS_LIST, objectId],
        (
          oldData: ServiceResponse<
            { id: string; name: string; email: string; permission: string }[]
          >,
        ) => {
          return {
            data: oldData.data.filter(access => access.id !== userId),
            meta: {},
          };
        },
      );
      return {
        previousAccessList: previousAccessList as {
          id: string;
          name: string;
          email: string;
          permission: string;
        }[],
      };
    },
    onError: (err, updatedGroup, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_ACCESS_LIST, objectId], context?.previousAccessList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ACCESS_LIST, objectId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_PERMISSION, objectId],
      });
    },
    ...options,
  });
};

export const useShareAccess = ({ objectId, objectType, options }: UseShareAccessProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.SHARE_ACCESS],
    mutationFn: accessList => shareAccess(objectId, objectType, accessList),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ACCESS_LIST, objectId],
      });
    },
    ...options,
  });
};

export const useUpdateAccess = ({ objectId, objectType, options }: UseUpdateAccessProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.UPDATE_ACCESS],
    mutationFn: accessList => updateAccess(objectId, objectType, accessList),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ACCESS_LIST, objectId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_PERMISSION, objectId],
      });
    },
    ...options,
  });
};
