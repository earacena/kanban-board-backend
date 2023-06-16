import { z } from 'zod';

export const Tag = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  label: z.string(),
  color: z.string(),
});

export const Tags = z.array(Tag);

export const CreateTagPayload = z.object({
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string(),
  color: z.string(),
});

export const GetTagsByCardIdParams = z.object({
  cardId: z.string(),
});

export const DeleteTagByIdParams = z.object({
  tagId: z.string().uuid(),
});
