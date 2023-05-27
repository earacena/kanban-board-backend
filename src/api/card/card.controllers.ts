import { Request, Response, NextFunction } from 'express';
import {
  CardNotFoundError,
  ColumnNotFoundError,
  UnauthorizedActionError,
  UserNotFoundError,
} from '../../utils/errors';
import {
  Card,
  Cards,
  CreateCardPayload,
  DeleteCardByIdParams,
  UpdateCardByIdParams,
  DeleteCardsByColumnIdParams,
  GetCardByIdParams,
  GetCardsByColumnIdParams,
  UpdatableCardFields,
} from './card.types';
import { User } from '../user/user.types';
import UserModel from '../user/user.model';
import CardModel from './card.model';
import ColumnModel from '../column/column.model';
import { Column } from '../column/column.types';

const createCardController = async (
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

    const newCardDetails = CreateCardPayload.parse(req.body);

    const result = User.safeParse(
      await UserModel.findByPk(newCardDetails.userId),
    );
    if (!result.success) {
      throw new UserNotFoundError('user does not exist');
    }

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === newCardDetails.userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError(
        'not authorized to perform that action',
      );
    }

    const newCard = Card.parse(await CardModel.create({ ...newCardDetails }));

    res.status(201).json({
      success: true,
      data: {
        card: newCard,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const getCardByIdController = async (
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

    const { cardId } = GetCardByIdParams.parse(req.params);
    const result = Card.safeParse(await CardModel.findByPk(cardId));

    if (!result.success) {
      throw new CardNotFoundError('card does not exist');
    }

    const card = result.data;

    const sessionUserId = req.session.user.id;
    const isUserAuthenticated = sessionUserId === card.userId;
    if (!isUserAuthenticated) {
      throw new UnauthorizedActionError(
        'not authorized to perform that action',
      );
    }

    res.status(200).json({
      success: true,
      data: {
        card,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const getCardsByColumnIdController = async (
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

    const { columnId } = GetCardsByColumnIdParams.parse(req.params);
    const result = Column.safeParse(await ColumnModel.findByPk(columnId));

    if (!result.success) {
      throw new ColumnNotFoundError('column does not exist');
    }

    const column = result.data;
    const sessionUserId = req.session.user.id;
    if (column.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    const cards = Cards.parse(await CardModel.findAll({ where: { columnId } }));

    res
      .status(200)
      .json({
        success: true,
        data: {
          cards,
        },
      });
  } catch (err: unknown) {
    next(err);
  }
};

const updateCardController = async (
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

    const { cardId } = UpdateCardByIdParams.parse(req.params);
    const updates = UpdatableCardFields.parse(req.body);

    const cardResult = Card.safeParse(
      await CardModel.findByPk(cardId),
    );

    if (!cardResult.success) {
      throw new CardNotFoundError('card does not exist');
    }

    const card = cardResult.data;
    const columnResult = Column.safeParse(await ColumnModel.findByPk(card.columnId));

    if (!columnResult.success) {
      throw new ColumnNotFoundError('column does not exist');
    }

    const column = columnResult.data;
    const sessionUserId = req.session.user.id;
    if (column.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    const updateResults = await CardModel.update(
      { ...updates },
      { where: { id: cardId }, returning: true },
    );

    const updatedCard = Card.parse(updateResults[1][0]);

    res.status(200).json({
      success: true,
      data: {
        card: updatedCard,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const deleteCardController = async (
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

    const { cardId } = DeleteCardByIdParams.parse(req.params);

    const result = Card.safeParse(await CardModel.findByPk(cardId));

    if (!result.success) {
      // preserve idempotence
      res.status(200).json({ success: true });
      return;
    }

    const card = result.data;
    const sessionUserId = req.session.user.id;
    if (card.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    await CardModel.destroy({
      where: {
        id: cardId,
      },
    });

    res.status(200).json({ success: true });
  } catch (err: unknown) {
    next(err);
  }
};

const deleteCardsByColumnIdController = async (
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

    const { columnId } = DeleteCardsByColumnIdParams.parse(req.params);

    const result = Cards.safeParse(
      await CardModel.findAll({ where: { columnId } }),
    );

    if (!result.success) {
      // preserve idempotence
      res.status(200).json({ success: true });
      return;
    }

    const cards = result.data;
    const sessionUserId = req.session.user.id;
    const card = cards[0];

    if (card === undefined || card.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    await CardModel.destroy({
      where: {
        columnId,
      },
    });

    res.status(200).json({ success: true });
  } catch (err: unknown) {
    next(err);
  }
};

const controllers = {
  createCardController,
  getCardByIdController,
  getCardsByColumnIdController,
  updateCardController,
  deleteCardController,
  deleteCardsByColumnIdController,
};

export default controllers;
