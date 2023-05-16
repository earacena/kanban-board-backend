import { NextFunction, Response, Request } from 'express';

const createBoardController = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200);
  } catch (err: unknown) {
    next(err);
  }
};

const getBoardByIdController = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200);
  } catch (err: unknown) {
    next(err);
  }
};

const getBoardsByUserIdController = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200);
  } catch (err: unknown) {
    next(err);
  }
};

const updateBoardController = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200);
  } catch (err: unknown) {
    next(err);
  }
};

const deleteBoardController = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200);
  } catch (err: unknown) {
    next(err);
  }
};

const boardControllers = {
  createBoardController,
  getBoardByIdController,
  getBoardsByUserIdController,
  updateBoardController,
  deleteBoardController,
};

export default boardControllers;
