// Libraries
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import React from 'react';
import dayjs from 'dayjs';
import type { Active, Over } from '@dnd-kit/core/dist/store/index';

// Models
import { Task } from 'models/Task';

// Utils
import { reorderSingleArray, reorderDoubleArrays } from 'utils';
import { get } from 'lodash';

interface TaskState {
  taskList: Task[];
}

const initialState: TaskState = {
  taskList: [],
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTaskList(state, action: PayloadAction<Task[]>) {
      state.taskList = action.payload;
    },
    addTask(state, action: PayloadAction<Omit<Task, 'id' | 'position' | 'created_at'>>) {
      const newTask: Task = {
        id: nanoid(),
        position: state.taskList.length,
        created_at: dayjs().format(),
        ...action.payload,
      };
      state.taskList.push(newTask);
    },

    updateTask(state, action: PayloadAction<{ id: string; updatedTask: Partial<Task> }>) {
      const { id, updatedTask } = action.payload;
      const task = state.taskList.find(task => String(task.id) === id);
      if (task) {
        Object.assign(task, updatedTask);
      }
    },

    deleteTaskByID(state, action: PayloadAction<{ id: React.Key | undefined }>) {
      const { id } = action.payload;
      if (id) {
        state.taskList = state.taskList.filter(task => task.id !== id);
      }
    },

    deleteTaskByGroupID(state, action: PayloadAction<{ groupID: React.Key | undefined }>) {
      const { groupID } = action.payload;
      if (groupID) {
        state.taskList = state.taskList.filter(task => task.status_id !== groupID);
      }
    },

    reorderTask(state, action: PayloadAction<{ source: Active; destination: Over }>) {
      const { source, destination } = action.payload;
      const task = state.taskList.find(task => task.id === source.id);

      if (get(destination, 'data.current.type', '') === 'group') {
        if (task) {
          Object.assign(task, { status_id: destination.id });
        }
      } else {
        const sourceGroup = source.data.current?.groupID;
        const destinationGroup = destination.data.current?.groupID;

        const destinationList = state.taskList.filter(task => task.status_id === destinationGroup);
        const sourceList = state.taskList.filter(task => task.status_id === sourceGroup);
        const remainingList = state.taskList.filter(
          task => task.status_id !== destinationGroup && task.status_id !== sourceGroup,
        );

        const sourceIndex = sourceList.findIndex(task => task.id === source.id);
        const destinationIndex = destinationList.findIndex(task => task.id === destination.id);

        if (sourceGroup === destinationGroup) {
          const reorderedList = reorderSingleArray(destinationList, sourceIndex, destinationIndex);
          for (
            let i = Math.min(sourceIndex, destinationIndex);
            i < Math.max(sourceIndex, destinationIndex);
            i++
          ) {
            reorderedList[i].position = i;
          }
          state.taskList = [...remainingList, ...reorderedList];
        } else {
          const [reorderedSourceList, reorderedDestinationList] = reorderDoubleArrays(
            sourceList,
            destinationList,
            sourceIndex,
            destinationIndex,
          );
          for (let i = sourceIndex; i < reorderedSourceList.length; i++) {
            reorderedSourceList[i].position = i;
          }
          for (let i = destinationIndex; i < reorderedDestinationList.length; i++) {
            reorderedDestinationList[i].position = i;
          }
          state.taskList = [...remainingList, ...reorderedSourceList, ...reorderedDestinationList];
          if (task) {
            Object.assign(task, {
              status_id: destination.data.current?.groupID,
            });
          }
        }
      }
    },
    moveTask(state, action: PayloadAction<{ source: Active; destination: Over }>) {
      const { source, destination } = action.payload;
      const task = state.taskList.find(task => task.id === source.id);
      if (get(destination, 'data.current.type', '') === 'group') {
        if (task) {
          Object.assign(task, { status_id: destination.id });
        }
      } else {
        const sourceGroup = source.data.current?.groupID;
        const destinationGroup = destination.data.current?.groupID;
        if (sourceGroup !== destinationGroup) {
          if (task) {
            Object.assign(task, { status_id: destination.data.current?.groupID });
          }
        }
      }
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTaskByID,
  deleteTaskByGroupID,
  reorderTask,
  setTaskList,
  moveTask,
} = taskSlice.actions;

export default taskSlice.reducer;
