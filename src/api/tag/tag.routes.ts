import { Router } from 'express';
import tagControllers from './tag.controllers';

const {
  createTagController,
  getTagsByCardIdController,
  deleteTagController,
} = tagControllers;

const tagRouter = Router();

tagRouter.post('/', createTagController);
tagRouter.get('/:cardId', getTagsByCardIdController);
tagRouter.delete('/:tagId', deleteTagController);

export default tagRouter;
