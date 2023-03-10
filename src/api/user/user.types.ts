import { chain } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import {
  string,
  Type,
  TypeOf,
  Context,
  success,
  failure,
  type,
  number,
} from 'io-ts';

const DateIsoString = new Type<Date, string, unknown>(
  'DateIsoString',
  (u: unknown): u is Date => u instanceof Date,
  (u: unknown, ctx: Context) => pipe(
    string.validate(u, ctx),
    chain((s) => {
      const date = new Date(s);
      return Number.isNaN(date.getTime()) ? failure(u, ctx) : success(date);
    }),
  ),
  (a) => a.toISOString(),
);

export const User = type({
  id: number,
  name: string,
  username: string,
  passwordHash: string,
  dateRegistered: DateIsoString,
});

export type UserType = TypeOf<typeof User>;
