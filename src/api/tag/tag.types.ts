import { z } from 'zod';

export const Tag = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  cardId: z.string().uuid(),
  label: z.string(),
  color: z.string(),
});

export const Tags = z.array(Tag);

export type TagType = z.infer<typeof Tag>;
export type TagArrayType = z.infer<typeof Tags>;

export const CreateTagPayload = z.object({
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string(),
  color: z.string(),
});

export const GetTagsByUserIdParams = z.object({
  userId: z.string().uuid(),
});

export const AddCardIdToTagParams = z.object({
  tagId: z.string().uuid(),
});

export const AddCardIdToTagPayload = z.object({
  cardId: z.string().uuid(),
});

export const DeleteTagByIdParams = z.object({
  tagId: z.string().uuid(),
});
