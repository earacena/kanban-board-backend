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

const app = express();

// Pre-route middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
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

const PgStore = connectPgSimple(session);
const store = new PgStore({ conString: database.url });

const sessionOptions: SessionOptions = {
  store,
  secret: SECRET_SESSION_KEY,
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: true,
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

// Post-route middleware

// Running the server

const main = async () => {
  await connectToDatabase();
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
      console.log(`http server @ port ${SERVER_PORT}`);
    });
  }
};

export default { main, app };
