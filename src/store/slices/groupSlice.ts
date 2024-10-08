// Libraries
import { nanoid } from 'nanoid';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Active, Over } from '@dnd-kit/core/dist/store/index';
import dayjs from 'dayjs';

// Models
import { Group } from 'models/Group';

// Utils
import { reorderSingleArray } from 'utils';

// Services
import { reorderGroup as reorderGroupAPI } from 'services';

interface GroupState {
  groupList: Group[];
  groupActived: number;
  loading: boolean;
  error: string;
  updateList: Group[];
}

const initialState: GroupState = {
  groupList: [],
  groupActived: 0,
  loading: false,
  error: '',
  updateList: [],
};

export const reorderGroupAsync = createAsyncThunk('group/reorder', async (_, { getState }) => {
  const state = getState() as { group: GroupState };
  const groupPositions = state.group.updateList.map(group => ({
    id: group.id,
    position: group.position,
  }));
  const response = await reorderGroupAPI(groupPositions);
  return response.data;
});

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setGroupList(state, action: PayloadAction<Group[]>) {
      state.groupList = action.payload;
    },
    addGroup(
      state,
      action: PayloadAction<Omit<Group, 'id' | 'position' | 'created_at' | 'color'>>,
    ) {
      const newGroup: Group = {
        id: nanoid(),
        position: state.groupList.length,
        created_at: dayjs().format(),
        color: '#597ef7',
        ...action.payload,
      };

      state.groupList.push(newGroup);
    },

    updateGroup(state, action: PayloadAction<{ id: React.Key; updatedGroup: Partial<Group> }>) {
      const { id, updatedGroup } = action.payload;
      const group = state.groupList.find(group => group.id === id);
      if (group) {
        Object.assign(group, updatedGroup);
      }
    },

    deleteGroup(state, action: PayloadAction<{ id: React.Key }>) {
      const { id } = action.payload;
      if (id) {
        const updatePosition = state.groupList.find(group => group.id === id)?.position;
        state.groupList = state.groupList.filter(group => group.id !== id);
        if (updatePosition) {
          for (let i = updatePosition; i < state.groupList.length; i++) {
            state.groupList[i].position = i;
            state.updateList.push(state.groupList[i]);
          }
        }
      }
    },

    reorderGroup(state, action: PayloadAction<{ source: Active; destination: Over }>) {
      const { source, destination } = action.payload;
      const destinationIndex = state.groupList.findIndex(group => group.id === destination.id);
      const sourceIndex = state.groupList.findIndex(group => group.id === source.id);
      state.groupList = reorderSingleArray(state.groupList, sourceIndex, destinationIndex);
      for (
        let i = Math.min(sourceIndex, destinationIndex);
        i <= Math.max(sourceIndex, destinationIndex);
        i++
      ) {
        state.groupList[i].position = i;
        state.updateList.push(state.groupList[i]);
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(reorderGroupAsync.pending, state => {
        state.loading = true;
        state.error = '';
      })
      .addCase(reorderGroupAsync.fulfilled, state => {
        state.loading = false;
        state.updateList = [];
      })
      .addCase(reorderGroupAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error as string;
      });
  },
});

export const { addGroup, updateGroup, deleteGroup, reorderGroup, setGroupList } =
  groupSlice.actions;
export default groupSlice.reducer;
