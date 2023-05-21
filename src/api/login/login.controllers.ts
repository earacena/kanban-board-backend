import { Request, Response, NextFunction } from 'express';
import argon2 from 'argon2';
import UserModel from '../user/user.model';
import type { UserType } from '../user/user.types';
import { User } from '../user/user.types';
import { IncorrectPasswordError, SessionError, UserNotFoundError } from '../../utils/errors';
import { UserCredentials, type UserCredentialsType } from './login.types';

const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const credentials: UserCredentialsType = UserCredentials.parse(req.body);
    const result = await UserModel.findOne({ where: { username: credentials.username } });
    if (!result) {
      throw new UserNotFoundError('user does not exist');
    }
    const user: UserType = User.parse(result);

    const isPasswordCorrect = await argon2.verify(user.passwordHash, credentials.password);
    if (!isPasswordCorrect) {
      throw new IncorrectPasswordError('credentials do not match records');
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
    };

    res
      .status(200)
      .send({
        success: true,
        data: {
          user: req.session.user,
        },
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
    req.session.destroy((error: unknown) => {
      if (error) {
        throw new SessionError('session error');
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
