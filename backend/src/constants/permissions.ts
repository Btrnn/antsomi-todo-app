export const ROLE = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  COMMENTER: 'commenter',
  MANAGER: 'manager',
} as const;

const OWN = [ROLE.OWNER];
const MANAGE = [ROLE.OWNER, ROLE.MANAGER];
const EDIT = [...MANAGE, ROLE.EDITOR];
const COMMENT = [...EDIT, ROLE.COMMENTER];
const VIEW = [...COMMENT, ROLE.VIEWER];

export const PERMISSION = {
  OWN,
  MANAGE,
  EDIT,
  VIEW,
  COMMENT,
} as const;

export const ACCESS_OBJECT = {
  BOARD: 'boardID',
} as const;

export const OBJECT_TYPE = {
  BOARD: 'board',
} as const;
