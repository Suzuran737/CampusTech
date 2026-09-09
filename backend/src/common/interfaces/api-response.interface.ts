export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const SUCCESS_CODE = 0;

export function successResponse<T>(data: T, message = 'ok'): ApiResponse<T> {
  return { code: SUCCESS_CODE, message, data };
}

export function errorResponse(message: string, code = 40000): ApiResponse<null> {
  return { code, message, data: null };
}
