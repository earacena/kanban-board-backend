/* eslint-disable import/prefer-default-export */
import { string, type } from 'io-ts';

export const UserDetails = type({
  id: string,
  name: string,
  username: string,
});
