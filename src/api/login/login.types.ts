/* eslint-disable import/prefer-default-export */
import { z } from 'zod';

export const UserCredentials = z.object({
  username: z.string(),
  password: z.string(),
});

export type UserCredentialsType = z.infer<typeof UserCredentials>;
