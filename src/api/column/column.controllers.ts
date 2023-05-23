import { Request, Response, NextFunction } from 'express';
import {
  BoardNotFoundError,
  ColumnNotFoundError,
  UnauthorizedActionError,
  UserNotFoundError,
} from '../../utils/errors';
import ColumnModel from './column.model';
import {
  Column,
  Columns,
  CreateColumnPayload,
  DeleteColumnByIdParams,
  GetColumnByBoardIdParams,
  GetColumnByIdParams,
  GetColumnsByUserIdParams,
  UpdatableColumnFields,
} from './column.types';
import { User } from '../user/user.types';
import UserModel from '../user/user.model';
import BoardModel from '../board/board.model';
import { Board } from '../board/board.types';

const createColumnController = async (
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

    const { userId, label, boardId } = CreateColumnPayload.parse(req.body);

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

    const newColumn = Column.parse(
      await ColumnModel.create({ userId, label, boardId }),
    );

    res.status(201).json({
      success: true,
      data: {
        column: newColumn,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const getColumnByIdController = async (
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

    const { columnId } = GetColumnByIdParams.parse(req.params);
    const column = Column.parse(await ColumnModel.findByPk(columnId));

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === column.userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError(
        'not authorized to perform that action',
      );
    }

    res.status(200).json({
      success: true,
      data: {
        column,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const getColumnsByBoardIdController = async (
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

    const { boardId } = GetColumnByBoardIdParams.parse(req.params);
    const result = Board.safeParse(
      await BoardModel.findByPk(boardId),
    );

    if (!result.success) {
      throw new BoardNotFoundError('board does not exist');
    }

    const board = result.data;
    const sessionUserId = req.session.user.id;
    if (board.userId !== sessionUserId) {
      throw new UnauthorizedActionError('not authorized to perform this action');
    }

    const columns = Columns.parse(
      await ColumnModel.findAll({ where: { boardId } }),
    );

    res
      .status(200)
      .json({
        success: true,
        data: {
          columns,
        },
      });
  } catch (err: unknown) {
    next(err);
  }
};

const getColumnsByUserIdController = async (
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

    const { userId } = GetColumnsByUserIdParams.parse(req.params);

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

    const columns = Columns.parse(
      await ColumnModel.findAll({ where: { userId } }),
    );

    res.status(200).json({
      success: true,
      data: {
        columns,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const updateColumnController = async (
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

    const { columnId } = DeleteColumnByIdParams.parse(req.params);
    const { label } = UpdatableColumnFields.parse(req.body);

    const results = Column.safeParse(await ColumnModel.findByPk(columnId));

    if (!results.success) {
      throw new ColumnNotFoundError('column does not exist');
    }

    const column = results.data;
    const sessionUserId = req.session.user.id;
    if (column.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    const updateResults = await ColumnModel.update(
      { label },
      { where: { id: columnId }, returning: true },
    );

    const updatedColumn = Column.parse(updateResults[1][0]);

    res.status(200).json({
      success: true,
      data: {
        column: updatedColumn,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const deleteColumnController = async (
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

    const { columnId } = DeleteColumnByIdParams.parse(req.params);

    const result = Column.safeParse(await ColumnModel.findByPk(columnId));

    if (!result.success) {
      // preserve idempotence
      res.status(200).json({ success: true });
      return;
    }

    const column = result.data;
    const sessionUserId = req.session.user.id;
    if (column.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    await ColumnModel.destroy({
      where: {
        id: columnId,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    next(error);
  }
};

const controllers = {
  getColumnByIdController,
  getColumnsByUserIdController,
  getColumnsByBoardIdController,
  createColumnController,
  updateColumnController,
  deleteColumnController,
};

export default controllers;
