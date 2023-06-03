import { Router } from 'express';
import activityControllers from './activity.controller';

const activityRouter = Router();

const {
  createActivityController,
  getActivitiesByCardIdController,
} = activityControllers;

activityRouter.get('/:cardId', getActivitiesByCardIdController);
activityRouter.post('/', createActivityController);

export default activityRouter;
