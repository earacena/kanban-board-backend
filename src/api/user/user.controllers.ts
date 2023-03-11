import type { Request, Response, NextFunction } from 'express';
import { type, string } from 'io-ts';
import argon2 from 'argon2';
import { decodeWith } from '../../utils/decode';
import UserModel from './user.model';
import { User } from './user.types';
import type { UserType } from './user.types';

declare module 'express-session' {
  interface Session {
    user: {
      id: number,
      name: string,
      username: string,
    },
  }
}

const NewUserCredentials = type({
  name: string,
  username: string,
  password: string,
});

const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, username, password } = decodeWith(NewUserCredentials)(req.body);
    const passwordHash = await argon2.hash(password);
    console.log(name, username, password);

    const newUser: UserType = decodeWith(User)(
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

export default {
  createUserController,
};
