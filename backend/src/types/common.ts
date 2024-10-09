export type IdentifyId = string | number;

export type Meta = {
  page?: number;
  limit?: number;
  count?: number;
};

export type ServiceResponse<T> = {
  data: T;
  meta?: Meta;
};

export type UserRequest = {
  id: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
};
