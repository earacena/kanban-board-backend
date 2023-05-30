import { Router } from 'express';
import activityControllers from './activity.controller';

const activityRouter = Router();

const {
  createActivityController,
} = activityControllers;

activityRouter.post('/', createActivityController);

export default activityRouter;
