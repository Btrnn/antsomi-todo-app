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
import { createBoard, deleteBoard, getAllBoards, updateBoard, UpdateBoardArgs } from 'services';

// Types
import { IdentifyId, ServiceResponse } from 'types';

// Models
import { Board } from 'models';
import { persistBoardMutate } from 'utils';

type UseGetBoardListProps = {
  options?: UseQueryOptions<ServiceResponse<{ owned: Board[]; shared: Board[] }>>;
};

type UseCreateBoardProps = {
  options?: UseMutationOptions<
    ServiceResponse<Board>,
    Error,
    Partial<Board>,
    { previousBoardList: Board[] }
  >;
};

type UseDeleteBoardProps = {
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    IdentifyId,
    { previousBoardList: Board[] }
  >;
};

type UseUpdateBoardProps = {
  options?: UseMutationOptions<
    ServiceResponse<boolean>,
    Error,
    UpdateBoardArgs,
    { previousBoardList: Board[] }
  >;
};

export const useGetBoardList = (props?: UseGetBoardListProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_BOARD_LIST],
    queryFn: getAllBoards,
    ...props?.options,
  });
};

export const useCreateBoard = (props?: UseCreateBoardProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_BOARD],
    mutationFn: createBoard,
    onMutate: async board => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.GET_BOARD_LIST],
      });
      const previousBoardList = queryClient.getQueryData([QUERY_KEYS.GET_BOARD_LIST]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_BOARD_LIST],
        (oldData: ServiceResponse<{ owned: Board[]; shared: Board[] }>) => {
          return persistBoardMutate({
            board,
            oldData,
          });
        },
      );
      return { previousBoardList: previousBoardList as Board[] };
    },
    onError: (err, newBoard, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_BOARD_LIST], context?.previousBoardList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_BOARD_LIST] });
    },
    ...props?.options,
  });
};

export const useDeleteBoard = (props?: UseDeleteBoardProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_BOARD],
    mutationFn: deleteBoard,
    onMutate: async boardId => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.GET_BOARD_LIST],
      });
      const previousBoardList = queryClient.getQueryData([QUERY_KEYS.GET_BOARD_LIST]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_BOARD_LIST],
        (oldData: ServiceResponse<{ owned: Board[]; shared: Board[] }>) => {
          const newData = persistBoardMutate({
            boardId: boardId,
            oldData,
          });
          return newData;
        },
      );
      return { previousBoardList: previousBoardList as Board[] };
    },
    onError: (err, boardId, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_BOARD_LIST], context?.previousBoardList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_BOARD_LIST] });
    },
    ...props?.options,
  });
};

export const useUpdateBoard = (props?: UseUpdateBoardProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.UPDATE_BOARD],
    mutationFn: updateBoard,
    onMutate: async ({ board }) => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.GET_BOARD_LIST],
      });
      const previousBoardList = queryClient.getQueryData([QUERY_KEYS.GET_BOARD_LIST]);
      queryClient.setQueryData(
        [QUERY_KEYS.GET_BOARD_LIST],
        (oldData: ServiceResponse<{ owned: Board[]; shared: Board[] }>) => {
          return persistBoardMutate({
            board,
            boardId: board?.id,
            oldData,
          });
        },
      );
      return { previousBoardList: previousBoardList as Board[] };
    },
    onError: (err, updatedboard, context) => {
      queryClient.setQueryData([QUERY_KEYS.GET_BOARD_LIST], context?.previousBoardList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_BOARD_LIST] });
    },
    ...props?.options,
  });
};
