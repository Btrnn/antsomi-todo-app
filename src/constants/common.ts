export const TASK_STATUS_KEY = {
  TODO: 'TODO',
  DOING: 'DOING',
  DONE: 'DONE',
} as const;

export const TASK_STATUS = {
  [TASK_STATUS_KEY.TODO]: {
    key: TASK_STATUS_KEY.TODO,
    label: 'To Do',
    color: '#ffa39e',
  },
  [TASK_STATUS_KEY.DOING]: {
    key: TASK_STATUS_KEY.DOING,
    label: 'Doing',
    color: '#fffb8f',
  },
  [TASK_STATUS_KEY.DONE]: {
    key: TASK_STATUS_KEY.DONE,
    label: 'Done',
    color: '#b7eb8f',
  },
};
