import { z } from 'zod';

export const Card = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  columnId: z.string().uuid(),
  brief: z.string(),
  body: z.string(),
  color: z.string(),
  dateCreated: z.coerce.date(),
});

export const Cards = z.array(Card);

export const CreateCardPayload = z.object({
  userId: z.string(),
  columnId: z.string(),
  brief: z.string(),
  body: z.string(),
  color: z.string(),
});

export type CardType = z.infer<typeof Card>;
export type CardArrayType = z.infer<typeof Cards>;

export const GetCardByIdParams = z.object({
  cardId: z.string(),
});

export const GetCardsByColumnIdParams = z.object({
  columnId: z.string(),
});

export const GetCardsByUserIdParams = z.object({
  userId: z.string(),
});

export const DeleteCardByIdParams = z.object({
  cardId: z.string(),
});

export const DeleteCardsByColumnIdParams = z.object({
  columnId: z.string(),
});

export const UpdateCardByIdParams = z.object({
  cardId: z.string(),
});

export const UpdatableCardFields = z.object({
  columnId: z.string(),
  body: z.string(),
  brief: z.string(),
  color: z.string(),
}).strict();
