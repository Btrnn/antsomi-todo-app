import { configureStore } from '@reduxjs/toolkit'
import groupReducer from './groupSlice'
import userReducer from './userSlice'
import taskReducer from './taskSlice'

export const store = configureStore({
  reducer: {
    group: groupReducer,
    user: userReducer,
    task: taskReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch