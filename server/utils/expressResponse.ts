import { ApiResponse } from '../types';

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date(),
  };
};

export const createErrorResponse = (error: string, status: number = 400): ApiResponse<null> => {
  return {
    success: false,
    error,
    timestamp: new Date(),
  };
};

export const createUnauthorizedResponse = (message: string = 'Unauthorized'): ApiResponse<null> => {
  return {
    success: false,
    error: message,
    timestamp: new Date(),
  };
};
