import React from "react";

export interface Task {
  id: React.Key;
  name: string;
  description: string;
  status_id: React.Key;
  assignee_id: React.Key;
  est_time: string;
  start_date: Date;
  end_date: Date;
  position: number;
  created_at: Date;
}
