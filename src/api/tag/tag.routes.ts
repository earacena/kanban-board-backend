import { Router } from 'express';
import tagControllers from './tag.controllers';

const {
  createTagController,
  getTagsByUserIdController,
  deleteTagController,
} = tagControllers;

const tagRouter = Router();

tagRouter.post('/', createTagController);
tagRouter.get('/user/:userId', getTagsByUserIdController);
tagRouter.delete('/:tagId', deleteTagController);

export default tagRouter;
