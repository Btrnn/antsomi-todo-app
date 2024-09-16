import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { User } from 'models/User';

interface UserState {
  userList: User[];
}

const initialState: UserState = {
  userList: [
    {id: 0, name: 'User A', created_at: new Date(), email: 'a123@gmail.com'},
    {id: 1, name: 'User B', created_at: new Date(), email: 'b123@gmail.com'},
    {id: 2, name: 'User C', created_at: new Date(), email: 'c123@gmail.com'},
  ],
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<Omit<User, 'id' | 'created_at'>>) {
      const newUser: User = {
        id: Math.max(...state.userList.map(user => user.id), 0) + 1,
        created_at: new Date(),
        ...action.payload,
      };

      state.userList.push(newUser);
    },

    updatedUser(state, action: PayloadAction<{ id: number; updatedUser: Partial<User> }>) {
      const { id, updatedUser } = action.payload;
      const group = state.userList.find(user => user.id === id);
      if (group) {
        Object.assign(group, updatedUser); 
      }
    },

    deleteUser(state, action: PayloadAction<number>) {
      state.userList = state.userList.filter(user => user.id !== action.payload);
    },
  },
});

export const { addUser, updatedUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;



