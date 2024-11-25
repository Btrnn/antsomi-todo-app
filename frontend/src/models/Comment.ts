import React from 'react';

export interface Comment {
  id: React.Key;
  object_id: React.Key;
  user_id: React.Key;
  object_type: string;
  content: string;
  parent_id: React.Key | null;
  created_at: string | null;
  updated_at: string | null;
}
