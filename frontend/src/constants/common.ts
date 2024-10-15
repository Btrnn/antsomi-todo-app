// Icons
import { CommenterIcon, EditorIcon, ManagerIcon, ViewerIcon } from 'components/icons';

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
  TASKS: 'tasks',
  USER: 'user',
} as const;

export const ROLE_KEY = {
  EDITOR: 'editor',
  COMMENTER: 'commenter',
  VIEWER: 'viewer',
  MANAGER: 'manager',
  OWNER: 'owner',
} as const;

const OWN = [ROLE_KEY.OWNER];
const MANAGE = [...OWN, ROLE_KEY.MANAGER];
const EDIT = [...MANAGE, ROLE_KEY.EDITOR];
const COMMENT = [...EDIT, ROLE_KEY.COMMENTER];
const VIEW = [...COMMENT, ROLE_KEY.VIEWER];

export const PERMISSION = {
  MANAGE,
  EDIT,
  VIEW,
  COMMENT,
} as const;

export const ROLE_OPTIONS = {
  [ROLE_KEY.VIEWER]: {
    value: ROLE_KEY.VIEWER,
    Icon: ViewerIcon,
    label: 'Viewer',
  },
  [ROLE_KEY.COMMENTER]: {
    value: ROLE_KEY.COMMENTER,
    Icon: CommenterIcon,
    label: 'Commenter',
  },
  [ROLE_KEY.EDITOR]: {
    value: ROLE_KEY.EDITOR,
    Icon: EditorIcon,
    label: 'Editor',
  },
  [ROLE_KEY.MANAGER]: {
    value: ROLE_KEY.MANAGER,
    Icon: ManagerIcon,
    label: 'Manager',
  },
};
