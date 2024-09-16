import React from "react";

export interface Task {
  id: React.Key;
  name: string;
  description: string;
  status_id: number;
  assignee_id: number;
  estTime: string;
  startDate: Date;
  endDate: Date;
  position: number;
  created_at: Date;
}
