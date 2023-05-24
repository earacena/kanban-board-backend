import { Router } from 'express';
import columnControllers from './column.controllers';

const columnRouter = Router();

const {
  createColumnController,
  getColumnByIdController,
  getColumnsByUserIdController,
  getColumnsByBoardIdController,
  updateColumnController,
  deleteColumnController,
} = columnControllers;

columnRouter.post('/', createColumnController);
columnRouter.get('/:columnId', getColumnByIdController);
columnRouter.get('/user/:userId', getColumnsByUserIdController);
columnRouter.get('/board/:boardId', getColumnsByBoardIdController);
columnRouter.put('/:columnId', updateColumnController);
columnRouter.delete('/:columnId', deleteColumnController);

export default columnRouter;
