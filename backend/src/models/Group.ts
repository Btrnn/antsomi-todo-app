// Types
import { IdentifyId } from '@app/types';

export interface Group {
  id: IdentifyId;
  name: string;
  position: number;
  created_at: string;
  type: string;
  color: string;
}
