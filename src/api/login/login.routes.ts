import express from 'express';
import loginControllers from './login.controllers';

const { loginController, logoutController } = loginControllers;

const loginRouter = express.Router();

loginRouter.post('/login', loginController);
loginRouter.post('/logout', logoutController);

export default loginRouter;
