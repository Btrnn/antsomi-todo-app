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

export const DASHBOARD_KEY = {
  HOME: 'home',
  BOARD: 'board',
  OWNED: 'owned',
  SHARED: 'shared',
  USER: 'user',
} as const;

export const DASHBOARD_NAME = {
  [DASHBOARD_KEY.HOME]: 'Home',
  [DASHBOARD_KEY.BOARD]: 'Boards',
  [DASHBOARD_KEY.OWNED]: 'Your board',
  [DASHBOARD_KEY.SHARED]: 'Shared board',
  [DASHBOARD_KEY.USER]: 'User',
} as const;
