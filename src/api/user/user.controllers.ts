import type { Request, Response, NextFunction } from 'express';
import t from 'io-ts';
import argon2 from 'argon2';
import { decodeWith, decodeResponseWith } from '../../utils/decode';
import UserModel from './user.model';
import { User } from './user.types';
import type { UserType } from './user.types';

const NewUserCredentials = t.type({
  name: t.string,
  username: t.string,
  password: t.string,
});

const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, username, password } = decodeWith(NewUserCredentials)(req.body);
    const passwordHash = await argon2.hash(password);
    const newUser: UserType = decodeResponseWith(User)(
      await UserModel.create({
        name,
        username,
        passwordHash,
      }),
    );

    res.status(201).json({ name: newUser.name, username: newUser.username });
  } catch (error: unknown) {
    next(error);
  }
};

export default {
  createUserController,
};
