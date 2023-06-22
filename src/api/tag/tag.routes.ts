import { Router } from 'express';
import tagControllers from './tag.controllers';

const {
  createTagController,
  getTagsByUserIdController,
  addCardIdToTagController,
  deleteTagController,
} = tagControllers;

const tagRouter = Router();

tagRouter.post('/', createTagController);
tagRouter.get('/user/:userId', getTagsByUserIdController);
tagRouter.put('/:tagId/card', addCardIdToTagController);
tagRouter.delete('/:tagId', deleteTagController);

export default tagRouter;
