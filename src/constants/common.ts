export const TASK_STATUS_KEY = {
  TODO: "TODO",
  DOING: "DOING",
  DONE: "DONE",
} as const;

export const TASK_STATUS = {
  [TASK_STATUS_KEY.TODO]: {
    key: TASK_STATUS_KEY.TODO,
    label: "To Do",
    color: "pink",
  },
  [TASK_STATUS_KEY.DOING]: {
    key: TASK_STATUS_KEY.DOING,
    label: "Doing",
    color: "#f8961e",
  },
  [TASK_STATUS_KEY.DONE]: {
    key: TASK_STATUS_KEY.DONE,
    label: "Done",
    color: "#90be6d",
  },
};
