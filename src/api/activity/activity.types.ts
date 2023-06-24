import { z } from 'zod';

export const Activity = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  cardId: z.string().uuid(),
  type: z.string(),
  description: z.string(),
  dateCreated: z.coerce.date(),
});

export const Activities = z.array(Activity);

export type ActivityType = z.infer<typeof Activity>;
export type ActivityArrayType = z.infer<typeof Activities>;

export const CreateActivityPayload = z.object({
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string(),
  description: z.string(),
});

export const GetActivitiesByCardIdParams = z.object({
  cardId: z.string(),
});
