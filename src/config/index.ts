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

export const NODE_ENV = z.string().parse(process.env['NODE_ENV']);
export const SERVER_PORT = NODE_ENV !== 'testing' ? z.number().parse(Number(process.env['SERVER_PORT'])) : 4000;
export const CORS_ORIGIN = NODE_ENV !== 'testing' ? z.string().parse(process.env['CORS_ORIGIN']) : 'https://localhost:3000';
export const SECRET_SESSION_KEY = z.string().parse(process.env['SECRET_SESSION_KEY']);

let databaseUser = '';
let databasePassword = '';
let databaseHost = '';
let databasePort = 3002;
let databaseName = '';
let databaseUrl = '';

if (NODE_ENV === 'production') {
  // Production environment
  databaseUser = z.string().parse(process.env['PROD_DATABASE_USER']);
  databasePassword = z.string().parse(process.env['PROD_DATABASE_PASSWORD']);
  databaseHost = z.string().parse(process.env['PROD_DATABASE_HOST']);
  databasePort = z.number().parse(Number(process.env['PROD_DATABASE_PORT']));
  databaseName = z.string().parse(process.env['PROD_DATABASE_NAME']);
} else if (NODE_ENV === 'development') {
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
