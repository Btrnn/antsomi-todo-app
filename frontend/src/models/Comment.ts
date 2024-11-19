import React from 'react';

export interface Comment {
  id: React.Key;
  object_id: React.Key;
  user_id: React.Key;
  object_type: string;
  content: string;
  parentId: React.Key | null;
  threadId: React.Key;
  created_at: string | null;
  updated_at: string | null;
}
