import React from 'react';

export interface Group {
  id: React.Key;
  name: string;
  position: number;
  created_at: string;
  type: string;
  color: string;
  owner_id: React.Key;
}
