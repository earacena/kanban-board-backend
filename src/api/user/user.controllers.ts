import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import UserModel from './user.model';
import { User } from './user.types';
import type { UserType } from './user.types';
import { UnauthorizedActionError } from '../../utils/errors';

declare module 'express-session' {
  interface Session {
    user: {
      id: string,
      name: string,
      username: string,
    },
  }
}

const validPassword = z.string().regex(/^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=\D*\d)(?=[^!#$%^&*=+-]*[!#$%^&*=+-])[A-Za-z0-9!#$%^&*=+-]{8,32}$/);

const NewUserCredentials = z.object({
  name: z.string(),
  username: z.string(),
  password: validPassword,
}).strict();

type NewUserCredentialsType = z.infer<typeof NewUserCredentials>;

const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const credentials: NewUserCredentialsType = NewUserCredentials.parse(req.body);
    const passwordHash = await argon2.hash(credentials.password);

    const newUser: UserType = User.parse(
      await UserModel.create({
        name: credentials.name,
        username: credentials.username,
        passwordHash,
      }),
    );

    // Store identifying information in session cookie
    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
    };

    res
      .status(201)
      .json({
        success: true,
        data: {
          user: req.session.user,
        },
      });
  } catch (error: unknown) {
    next(error);
  }
};

const fetchCurrentUserController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.sessionID && req.session.user) {
      res.status(200).json({
        success: true,
        data: {
          user: req.session.user,
        },
      });
      return;
    }

    throw new UnauthorizedActionError('must be logged in to perform this action');
  } catch (error: unknown) {
    next(error);
  }
};

export default {
  createUserController,
  fetchCurrentUserController,
};
