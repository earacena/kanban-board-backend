/* eslint-disable import/prefer-default-export */
import {
  Type, success, failure, identity,
} from 'io-ts';

export const EnvVarPortNumber = new Type<number, number, string>(
  'environment variable port number',
  (u: unknown): u is number => typeof u === 'number',
  (input, context) => (typeof input === 'string' && !Number.isNaN(Number(input))
    ? success(Number(input))
    : failure(input, context)),
  identity,
);
