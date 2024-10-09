import React from 'react';

export interface Board {
  id: React.Key;
  name: string;
  position: number;
  created_at: string;
  owner_id: React.Key;
}
