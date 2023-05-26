import { Router } from 'express';
import cardControllers from './card.controllers';

const {
  createCardController,
  getCardByIdController,
  getCardsByColumnIdController,
  deleteCardController,
  deleteCardsByColumnIdController,
  updateCardController,
} = cardControllers;

const cardRouter = Router();

cardRouter.get('/:cardId', getCardByIdController);
cardRouter.get('/column/:columnId', getCardsByColumnIdController);
cardRouter.post('/', createCardController);
cardRouter.delete('/:cardId', deleteCardController);
cardRouter.delete('/:columnId', deleteCardsByColumnIdController);
cardRouter.put('/:cardId', updateCardController);

export default cardRouter;
