import 'dotenv/config';
import { fold, isLeft } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { Errors, string } from 'io-ts';
import { PathReporter, failure } from 'io-ts/lib/PathReporter';
import { EnvVarPortNumber } from './config.types';

interface DatabaseCredentials {
  /* Name of user in PostgreSQL database. */
  user: string,

  /* Password for given user in PostgreSQL database. */
  password: string,

  /* Host for PostgreSQL database. */
  host: string,

  /* Port of host for PostgreSQL database. */
  port: number,

  /* Name of database within PostgreSQL database. */
  name: string,

  /* Full URL used for connecting to PostgreSQL database */
  url: string,
}

const checkString = (u: unknown): string => {
  // Type check for strings
  // Handle failure
  const onLeft = (errors: Errors) => {
    throw new Error(failure(errors).join('\n'));
  };

  // Handle success
  const onRight = (s: string): string => s;

  return pipe(string.decode(u), fold(onLeft, onRight));
};

const parsePortNumber = (s: string): number => {
  // Parse number strings and convert to numbers
  const decoded = EnvVarPortNumber.decode(s);

  // Could not parse
  if (isLeft(decoded)) {
    throw new Error(PathReporter.report(decoded).join('\n'));
  }

  return decoded.right;
};

export const NODE_ENV = checkString(process.env['NODE_ENV']);
export const SERVER_PORT = parsePortNumber(process.env['SERVER_PORT'] ?? '');
// export const SECRET_JWT_KEY = checkString(process.env['SECRET_JWT_KEY']);
export const CORS_ORIGIN = checkString(process.env['CORS_ORIGIN']);
export const SECRET_SESSION_KEY = checkString(process.env['SECRET_SESSION_KEY']);

// Development environment
const DEV_DATABASE_USER = checkString(process.env['DEV_DATABASE_USER']);
const DEV_DATABASE_PASSWORD = checkString(process.env['DEV_DATABASE_PASSWORD']);
const DEV_DATABASE_HOST = checkString(process.env['DEV_DATABASE_HOST']);
const DEV_DATABASE_PORT = parsePortNumber(process.env['DEV_DATABASE_PORT'] ?? '');
const DEV_DATABASE_NAME = checkString(process.env['DEV_DATABASE_NAME']);
const DEV_DATABASE_URL = `postgres://${DEV_DATABASE_USER}:${DEV_DATABASE_PASSWORD}@${DEV_DATABASE_HOST}:${DEV_DATABASE_PORT}/${DEV_DATABASE_NAME}`;

// Test environment
const TEST_DATABASE_USER = checkString(process.env['TEST_DATABASE_USER']);
const TEST_DATABASE_PASSWORD = checkString(process.env['TEST_DATABASE_PASSWORD']);
const TEST_DATABASE_HOST = checkString(process.env['TEST_DATABASE_HOST']);
const TEST_DATABASE_PORT = parsePortNumber(process.env['TEST_DATABASE_PORT'] ?? '');
const TEST_DATABASE_NAME = checkString(process.env['TEST_DATABASE_NAME']);
const TEST_DATABASE_URL = `postgres://${TEST_DATABASE_USER}:${TEST_DATABASE_PASSWORD}@${TEST_DATABASE_HOST}:${TEST_DATABASE_PORT}/${TEST_DATABASE_NAME}`;

// Production environment
const PROD_DATABASE_USER = checkString(process.env['PROD_DATABASE_USER']);
const PROD_DATABASE_PASSWORD = checkString(process.env['PROD_DATABASE_PASSWORD']);
const PROD_DATABASE_HOST = checkString(process.env['PROD_DATABASE_HOST']);
const PROD_DATABASE_PORT = parsePortNumber(process.env['PROD_DATABASE_PORT'] ?? '');
const PROD_DATABASE_NAME = checkString(process.env['PROD_DATABASE_NAME']);
const PROD_DATABASE_URL = `postgres://${PROD_DATABASE_USER}:${PROD_DATABASE_PASSWORD}@${PROD_DATABASE_HOST}:${PROD_DATABASE_PORT}/${PROD_DATABASE_NAME}`;

const determineDatabaseCredentials = (nodeEnv: string): DatabaseCredentials => {
  switch (nodeEnv) {
    case 'production':
      return {
        user: PROD_DATABASE_USER,
        password: PROD_DATABASE_PASSWORD,
        host: PROD_DATABASE_HOST,
        port: PROD_DATABASE_PORT,
        name: PROD_DATABASE_NAME,
        url: PROD_DATABASE_URL,
      };
    case 'development':
      return {
        user: DEV_DATABASE_USER,
        password: DEV_DATABASE_PASSWORD,
        host: DEV_DATABASE_HOST,
        port: DEV_DATABASE_PORT,
        name: DEV_DATABASE_NAME,
        url: DEV_DATABASE_URL,
      };
    case 'testing':
      return {
        user: TEST_DATABASE_USER,
        password: TEST_DATABASE_PASSWORD,
        host: TEST_DATABASE_HOST,
        port: TEST_DATABASE_PORT,
        name: TEST_DATABASE_NAME,
        url: TEST_DATABASE_URL,
      };
    default:
      throw new Error(`unknown environment: ${nodeEnv}`);
  }
};

// Current database credentials based on node environment
export const database: DatabaseCredentials = determineDatabaseCredentials(NODE_ENV);
