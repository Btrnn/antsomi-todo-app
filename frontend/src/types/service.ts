export type Meta = {
  page?: number;
  limit?: number;
  count?: number;
};

export type ServiceResponse<T> = {
  statusCode: number;
  statusMessage: string;
  data: T;
  meta: Meta;
};
