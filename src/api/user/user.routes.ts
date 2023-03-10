import express from 'express';
import userControllers from './user.controllers';

const { createUserController } = userControllers;

const userRouter = express.Router();

userRouter.post('/', createUserController);

export default userRouter;
