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
  dateCreated: z.coerce.date(),
});

export const Columns = z.array(Column);

export type ColumnType = z.infer<typeof Column>;
export type ColumnArrayType = z.infer<typeof Columns>;

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
}).strict();

export const GetColumnByBoardIdParams = z.object({
  boardId: z.string(),
});
