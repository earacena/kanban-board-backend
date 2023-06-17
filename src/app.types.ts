/* eslint-disable import/prefer-default-export */
import { z } from 'zod';
import { Board, Boards } from './api/board/board.types';
import { Column, Columns } from './api/column/column.types';
import { Card, Cards } from './api/card/card.types';
import { Activities, Activity } from './api/activity/activity.types';
import { Tag, Tags } from './api/tag/tag.types';

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
export const ColumnResponse = ApiResponse.and(z.object({ data: z.object({ column: Column }) }));
export const ColumnsResponse = ApiResponse.and(z.object({ data: z.object({ columns: Columns }) }));
export const CardResponse = ApiResponse.and(z.object({ data: z.object({ card: Card }) }));
export const CardsResponse = ApiResponse.and(z.object({ data: z.object({ cards: Cards }) }));
export const ActivityResponse = ApiResponse.and(
  z.object({ data: z.object({ activity: Activity }) }),
);
export const ActivitiesResponse = ApiResponse.and(
  z.object({ data: z.object({ activities: Activities }) }),
);
export const TagResponse = ApiResponse.and(z.object({ data: z.object({ tag: Tag }) }));
export const TagsResponse = ApiResponse.and(z.object({ data: z.object({ tags: Tags }) }));

export const ErrorResponse = ApiResponse.and(ErrorResponsePayload);
export const SessionResponse = ApiResponse.and(z.object({ data: SessionPayload }));
