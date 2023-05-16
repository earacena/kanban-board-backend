import { Router } from 'express';
import boardControllers from './board.controllers';

const {
  createBoardController,
  getBoardByIdController,
  getBoardsByUserIdController,
  updateBoardController,
  deleteBoardController,
} = boardControllers;

const boardRouter = Router();

boardRouter.post('/', createBoardController);
boardRouter.get('/:id', getBoardByIdController);
boardRouter.get('/:userId', getBoardsByUserIdController);
boardRouter.put('/', updateBoardController);
boardRouter.post('/', deleteBoardController);

export default boardRouter;
