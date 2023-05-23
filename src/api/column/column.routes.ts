import { Router } from 'express';
import columnControllers from './column.controllers';

const columnRouter = Router();

const {
  createColumnController,
  getColumnByIdController,
  getColumnsByUserIdController,
  updateColumnController,
  deleteColumnController,
} = columnControllers;

columnRouter.post('/', createColumnController);
columnRouter.get('/:columnId', getColumnByIdController);
columnRouter.get('/user/:columnId', getColumnsByUserIdController);
columnRouter.put('/:columnId', updateColumnController);
columnRouter.delete('/:columnId', deleteColumnController);

export default columnRouter;
