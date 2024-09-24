import React from 'react';

export interface Group {
  id: React.Key;
  name: string;
  position: number;
  created_at: Date;
  type: string;
  color: string;
}
