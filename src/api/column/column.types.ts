import { z } from 'zod';

export const CreateColumnPayload = z.object({
  userId: z.string().uuid(),
  label: z.string(),
  boardId: z.string(),
});

export const Column = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  boardId: z.string().uuid(),
  label: z.string(),
});

export const Columns = z.array(Column);

export const GetColumnByIdParams = z.object({
  columnId: z.string(),
});

export const GetColumnsByUserIdParams = z.object({
  userId: z.string(),
});

export const DeleteColumnByIdParams = z.object({
  columnId: z.string(),
});

export const UpdatableColumnFields = z.object({
  label: z.string(),
});
export const GetColumnByBoardIdParams = z.object({
  boardId: z.string(),
});
