import { z } from 'zod';

export const Activity = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  cardId: z.string().uuid(),
  description: z.string(),
  dateCreated: z.coerce.date(),
});

export const Activities = z.array(Activity);

export const CreateActivityPayload = z.object({
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  description: z.string(),
});

export const GetActivitiesByCardIdPayload = z.object({
  cardId: z.string(),
});
