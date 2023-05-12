import { ErrorRequestHandler } from 'express';
import { InvalidCredentialsError } from '../utils/errors';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof InvalidCredentialsError) {
    res
      .status(400)
      .json({ error: 'invalid credentials' });
  } else {
    res
      .status(500)
      .json({ error: 'internal server error' });
  }

  next(err);
};

export default errorHandler;
