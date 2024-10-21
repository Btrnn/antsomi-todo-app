// Libraries
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Constants
import { QUERY_KEYS } from 'constants/query';

// Services
import { getAllBoards } from 'services';

// Types
import { ServiceResponse } from 'types';

// Models
import { Board } from 'models';

type UseGetBoardListProps = {
  options?: UseQueryOptions<ServiceResponse<{ owned: Board[]; shared: Board[] }>>;
};

export const useGetBoardList = (props?: UseGetBoardListProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_BOARD_LIST],
    queryFn: () => getAllBoards(),
    ...props?.options,
  });
};
