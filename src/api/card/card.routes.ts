import { Router } from 'express';
import cardControllers from './card.controllers';

const {
  createCardController,
  getCardByIdController,
  getCardsByColumnIdController,
  getCardsByUserIdController,
  deleteCardController,
  deleteCardsByColumnIdController,
  updateCardController,
} = cardControllers;

const cardRouter = Router();

cardRouter.get('/:cardId', getCardByIdController);
cardRouter.get('/column/:columnId', getCardsByColumnIdController);
cardRouter.get('/user/:userId', getCardsByUserIdController);
cardRouter.post('/', createCardController);
cardRouter.delete('/:cardId', deleteCardController);
cardRouter.delete('/column/:columnId', deleteCardsByColumnIdController);
cardRouter.put('/:cardId', updateCardController);

export default cardRouter;
