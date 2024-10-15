// Libraries
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

// Models
import { User } from 'models/User';
import dayjs from 'dayjs';

interface UserState {
  userList: User[];
  currentUser: Omit<User, 'id' | 'password'>;
  currentPermission: string;
}

const initialState: UserState = {
  userList: [
    // { id: nanoid(), name: 'User A', created_at: dayjs().format(), email: 'a123@gmail.com' },
    // { id: nanoid(), name: 'User B', created_at: dayjs().format(), email: 'b123@gmail.com' },
    // { id: nanoid(), name: 'User C', created_at: dayjs().format(), email: 'c123@gmail.com' },
  ],
  currentUser: { name: '', email: '', phone_number: '', created_at: '' },
  currentPermission: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<User, 'id' | 'password'>>) {
      state.currentUser = action.payload;
    },
    updatedUser(state, action: PayloadAction<{ id: number; updatedUser: Partial<User> }>) {
      const { id, updatedUser } = action.payload;
      const group = state.userList.find(user => user.id === id);
      if (group) {
        Object.assign(group, updatedUser);
      }
    },
    setPermission(state, action: PayloadAction<string>) {
      state.currentPermission = action.payload;
    },
    deleteUser(state, action: PayloadAction<number>) {
      state.userList = state.userList.filter(user => user.id !== action.payload);
    },
  },
});

export const { updatedUser, deleteUser, setUser, setPermission } = userSlice.actions;
export default userSlice.reducer;
