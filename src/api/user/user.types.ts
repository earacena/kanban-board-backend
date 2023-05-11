import { z } from 'zod';

export const User = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  passwordHash: z.string(),
  dateRegistered: z.date(),
});

export type UserType = z.infer<typeof User>;
