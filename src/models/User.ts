import React from "react";

export interface User {
  id: React.Key;
  name: string;
  email: string;
  created_at: Date;
}
