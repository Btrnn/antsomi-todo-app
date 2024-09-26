// Libraries
import { nanoid } from 'nanoid';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Active, Over } from '@dnd-kit/core/dist/store/index';
import dayjs from 'dayjs';

// Models
import { Group } from 'models/Group';
import { reorderSingleArray } from 'utils';

interface GroupState {
  groupList: Group[];
  groupActived: number;
}

const initialState: GroupState = {
  groupList: [
    {
      id: nanoid(),
      name: 'To Do',
      position: 0,
      created_at: dayjs().format(),
      type: 'Status',
      color: '#a91010',
    },
    {
      id: nanoid(),
      name: 'Doing',
      position: 1,
      created_at: dayjs().format(),
      type: 'Status',
      color: '#ffc53d',
    },
    {
      id: nanoid(),
      name: 'Done',
      position: 2,
      created_at: dayjs().format(),
      type: 'Status',
      color: '#95de64',
    },
  ],
  groupActived: 0,
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setGroup(state, action: PayloadAction<Group[]>) {
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

    deleteGroup(state, action: PayloadAction<{ id: React.Key | undefined }>) {
      const { id } = action.payload;
      if (id) {
        state.groupList = state.groupList.filter(group => group.id !== id);
      }
    },

    reorderGroup(state, action: PayloadAction<{ source: Active; destination: Over }>) {
      const { source, destination } = action.payload;
      const destinationIndex = state.groupList.findIndex(group => group.id === destination.id);
      const sourceIndex = state.groupList.findIndex(group => group.id === source.id);

      state.groupList = reorderSingleArray(state.groupList, sourceIndex, destinationIndex);
    },
  },
});

export const { addGroup, updateGroup, deleteGroup, reorderGroup, setGroup } = groupSlice.actions;
export default groupSlice.reducer;
