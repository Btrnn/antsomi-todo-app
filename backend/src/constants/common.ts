export type PriorityType = (typeof PRIORITY)[keyof typeof PRIORITY];

export const PRIORITY = {
  NORMAL: 'normal',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
