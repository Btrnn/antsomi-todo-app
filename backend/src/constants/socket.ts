export const SOCKET_CHANEL = {
  // Send
  CREATE_COMMENT: 'create_comment',
  EDIT_COMMENT: 'edit_comment',
  DELETE_COMMENT: 'delete_comment',

  // Receive
  COMMENT_CREATED: 'comment_created',
  COMMENT_EDITED: 'comment_edited',
  COMMENT_DELETED: 'comment_deleted',

  // Other actions
  CHANGE_ROOM: 'change_room',
} as const;

export const SOCKET_QUERY_KEY = {
  OBJECT: 'object',
};
