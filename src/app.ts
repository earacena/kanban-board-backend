import express from 'express';
import session from 'express-session';
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
void client.connect();

const PgStore = connectPgSimple(session);
const store = new PgStore({ conString: database.url });

app.use(
  session({
    store,
    secret: SECRET_SESSION_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: false,
      sameSite: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// Routes
app.use('/', loginRouter);
app.use('/api/users', userRouter);

// Post-route middleware

const main = async () => {
  await connectToDatabase();
  app.listen(SERVER_PORT, () => {
    console.log(`Server @ port ${SERVER_PORT}`);
  });
};

export default { main, app };
