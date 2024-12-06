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

export const SOCKET_QUERY_KEY = {
  OBJECT: 'object',
};

export const SOCKET_ORIGINS = {
  LOCAL: ['http://localhost:3001'],
  PRODUCTION: ['https://antsomi-todo.vercel.app'],
};

export const SOCKET_GATEWAY = {
  NAMESPACE: {
    COMMENT: 'comment',
    NOTIFICATION: 'notification',
  },
  CORS: {
    ORIGIN:
      process.env.NODE_ENV === 'production'
        ? SOCKET_ORIGINS.PRODUCTION
        : SOCKET_ORIGINS.LOCAL,
    METHODS: ['GET', 'POST'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  },
};
