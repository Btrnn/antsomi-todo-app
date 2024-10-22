import React from 'react';

export interface Task {
  id: React.Key;
  name: string;
  description: string;
  status_id: React.Key;
  assignee_id: React.Key | undefined;
  est_time: string;
  position: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  owner_id: React.Key;
}
