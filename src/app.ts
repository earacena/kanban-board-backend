import express from 'express';
import fs from 'fs';
import https from 'https';
import session, { SessionOptions } from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import { Client } from 'pg';
import morgan from 'morgan';
import loginRouter from './api/login/login.routes';
import {
  CORS_ORIGIN,
  SECRET_SESSION_KEY,
  SERVER_PORT,
  database,
  NODE_ENV,
} from './config';
import userRouter from './api/user/user.routes';
import { connectToDatabase } from './utils/db';
import errorHandler from './middleware/errorHandler.middleware';
import boardRouter from './api/board/board.routes';
import columnRouter from './api/column/column.routes';
import cardRouter from './api/card/card.routes';
import activityRouter from './api/activity/activity.routes';
import tagRouter from './api/tag/tag.routes';

const app = express();

// Pre-route middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'DELETE', 'HEAD'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));

const databaseConn = {
  user: database.user,
  password: database.password,
  host: database.host,
  port: database.port,
  database: database.name,
  connectionString: database.url,
};

const client = new Client(databaseConn);
// eslint-disable-next-line no-void
if (NODE_ENV !== 'testing') {
  void client.connect();
}

let PgStore: typeof connectPgSimple.PGStore;
let store;
if (NODE_ENV !== 'testing') {
  PgStore = connectPgSimple(session);
  store = new PgStore({ conString: database.url });
}

const sessionOptions: SessionOptions = {
  store: NODE_ENV !== 'testing' ? store : undefined,
  secret: SECRET_SESSION_KEY,
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: NODE_ENV !== 'testing',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24,
  },
};

if (NODE_ENV === 'production') {
  // trust first proxy
  app.set('trust proxy', 1);
}

app.use(session(sessionOptions));

// Routes
app.use('/', loginRouter);
app.use('/api/users', userRouter);
app.use('/api/boards', boardRouter);
app.use('/api/columns', columnRouter);
app.use('/api/cards', cardRouter);
app.use('/api/activities', activityRouter);
app.use('/api/tags', tagRouter);

// Post-route middleware
app.use(errorHandler);

// Running the server
const main = async () => {
  if (NODE_ENV !== 'testing') {
    await connectToDatabase();
  }

  if (NODE_ENV === 'development') {
    const options = {
      key: fs.readFileSync('.dev/localhost-key.pem'),
      cert: fs.readFileSync('.dev/localhost.pem'),
    };
    https.createServer(options, app).listen(SERVER_PORT, () => {
      console.log(`https server @ port ${SERVER_PORT}`);
    });
  }

  if (NODE_ENV === 'production') {
    app.listen(SERVER_PORT, () => {
      console.log(`HTTP server @ port ${SERVER_PORT}`);
      console.log(`Node environment: ${NODE_ENV}`);
      console.log(`Using database @ ${database.host}:${database.port}/${database.name}`);
    });
  }
};

export default { main, app };
