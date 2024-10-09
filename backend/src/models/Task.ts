// Types
import { IdentifyId } from '@app/types';

export interface Task {
  id: IdentifyId;
  name: string;
  description: string;
  status_id: IdentifyId;
  assignee_id: IdentifyId | undefined;
  est_time: string;
  position: number;
  start_date: string;
  end_date: string;
  created_at: string;
}
