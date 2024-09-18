// Libraries
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import React from "react";

// Models
import { Task } from "models/Task";


// Utils
import { reorderSingleArray, reorderDoubleArrays } from "utils";
import { stat } from "fs";


interface TaskState {
  taskList: Task[];
}

const initialState: TaskState = {
  taskList: [],
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    addTask(
      state,
      action: PayloadAction<Omit<Task, "id" | "position" | "created_at">>
    ) {
      const newTask: Task = {
        id: nanoid(),
        position: state.taskList.length,
        created_at: new Date(),
        ...action.payload,
      };

      state.taskList.push(newTask);
    },

    updateTask(
      state,
      action: PayloadAction<{ id: string; updatedTask: Partial<Task> }>
    ) {
      const { id, updatedTask } = action.payload;
      const task = state.taskList.find((task) => String(task.id) === id);
      if (task) {
        Object.assign(task, updatedTask);
      }
    },

    deleteTaskByID(state, action: PayloadAction<{id: React.Key}>) {
      const { id } = action.payload;
      state.taskList = state.taskList.filter((task) => task.id !== id);
    },

    deleteTaskByGroupID(state, action: PayloadAction<{groupID: React.Key}>) {
      const { groupID } = action.payload;
      state.taskList = state.taskList.filter((task) => task.status_id !== groupID);
    },

    reorderTask(state, action: PayloadAction<{source: any, destination: any, taskID: string}>){

        const { source, destination, taskID } = action.payload;
      
        const destinationList = state.taskList.filter((task) => String(task.status_id) == destination.droppableId);
        const sourceList = state.taskList.filter((task) => String(task.status_id) === source.droppableId);
        const remainingList = state.taskList.filter((task) => (String(task.status_id) !== destination.droppableId && String(task.status_id) !== source.droppableId));

        if(source.droppableId === destination.droppableId)
          state.taskList = [...remainingList,...reorderSingleArray(destinationList, source.index, destination.index)];
        else{
          state.taskList = [...remainingList, ...reorderDoubleArrays(sourceList, destinationList, source.index, destination.index)];
          const task = state.taskList.find((task) => String(task.id) === taskID);
          if (task) {
            Object.assign(task, {status_id: destination.droppableId});
          }
        }
  },
}});

export const { addTask, updateTask, deleteTaskByID, deleteTaskByGroupID, reorderTask } = taskSlice.actions;
export default taskSlice.reducer;
