/* eslint-disable import/prefer-default-export */
import { z } from 'zod';
import { Board, Boards } from './api/board/board.types';

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

export const ApiResponse = z.object({
  success: z.boolean(),
});

const ErrorResponsePayload = z.object({
  errorType: z.optional(z.enum(['zod', 'sequelize', 'base'])),
  errors: z.optional(z.array(ErrorPayload)),
});

export const UserDetailsPayload = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
});

export const SessionPayload = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
});

export const UserDetailsResponse = ApiResponse.and(z.object({ data: UserDetailsPayload }));
export const BoardResponse = ApiResponse.and(z.object({ data: z.object({ board: Board }) }));
export const BoardsResponse = ApiResponse.and(z.object({ data: z.object({ boards: Boards }) }));
export const ErrorResponse = ApiResponse.and(ErrorResponsePayload);
export const SessionResponse = ApiResponse.and(z.object({ data: SessionPayload }));
