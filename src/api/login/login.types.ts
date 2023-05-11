/* eslint-disable import/prefer-default-export */
import { z } from 'zod';

export const UserDetails = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
});
