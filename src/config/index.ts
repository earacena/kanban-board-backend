import 'dotenv/config';

import { z } from 'zod';

interface DatabaseCredentials {
  user: string,
  password: string,
  host: string,
  port: number,
  name: string,
  url: string,
}

let nodeEnv = z.string().parse(process.env['NODE_ENV']);
let serverPort = 3001;
let corsOrigin = 'https://localhost:3000';
let secretSessionKey = 'default secret key';

let databaseUser = '';
let databasePassword = '';
let databaseHost = '';
let databasePort = 3002;
let databaseName = '';
let databaseUrl = '';

if (!nodeEnv || nodeEnv === undefined || nodeEnv !== 'testing') {
  nodeEnv = z.string().parse(process.env['NODE_ENV']);
  serverPort = z.coerce.number().parse(Number(process.env['SERVER_PORT']));
  corsOrigin = z.string().parse(process.env['CORS_ORIGIN']);
  secretSessionKey = z.string().parse(process.env['SECRET_SESSION_KEY']);
}

if (nodeEnv === 'production') {
  // Production environment
  databaseUser = z.string().parse(process.env['PROD_DATABASE_USER']);
  databasePassword = z.string().parse(process.env['PROD_DATABASE_PASSWORD']);
  databaseHost = z.string().parse(process.env['PROD_DATABASE_HOST']);
  databasePort = z.number().parse(Number(process.env['PROD_DATABASE_PORT']));
  databaseName = z.string().parse(process.env['PROD_DATABASE_NAME']);
} else if (nodeEnv === 'development') {
  // Development environment
  databaseUser = z.string().parse(process.env['DEV_DATABASE_USER']);
  databasePassword = z.string().parse(process.env['DEV_DATABASE_PASSWORD']);
  databaseHost = z.string().parse(process.env['DEV_DATABASE_HOST']);
  databasePort = z.number().parse(Number(process.env['DEV_DATABASE_PORT']));
  databaseName = z.string().parse(process.env['DEV_DATABASE_NAME']);
}

databaseUrl = `postgres://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}`;

// Current database credentials based on node environment
export const database: DatabaseCredentials = {
  user: databaseUser,
  password: databasePassword,
  host: databaseHost,
  port: databasePort,
  name: databaseName,
  url: databaseUrl,
};

export const NODE_ENV = nodeEnv;
export const SERVER_PORT = serverPort;
export const CORS_ORIGIN = corsOrigin;
export const SECRET_SESSION_KEY = secretSessionKey;
