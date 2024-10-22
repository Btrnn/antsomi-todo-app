import { useGetBoardList } from 'queries/Board';

export const useBoardList = () => {
  const { data: boardList, isLoading, error } = useGetBoardList();

  return {
    owned: boardList?.data.owned || [],
    shared: boardList?.data.shared || [],
    isLoading,
    error,
  };
};