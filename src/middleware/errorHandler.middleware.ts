import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err) {
    res.status(500).json({ error: 'internal server error' }).end();
  }

  next(err);
};

export default errorHandler;
