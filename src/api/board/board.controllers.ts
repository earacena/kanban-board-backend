import { NextFunction, Response, Request } from 'express';
import { UnauthorizedActionError, UserNotFoundError } from '../../utils/errors';
import {
  CreateBoardPayload, Board, GetBoardsByUserIdParams, GetBoardByIdParams, UpdateBoardParams, Boards,
} from './board.types';
import BoardModel from './board.model';
import UserModel from '../user/user.model';
import { User } from '../user/user.types';

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
      .json({
        success: true,
        data: newBoard,
      });
  } catch (err: unknown) {
    next(err);
  }
};

const getBoardByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError('must be logged in to perform this action');
    }

    const { boardId } = GetBoardByIdParams.parse(req.params);
    const board = Board.parse(
      await BoardModel.findByPk(boardId),
    );

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === board.userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError('not authorized to perform that action');
    }

    res
      .status(200)
      .json({
        success: true,
        data: {
          board,
        },
      });
  } catch (err: unknown) {
    next(err);
  }
};

const getBoardsByUserIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError('must be logged in to perform this action');
    }

    const { userId } = GetBoardsByUserIdParams.parse(req.params);

    const result = User.safeParse(await UserModel.findByPk(userId));
    if (!result.success) {
      throw new UserNotFoundError(`user does not exist: ${userId}`);
    }

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError('not authorized to perform that action');
    }

    const boards = Boards.parse(
      await BoardModel.findAll({ where: { userId } }),
    );

    res
      .status(200)
      .json({
        success: true,
        data: {
          boards,
        },
      });
  } catch (err: unknown) {
    next(err);
  }
};

const updateBoardController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError('must be logged in to perform this action');
    }

    const { boardId, label } = UpdateBoardParams.parse(req.params);

    const results = await BoardModel.update(
      { label },
      { where: { id: boardId }, returning: true },
    );

    const updatedBoard = Board.parse(results[1][0]);

    res
      .status(200)
      .json({
        success: true,
        data: {
          board: updatedBoard,
        },
      });
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
