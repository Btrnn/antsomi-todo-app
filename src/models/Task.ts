import { Dayjs } from 'dayjs';
import React from 'react';

export interface Task {
  id: React.Key;
  name: string;
  description: string;
  status_id: React.Key;
  assignee_id: React.Key | undefined;
  est_time: string;
  start_date: Dayjs;
  end_date: Dayjs;
  position: number;
  created_at: Dayjs;
}
