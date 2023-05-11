import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import UserModel from './user.model';
import { User } from './user.types';
import type { UserType } from './user.types';

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

const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, username, password } = NewUserCredentials.parse(req.body);
    const passwordHash = await argon2.hash(password);

    const newUser: UserType = User.parse(
      await UserModel.create({
        name,
        username,
        passwordHash,
      }),
    );

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
