import { NextResponse } from 'next/server';
import { ApiResponse } from '../types';

export const createSuccessResponse = <T>(data: T, message?: string): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date(),
  });
};

export const createErrorResponse = (error: string, status: number = 400): NextResponse<ApiResponse<null>> => {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date(),
  }, { status });
};

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]> & { pagination: any }> => {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    timestamp: new Date(),
  });
};

export const createValidationResponse = (errors: string[]): NextResponse<ApiResponse<{ errors: string[] }>> => {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    data: { errors },
    timestamp: new Date(),
  }, { status: 400 });
};

export const createNotFoundResponse = (resource: string): NextResponse<ApiResponse<null>> => {
  return NextResponse.json({
    success: false,
    error: `${resource} not found`,
    timestamp: new Date(),
  }, { status: 404 });
};

export const createUnauthorizedResponse = (message: string = 'Unauthorized'): NextResponse<ApiResponse<null>> => {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date(),
  }, { status: 401 });
};

export const createForbiddenResponse = (message: string = 'Forbidden'): NextResponse<ApiResponse<null>> => {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date(),
  }, { status: 403 });
};

export const createRateLimitResponse = (message: string = 'Too many requests'): NextResponse<ApiResponse<null>> => {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date(),
  }, { status: 429 });
};

export const createServerErrorResponse = (message: string = 'Internal server error'): NextResponse<ApiResponse<null>> => {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date(),
  }, { status: 500 });
};
