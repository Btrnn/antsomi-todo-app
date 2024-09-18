// Libraries
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";

// Models
import { Task } from "models/Task";


// Utils
import { reorder } from "utils";

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
        position: Math.max(...state.taskList.map((group) => group.position), 0) + 1,
        created_at: new Date(),
        ...action.payload,
      };

      state.taskList.push(newTask);
    },

    updateTask(
      state,
      action: PayloadAction<{ id: React.Key; updatedTask: Partial<Task> }>
    ) {
      const { id, updatedTask } = action.payload;
      const task = state.taskList.find((task) => task.id === id);
      if (task) {
        Object.assign(task, updatedTask);
      }
    },

    deleteTask(state, action: PayloadAction<number>) {
      state.taskList = state.taskList.filter(
        (task) => task.id !== action.payload
      );
    },

    reorderTask(state, action: PayloadAction<{source: number, destination: number}>){
        const { source, destination } = action.payload;
        state.taskList = reorder(state.taskList, source, destination);
        console.log(state.taskList)
    }
  },
});

export const { addTask, updateTask, deleteTask, reorderTask } = taskSlice.actions;
export default taskSlice.reducer;
