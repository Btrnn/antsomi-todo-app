// Libraries
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

// Models
import { User } from 'models/User';
import dayjs from 'dayjs';

interface UserState {
  userList: User[];
}

const initialState: UserState = {
  userList: [
    { id: nanoid(), name: 'User A', created_at: dayjs().format(), email: 'a123@gmail.com' },
    { id: nanoid(), name: 'User B', created_at: dayjs().format(), email: 'b123@gmail.com' },
    { id: nanoid(), name: 'User C', created_at: dayjs().format(), email: 'c123@gmail.com' },
  ],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<Omit<User, 'id' | 'created_at'>>) {
      const newUser: User = {
        id: nanoid(),
        created_at: dayjs().format(),
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
