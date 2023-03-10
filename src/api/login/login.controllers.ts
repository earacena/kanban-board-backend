import { Request, Response, NextFunction } from 'express';
import { string, type } from 'io-ts';
import argon2 from 'argon2';
import { sign as JwtSign } from 'jsonwebtoken';
import { decodeWith, decodeResponseWith } from '../../utils/decode';
import UserModel from '../user/user.model';
import type { UserType } from '../user/user.types';
import { User } from '../user/user.types';
import { SECRET_JWT_KEY } from '../../config';

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

    // Group relevant token data
    const userDetails = {
      id: user.id,
    };

    const token = decodeWith(string)(JwtSign(userDetails, SECRET_JWT_KEY, { expiresIn: '5m' }));

    res.cookie('token', token, { httpOnly: true });

    res
      .status(200)
      .send({
        id: user.id,
        username: user.username,
        name: user.name,
      });
  } catch (error: unknown) {
    next(error);
  }
};

export default { loginController };
