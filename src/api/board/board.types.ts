import { z } from 'zod';

export const Board = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string(),
  dateCreated: z.coerce.date(),
});

export const Boards = z.array(Board);

export type BoardType = z.infer<typeof Board>;

export type BoardArrayType = z.infer<typeof Boards>;

export const CreateBoardPayload = z.object({
  userId: z.string().uuid(),
  label: z.string(),
});

export const GetBoardsByUserIdParams = z.object({
  userId: z.string(),
});

export const GetBoardByIdParams = z.object({
  boardId: z.string(),
});

export const UpdateBoardParams = z.object({
  boardId: z.string(),
  label: z.string(),
});
