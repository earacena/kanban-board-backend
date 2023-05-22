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
boardRouter.get('/:boardId', getBoardByIdController);
boardRouter.get('/user/:userId', getBoardsByUserIdController);
boardRouter.put('/:boardId', updateBoardController);
boardRouter.delete('/:boardId', deleteBoardController);

export default boardRouter;
