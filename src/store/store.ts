// Libraries
import { configureStore } from '@reduxjs/toolkit'

// Slices
import groupReducer from './slices/groupSlice'
import userReducer from './slices/userSlice'
import taskReducer from './slices/taskSlice'

export const store = configureStore({
  reducer: {
    group: groupReducer,
    user: userReducer,
    task: taskReducer,
  },
  devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch