import React from 'react';

export interface User {
  id: React.Key;
  name: string;
  email: string;
  phone_number: string;
  password: string;
  created_at: string;
}
