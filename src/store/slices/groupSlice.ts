// Libraries
import { nanoid } from "nanoid";
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Models
import { Group } from 'models/Group'
import { reorderSingleArray } from "utils";
import { cloneDeep } from "lodash";


interface GroupState {
  groupList: Group[];
  groupActived: number
}

const initialState: GroupState = {
  groupList: [
    {id: nanoid(), name: 'To Do', position: 0, created_at: new Date(), type: 'Status', color: '#ffbb96'},
    {id: nanoid(), name: 'Doing', position: 1, created_at: new Date(), type: 'Status', color: '#ffc53d'},
    {id: nanoid(), name: 'Done', position: 2, created_at: new Date(), type: 'Status', color: '#95de64'},
  ],
  groupActived: 0
};


const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    addGroup(state, action: PayloadAction<Omit<Group, 'id' | 'position' | 'created_at' | 'color'>>) {
      const newGroup: Group = {
        id: nanoid(),
        position: state.groupList.length, 
        created_at: new Date(),
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

    deleteGroup(state, action: PayloadAction<{id: React.Key}>) {
      const { id } = action.payload;
      state.groupList = state.groupList.filter((group) => group.id !== id);
    },

    reorderGroup(state, action: PayloadAction<{source: any, destination: any}>){
      const { source, destination } = action.payload;
      const sourceIndex = state.groupList.findIndex(group=> group.id === source.id)
      const destinationIndex = state.groupList.findIndex(group=> group.id === destination.id)

      console.log("debug:: ", cloneDeep(reorderSingleArray(state.groupList,sourceIndex, destinationIndex)))

      state.groupList= reorderSingleArray(state.groupList,sourceIndex, destinationIndex)
    }
  },
});

export const { addGroup, updateGroup, deleteGroup, reorderGroup } = groupSlice.actions;
export default groupSlice.reducer;



