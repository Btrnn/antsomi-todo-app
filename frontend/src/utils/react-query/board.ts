// Libraries
import { nanoid } from 'nanoid';

// Models
import { Board } from 'models';

// Types
import { ServiceResponse } from 'types';
import { cloneDeep } from 'lodash';

type PersistBoardMutateParams = {
  boardId?: Board['id'];
  board?: Partial<Board>;
  oldData: ServiceResponse<{ owned: Board[]; shared: Board[] }>;
};

export const persistBoardMutate = ({ board, boardId, oldData }: PersistBoardMutateParams) => {
  if (!oldData || (!boardId && !board)) {
    return oldData;
  }
  const cloneOldData = cloneDeep(oldData);

  // Case Create: boardId isn't exists
  if (!boardId) {
    cloneOldData.data.owned.push({
      id: nanoid(),
      ...board,
    } as Board);
  } else {
    const { owned, shared } = cloneOldData?.data || {};
    if (!board) {
      //Case Delete: boardId is exists, board isn't exists
      cloneOldData.data.owned = owned.filter(b => b.id !== boardId);
    } else {
      //Case Update: boardId, board is exists
      const { id, ...restOfBoard } = board || {};

      owned?.some(board => {
        if (board.id === id) {
          Object.assign(board, restOfBoard);
          return true;
        }
        return false;
      });

      shared?.some(board => {
        if (board.id === id) {
          Object.assign(board, restOfBoard);
          return true;
        }
        return false;
      });
    }
  }

  return cloneOldData;
};
