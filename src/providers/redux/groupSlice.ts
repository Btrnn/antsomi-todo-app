import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Group } from 'models/Group'

interface GroupState {
  groupList: Group[];
}

const initialState: GroupState = {
  groupList: [
    {id: 0, name: 'To Do', position: 0, created_at: new Date(), type: 'Status', color: '#ffbb96'},
    {id: 1, name: 'Doing', position: 1, created_at: new Date(), type: 'Status', color: '#ffc53d'},
    {id: 2, name: 'Done', position: 2, created_at: new Date(), type: 'Status', color: '#95de64'},
  ],
};


const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    addGroup(state, action: PayloadAction<Omit<Group, 'id' | 'position' | 'created_at' | 'color'>>) {
      const newGroup: Group = {
        id: Math.max(...state.groupList.map(group => group.id), 0) + 1,
        position: Math.max(...state.groupList.map(group => group.position), 0) + 1, 
        created_at: new Date(),
        color: '#597ef7',
        ...action.payload,
      };

      state.groupList.push(newGroup);
    },

    updateGroup(state, action: PayloadAction<{ id: number; updatedGroup: Partial<Group> }>) {
      const { id, updatedGroup } = action.payload;
      const group = state.groupList.find(group => group.id === id);
      if (group) {
        Object.assign(group, updatedGroup); 
      }
    },

    deleteGroup(state, action: PayloadAction<number>) {
      state.groupList = state.groupList.filter(group => group.id !== action.payload);
    },
  },
});

export const { addGroup, updateGroup, deleteGroup } = groupSlice.actions;
export default groupSlice.reducer;



