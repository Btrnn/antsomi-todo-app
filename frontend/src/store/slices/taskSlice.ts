// Libraries
import { createSlice, createAsyncThunk, GetState } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import React from 'react';
import dayjs from 'dayjs';
import type { Active, Over } from '@dnd-kit/core/dist/store/index';

// Models
import { Task } from 'models/Task';

// Utils
import { reorderSingleArray, reorderDoubleArrays } from 'utils';

// Services
import { reorderTask as reorderTaskAPI } from 'services';

//Types
import { IdentifyId } from 'types';
import { useParams } from 'react-router-dom';

interface TaskState {
  taskList: Task[];
  loading: boolean;
  error: string;
  updateList: Task[];
}

const initialState: TaskState = {
  taskList: [],
  loading: false,
  error: '',
  updateList: [],
};

export const reorderTaskAsync = createAsyncThunk(
  'task/reorder',
  async (boardId: React.Key, { getState }) => {
    const state = getState() as { task: TaskState };
    const taskPositions = state.task.taskList.map(task => ({
      id: task.id,
      position: task.position,
    }));
    const response = await reorderTaskAPI(boardId, taskPositions);
    state.task.updateList = [];

    return response.data;
  },
);

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

    deleteTask(state, action: PayloadAction<{ id: React.Key | undefined }>) {
      const { id } = action.payload;
      if (id) {
        const deleteTask = state.taskList.find(task => task.id === id);
        state.taskList = state.taskList.filter(task => task.id !== id);
        const { updateList, remainingList } = state.taskList.reduce<{
          updateList: Task[];
          remainingList: Task[];
        }>(
          (accumulator, task) => {
            if (task.status_id === deleteTask?.status_id && task.position > deleteTask?.position) {
              accumulator.updateList.push(task);
            } else {
              accumulator.remainingList.push(task);
            }
            return accumulator;
          },
          { updateList: [], remainingList: [] },
        );
        if (deleteTask) {
          for (let i = 0; i < updateList.length; i++) {
            updateList[i].position = i + deleteTask.position;
          }
        }
        state.updateList = updateList;
        state.taskList = [...updateList, ...remainingList];
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
      const sourceGroup = source.data.current?.groupID;
      const sourceList = state.taskList.filter(task => task.status_id === sourceGroup);

      let destinationGroup;
      if (destination.data.current?.type === 'group') {
        destinationGroup = destination.id;
      } else {
        destinationGroup = destination.data.current?.groupID;
      }

      const destinationList = state.taskList.filter(task => task.status_id === destinationGroup);

      const remainingList = state.taskList.filter(
        task => task.status_id !== destinationGroup && task.status_id !== sourceGroup,
      );

      const sourceIndex = sourceList.findIndex(task => task.id === source.id);
      let destinationIndex = destinationList.findIndex(task => task.id === destination.id);
      if (destinationIndex === -1) {
        destinationIndex = 0;
      }
      if (sourceIndex !== -1) {
        if (sourceGroup === destinationGroup) {
          const reorderedList = reorderSingleArray(destinationList, sourceIndex, destinationIndex);
          for (
            let i = Math.min(sourceIndex, destinationIndex);
            i <= Math.max(sourceIndex, destinationIndex);
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
              status_id: destinationGroup,
            });
          }
        }
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(reorderTaskAsync.pending, state => {
        state.loading = true;
        state.error = '';
      })
      .addCase(reorderTaskAsync.fulfilled, state => {
        state.loading = false;
        state.updateList = [];
      })
      .addCase(reorderTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error as string;
      });
  },
});

export const { addTask, updateTask, deleteTask, deleteTaskByGroupID, reorderTask, setTaskList } =
  taskSlice.actions;

export default taskSlice.reducer;
