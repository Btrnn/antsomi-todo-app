// Types
import { IdentifyId } from '@app/types';

export interface User {
  id: IdentifyId;
  name: string;
  email: string;
  created_at: string;
}
