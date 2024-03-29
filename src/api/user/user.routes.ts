import express from 'express';
import userControllers from './user.controllers';

const {
  createUserController,
  fetchCurrentUserController,
} = userControllers;

const userRouter = express.Router();

userRouter.post('/', createUserController);
userRouter.get('/fetch-user', fetchCurrentUserController);

export default userRouter;
