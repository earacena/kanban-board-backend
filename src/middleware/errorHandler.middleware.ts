import { ErrorRequestHandler } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { ZodError } from 'zod';
import {
  BoardNotFoundError,
  CardNotFoundError,
  ColumnNotFoundError,
  IncorrectPasswordError,
  SessionError,
  TagNotFoundError,
  UnauthorizedActionError,
  UserNotFoundError,
} from '../utils/errors';

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
  } else if (err instanceof IncorrectPasswordError || err instanceof UserNotFoundError) {
    res
      .status(400)
      .json({
        success: false,
        errorType: 'base',
        errors: [
          {
            code: 'invalid_credentials',
            message: err.message,
            path: '',
            value: '',
          },
        ],
      });
  } else if (err instanceof UnauthorizedActionError) {
    res
      .status(401)
      .json({
        success: false,
        errorType: 'base',
        errors: [
          {
            code: 'unauthorized_action',
            message: err.message,
            path: '',
            value: '',
          },
        ],
      });
  } else if (err instanceof SessionError) {
    res
      .status(400)
      .json({
        success: false,
        errorType: 'base',
        errors: [
          {
            code: 'session_error',
            message: err.message,
            path: '',
            value: '',
          },
        ],
      });
  } else if (
    err instanceof BoardNotFoundError
    || err instanceof ColumnNotFoundError
    || err instanceof CardNotFoundError
    || err instanceof TagNotFoundError
  ) {
    res
      .status(400)
      .json({
        success: false,
        errorType: 'base',
        errors: [
          {
            code: 'invalid_request',
            message: err.message,
            path: '',
            value: '',
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
