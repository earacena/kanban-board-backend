import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import UserModel from './user.model';
import { User } from './user.types';
import type { UserType } from './user.types';
import { InvalidCredentialsError } from '../../utils/errors';

declare module 'express-session' {
  interface Session {
    user: {
      id: string,
      name: string,
      username: string,
    },
  }
}

const NewUserCredentials = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
});

type NewUserCredentialsType = z.infer<typeof NewUserCredentials>;

const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let result;
    result = NewUserCredentials.safeParse(req.body);
    let credentials: NewUserCredentialsType;
    if (!result.success) {
      throw new InvalidCredentialsError('Missing or incorrect new user credentials shape in req.body');
    } else {
      credentials = result.data;
    }

    const passwordHash = await argon2.hash(credentials.password);

    let newUser: UserType;
    result = User.safeParse(
      await UserModel.create({
        name: credentials.name,
        username: credentials.username,
        passwordHash,
      }),
    );

    if (!result.success) {
      throw new InvalidCredentialsError('User does not exist due to incorrect credentials');
    } else {
      newUser = result.data;
    }

    // Store identifying information in session cookie
    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
    };

    res.status(201).json({ user: req.session.user });
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
      res.status(200).json({ user: req.session.user });
      return;
    }

    res.status(403);
  } catch (error: unknown) {
    next(error);
  }
};

export default {
  createUserController,
  fetchCurrentUserController,
};
