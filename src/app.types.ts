/* eslint-disable import/prefer-default-export */
import { z } from 'zod';

const ErrorPayload = z.object({
  code: z.union([z.string(), z.null()]),
  path: z.optional(z.union([
    z.string(),
    z.array(z.union([z.string(), z.number()])),
    z.null(),
  ])),
  value: z.optional(z.union([
    z.string(),
    z.number(),
  ])),
  message: z.string(),
});

const ApiResponse = z.object({
  success: z.boolean(),
});

const ErrorResponsePayload = z.object({
  errorType: z.optional(z.enum(['zod', 'sequelize', 'base'])),
  errors: z.optional(z.array(ErrorPayload)),
});

const UserDetailsPayload = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
});

export const UserDetailsResponse = ApiResponse.and(z.object({ data: UserDetailsPayload }));
export const ErrorResponse = ApiResponse.and(ErrorResponsePayload);
