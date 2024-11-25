export type PriorityType = (typeof PRIORITY)[keyof typeof PRIORITY];

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
