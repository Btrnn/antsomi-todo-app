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

    reorderTask(state, action: PayloadAction<{source: any, destination: any}>){
        const { source, destination } = action.payload;

        // GroupID
        const sourceGroup= source.data.current.containerId
        const destinationGroup = destination.data.current.containerId

        // Groups
        const destinationList = state.taskList.filter((task) => task.status_id === destinationGroup);
        const sourceList = state.taskList.filter((task) => task.status_id === sourceGroup);
        const remainingList = state.taskList.filter((task) => (String(task.status_id) !== destinationGroup && String(task.status_id) !== sourceGroup));

        // TaskID
        const sourceIndex= sourceList.findIndex(task => task.id === source.id)
        //const destinationIndex = destinationList.findIndex(task => task.id === destination.id);
        const destinationIndex = destination.id === '-1' ? 0 
              : destination.id === '1' ? destinationList.length 
              : destinationList.findIndex(task => task.id === destination.id);



        if(sourceGroup === destinationGroup)
          state.taskList = [...remainingList,...reorderSingleArray(destinationList, sourceIndex, destinationIndex)];
        else{
          state.taskList = [...remainingList, ...reorderDoubleArrays(sourceList, destinationList, sourceIndex, destinationIndex)];
          const task = state.taskList.find((task) => String(task.id) === source.id);
          if (task) {
            Object.assign(task, {status_id: destination.data.current.containerId});
          }
        }
  },
}});

export const { addTask, updateTask, deleteTaskByID, deleteTaskByGroupID, reorderTask } = taskSlice.actions;
export default taskSlice.reducer;
