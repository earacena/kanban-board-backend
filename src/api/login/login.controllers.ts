import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import UserModel from '../user/user.model';
import type { UserType } from '../user/user.types';
import { User } from '../user/user.types';
import { SessionError } from '../../utils/errors';

const UserCredentials = z.object({
  username: z.string(),
  password: z.string(),
});

const SessionErrorObj = z.object({
  name: z.string(),
  message: z.string(),
  stack: z.union([z.string(), z.undefined()]),
});

const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = UserCredentials.parse(req.body);
    const user: UserType = User.parse(
      await UserModel.findOne({ where: { username } }),
    );

    const isPasswordCorrect = await argon2.verify(user.passwordHash, password);
    if (!isPasswordCorrect) {
      res.status(400).json({
        error: 'invalid credentials',
      });

      return;
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
    };

    res
      .status(200)
      .send(req.session.user);
  } catch (error: unknown) {
    next(error);
  }
};

const logoutController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.session.destroy((error: unknown) => {
      if (error) {
        const decoded = SessionErrorObj.parse(error);
        throw new SessionError(decoded.message);
      }
    });
    res.sendStatus(200);
    return;
  } catch (error: unknown) {
    next(error);
  }
};

export default {
  loginController,
  logoutController,
};
