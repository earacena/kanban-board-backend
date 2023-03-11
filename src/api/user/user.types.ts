import { chain } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
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

export const DateIsoString = new Type<Date, string, unknown>(
  'DateIsoString',
  (u: unknown): u is Date => u instanceof Date,
  (u: unknown, ctx: Context) => pipe(
    string.validate(u, ctx),
    chain((s) => {
      const date = new Date(Date.parse(s));
      return Number.isNaN(date.getTime())
        ? failure(u, ctx)
        : success(date);
    }),
  ),
  (a) => a.toISOString(),
);

export const DateC = new Type<Date, Date, unknown>(
  'DateC',
  (u: unknown): u is Date => u instanceof Date,
  (input: unknown, ctx: Context) => (input instanceof Date ? success(input) : failure(input, ctx)),
  identity,
);

export const User = type({
  id: number,
  name: string,
  username: string,
  passwordHash: string,
  dateRegistered: DateC,
});

export type UserType = TypeOf<typeof User>;
