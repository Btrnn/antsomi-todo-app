export const SOCKET_COMMENT_CHANEL = {
  // Send
  CREATE_COMMENT: 'create_comment',
  EDIT_COMMENT: 'edit_comment',
  DELETE_COMMENT: 'delete_comment',

  // Receive
  COMMENT_CREATED: 'comment_created',
  COMMENT_EDITED: 'comment_edited',
  COMMENT_DELETED: 'comment_deleted',
} as const;

export const SOCKET_NOTIFICATION_CHANEL = {
  // Send
  CREATE_NOTIFICATION: 'create_notification',
  EDIT_NOTIFICATION: 'edit_notification',
  DELETE_NOTIFICATION: 'delete_notification',

  // Receive
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_EDITED: 'notification_edited',
  NOTIFICATION_DELETED: 'notification_deleted',
} as const;

export const SOCKET_NAMESPACE = {
  COMMENT: 'comment',
  CHAT: 'chat',
  NOTIFICATION: 'notification',
};

export const SOCKET_QUERY_KEY = {
  OBJECT: 'object',
};
