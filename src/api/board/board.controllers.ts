import { NextFunction, Response, Request } from 'express';
import {
  BoardNotFoundError,
  UnauthorizedActionError,
  UserNotFoundError,
} from '../../utils/errors';
import {
  CreateBoardPayload,
  Board,
  GetBoardsByUserIdParams,
  GetBoardByIdParams,
  Boards,
  DeleteBoardByIdParams,
  UpdatableBoardFields,
} from './board.types';
import BoardModel from './board.model';
import UserModel from '../user/user.model';
import { User } from '../user/user.types';

const createBoardController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError(
        'must be logged in to perform this action',
      );
    }

    const { userId, label } = CreateBoardPayload.parse(req.body);
    const result = User.safeParse(await UserModel.findByPk(userId));
    if (!result.success) {
      throw new UserNotFoundError('user does not exist');
    }

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError(
        'not authorized to perform that action',
      );
    }

    const newBoard = Board.parse(await BoardModel.create({ userId, label }));

    res.status(201).json({
      success: true,
      data: {
        board: newBoard,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const getBoardByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError(
        'must be logged in to perform this action',
      );
    }

    const { boardId } = GetBoardByIdParams.parse(req.params);
    const board = Board.parse(await BoardModel.findByPk(boardId));

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === board.userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError(
        'not authorized to perform that action',
      );
    }

    res.status(200).json({
      success: true,
      data: {
        board,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const getBoardsByUserIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError(
        'must be logged in to perform this action',
      );
    }

    const { userId } = GetBoardsByUserIdParams.parse(req.params);

    const result = User.safeParse(await UserModel.findByPk(userId));
    if (!result.success) {
      throw new UserNotFoundError(`user does not exist: ${userId}`);
    }

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError(
        'not authorized to perform that action',
      );
    }

    const boards = Boards.parse(
      await BoardModel.findAll({ where: { userId } }),
    );

    res.status(200).json({
      success: true,
      data: {
        boards,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const updateBoardController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError(
        'must be logged in to perform this action',
      );
    }

    const { boardId } = DeleteBoardByIdParams.parse(req.params);
    const { label } = UpdatableBoardFields.parse(req.body);

    const results = Board.safeParse(await BoardModel.findByPk(boardId));

    if (!results.success) {
      throw new BoardNotFoundError('board does not exist');
    }

    const board = results.data;
    const sessionUserId = req.session.user.id;
    if (board.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    const updateResults = await BoardModel.update(
      { label },
      { where: { id: boardId }, returning: true },
    );

    const updatedBoard = Board.parse(updateResults[1][0]);

    res.status(200).json({
      success: true,
      data: {
        board: updatedBoard,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const deleteBoardController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isUserSessionActive = req.sessionID && req.session.user;
    if (!isUserSessionActive) {
      throw new UnauthorizedActionError(
        'must be logged in to perform this action',
      );
    }

    const { boardId } = DeleteBoardByIdParams.parse(req.params);

    const result = Board.safeParse(await BoardModel.findByPk(boardId));

    if (!result.success) {
      // preserve idempotence
      res.status(200).json({ success: true });
      return;
    }

    const board = result.data;
    const sessionUserId = req.session.user.id;
    if (board.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    await BoardModel.destroy({
      where: {
        id: boardId,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    next(error);
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
