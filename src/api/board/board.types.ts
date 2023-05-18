import { z } from 'zod';

export const Board = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string(),
  dateCreated: z.date(),
});

export type BoardType = z.infer<typeof Board>;

export const CreateBoardPayload = z.object({
  userId: z.string().uuid(),
  label: z.string(),
});

export const getBoardsByUserIdParams = z.object({
  userId: z.string(),
});

export const getBoardByIdParams = z.object({
  boardId: z.string(),
});

export const UpdateBoardParams = z.object({
  boardId: z.string(),
  label: z.string(),
});
