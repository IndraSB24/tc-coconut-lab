import { describe, it, expect } from 'vitest';
import {
  DomainError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleViolationError,
  IllegalStateTransitionError,
} from '@/core/domain/errors/domain.error';
import { apiSuccess, apiError } from '@/lib/api-response';

describe('Clean Architecture Workbench Healthcheck', () => {
  it('should instantiate universal domain errors with correct HTTP status codes', () => {
    const validationErr = new ValidationError('Payload invalid');
    expect(validationErr).toBeInstanceOf(DomainError);
    expect(validationErr.statusCode).toBe(422);

    const notFoundErr = new NotFoundError('Entity', 'id-123');
    expect(notFoundErr.statusCode).toBe(404);
    expect(notFoundErr.message).toContain('id-123');

    const conflictErr = new ConflictError('Unique constraint violated');
    expect(conflictErr.statusCode).toBe(409);

    const bizErr = new BusinessRuleViolationError('Invariant broken');
    expect(bizErr.statusCode).toBe(422);

    const stateErr = new IllegalStateTransitionError('PENDING', 'CANCELLED');
    expect(stateErr.statusCode).toBe(400);
  });

  it('should format standard API response envelope', async () => {
    const successRes = apiSuccess({ ready: true }, { version: '1.0.0' });
    const successBody = await successRes.json();

    expect(successRes.status).toBe(200);
    expect(successBody.success).toBe(true);
    expect(successBody.data).toEqual({ ready: true });
    expect(successBody.meta?.version).toBe('1.0.0');

    const errorRes = apiError('Bad Request', 'INVALID_PARAM', 400);
    const errorBody = await errorRes.json();

    expect(errorRes.status).toBe(400);
    expect(errorBody.success).toBe(false);
    expect(errorBody.error?.code).toBe('INVALID_PARAM');
  });
});
