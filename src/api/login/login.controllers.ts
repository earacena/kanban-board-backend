import { Request, Response, NextFunction } from 'express';
import { string, type } from 'io-ts';
import argon2 from 'argon2';
import { decodeWith, decodeResponseWith } from '../../utils/decode';
import UserModel from '../user/user.model';
import type { UserType } from '../user/user.types';
import { User } from '../user/user.types';

const UserCredentials = type({
  username: string,
  password: string,
});

const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = decodeWith(UserCredentials)(req.body);
    const user: UserType = decodeResponseWith(User)(
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
      .send({
        user: req.session.user,
      });
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
    req.session.destroy((err: unknown) => console.log('Session unable to be destroyed: ', err));
    res.status(200);
  } catch (error: unknown) {
    next(error);
  }
};

export default {
  loginController,
  logoutController,
};
