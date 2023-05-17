import { NextFunction, Response, Request } from 'express';
import { UnauthorizedActionError } from '../../utils/errors';
import { CreateBoardPayload, Board, getBoardsByUserIdParams } from './board.types';
import BoardModel from './board.model';

const createBoardController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError('must be logged in to perform this action');
    }

    const { userId, label } = CreateBoardPayload.parse(req.body);

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError('not authorized to perform that action');
    }

    const newBoard = Board.parse(
      await BoardModel.create({ userId, label }),
    );

    res
      .status(201)
      .json(newBoard);
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

const getBoardsByUserIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res
      .status(200);
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
