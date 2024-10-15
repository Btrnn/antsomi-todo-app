// Libraries
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

// Models
import { Board } from 'models/Board';

// Services
import { reorderBoard as reorderBoardAPI } from 'services';

interface BoardState {
  ownedList: Board[];
  sharedList: Board[];
  loading: boolean;
  error: string;
  updateList: Board[];
}

const initialState: BoardState = {
  ownedList: [],
  sharedList: [],
  loading: false,
  error: '',
  updateList: [],
};

export const reorderBoardAsync = createAsyncThunk('board/reorder', async (_, { getState }) => {
  const state = getState() as { board: BoardState };
  const boardPositions = state.board.updateList.map(board => ({
    id: board.id,
    position: board.position,
  }));
  const response = await reorderBoardAPI(boardPositions);
  return response.data;
});

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setOwnedList(state, action: PayloadAction<Board[]>) {
      state.ownedList = action.payload;
    },
    setSharedList(state, action: PayloadAction<Board[]>) {
      state.sharedList = action.payload;
    },

    updateBoard(state, action: PayloadAction<{ id: React.Key; updatedBoard: Partial<Board> }>) {
      const { id, updatedBoard } = action.payload;
      const board = state.ownedList.find(board => board.id === id);
      if (board) {
        Object.assign(board, updatedBoard);
      }
    },

    deleteBoard(state, action: PayloadAction<{ id: React.Key }>) {
      const { id } = action.payload;
      if (id) {
        const updatePosition = state.ownedList.find(group => group.id === id)?.position;
        state.ownedList = state.ownedList.filter(group => group.id !== id);
        if (updatePosition) {
          for (let i = updatePosition; i < state.ownedList.length; i++) {
            state.ownedList[i].position = i;
            state.updateList.push(state.ownedList[i]);
          }
        }
      }
    },

    // setUser(state, action: PayloadAction<Omit<User, 'id' | 'password'>>) {
    //   state.currentUser = action.payload;
    // },
    // updatedUser(state, action: PayloadAction<{ id: number; updatedUser: Partial<User> }>) {
    //   const { id, updatedUser } = action.payload;
    //   const group = state.userList.find(user => user.id === id);
    //   if (group) {
    //     Object.assign(group, updatedUser);
    //   }
    // },
    // deleteUser(state, action: PayloadAction<number>) {
    //   state.userList = state.userList.filter(user => user.id !== action.payload);
    // },
  },
  extraReducers: builder => {
    builder
      .addCase(reorderBoardAsync.pending, state => {
        state.loading = true;
        state.error = '';
      })
      .addCase(reorderBoardAsync.fulfilled, state => {
        state.loading = false;
        state.updateList = [];
      })
      .addCase(reorderBoardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error as string;
      });
  },
});

export const { setOwnedList, setSharedList, updateBoard, deleteBoard } = boardSlice.actions;
export default boardSlice.reducer;
