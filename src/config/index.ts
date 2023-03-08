import 'dotenv/config';
import { fold } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { number, string } from 'io-ts';

const checkString = (u: unknown): string => {
  // Type check for strings
  // Handle failure
  const onLeft = (): string => '';

  // Handle success
  const onRight = (s: string): string => s;

  return pipe(string.decode(u), fold(onLeft, onRight));
};

const checkPortNumber = (u: unknown): number => {
  // Type check for strings
  // Handle failure
  const onLeft = (): number => 8080;

  // Handle success
  const onRight = (n: number): number => n;

  return pipe(number.decode(u), fold(onLeft, onRight));
};

const determineDatabaseUrl = (nodeEnv: string): string => {
  switch (nodeEnv) {
    case 'production':
      return checkString(process.env['DATABASE_URL']);
    case 'development':
      return checkString(process.env['DEV_DATABASE_URL']);
    case 'testing':
      return checkString(process.env['TEST_DATABASE_URL']);
    default:
      return '';
  }
};

export const NODE_ENV = checkString(process.env['NODE_ENV']);
export const DATABASE_URL = determineDatabaseUrl(NODE_ENV);
export const PORT = checkPortNumber(process.env['PORT']);
export const SECRET_JWT_KEY = checkString(process.env['SECRET_JWT_KEY']);
export const CORS_ORIGIN = checkString(process.env['CORS_ORIGIN']);
