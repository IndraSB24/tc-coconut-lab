import { NextResponse } from 'next/server';
import { DomainError } from '@/core/domain/errors';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
  } | null;
  meta?: Record<string, unknown>;
}

export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

export function apiError(
  message: string,
  code = 'BAD_REQUEST',
  status = 400,
  meta?: Record<string, unknown>
) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      data: null,
      error: { code, message },
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

export function handleApiError(err: unknown) {
  if (err instanceof DomainError) {
    return apiError(err.message, err.code, err.statusCode);
  }
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  return apiError(message, 'INTERNAL_SERVER_ERROR', 500);
}
