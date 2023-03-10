import express from 'express';
import loginControllers from './login.controllers';

const { loginController } = loginControllers;

const loginRouter = express.Router();

loginRouter.post('/', loginController);

export default loginRouter;
