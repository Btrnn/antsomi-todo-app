import { useGetBoardList } from 'queries';
import { useEffect } from 'react';

export const useBoardList = () => {
  const { data: boardList, isLoading, error, refetch } = useGetBoardList();

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    owned: boardList?.data.owned || [],
    shared: boardList?.data.shared || [],
    isLoading,
    error,
    refetch,
  };
};
