import { ErrorRequestHandler } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { ZodError } from 'zod';
import { IncorrectPasswordError } from '../utils/errors';

interface BaseErrorPayload {
  code: string | null,
  path?: string | (string | number)[] | null,
  value?: string | null,
  message: string,
}

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  const errors: BaseErrorPayload[] = [];
  if (err instanceof ZodError) {
    err.issues.forEach((issue) => {
      errors.push({
        code: issue.code,
        path: issue.path,
        message: issue.message,
      });
    });

    res
      .status(400)
      .json({
        success: false,
        errorType: 'zod',
        errors,
      });
  } else if (err instanceof UniqueConstraintError || err instanceof ValidationError) {
    err.errors.forEach((e) => {
      errors.push({
        code: e.type ?? 'validation_error',
        path: e.path,
        value: e.value,
        message: e.message,
      });
    });

    res
      .status(400)
      .json({
        success: false,
        errorType: 'sequelize',
        errors,
      });
  } else if (err instanceof IncorrectPasswordError) {
    res
      .status(400)
      .json({
        success: false,
        errorType: 'base',
        errors: [
          {
            code: 'incorrect_password',
            message: 'credentials do not match records',
          },
        ],
      });
  } else {
    res
      .status(500)
      .json({
        success: false,
        errorType: 'base',
        errors:
        [
          {
            code: 'unknown error',
            message: 'internal server error',
          },
        ],
      });
  }

  next(err);
};

export default errorHandler;
