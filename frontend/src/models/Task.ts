import React from 'react';

export interface Attachment {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  status?: string;
}

export interface Task {
  id: React.Key;
  name: string;
  description: string;
  status_id: React.Key;
  assignee_id: React.Key | null;
  est_time: number | null;
  position: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  owner_id: React.Key;
  reviewer_id: React.Key | null;
  priority: string | null;
  attachments: Attachment[] | null;
}
