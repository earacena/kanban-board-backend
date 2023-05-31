import {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { CardNotFoundError, UnauthorizedActionError } from '../../utils/errors';
import { Card } from '../card/card.types';
import CardModel from '../card/card.model';
import ActivityModel from './activity.model';
import { CreateActivityPayload, Activity } from './activity.types';

const createActivityController = async (
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

    const { cardId, userId, description } = CreateActivityPayload.parse(req.body);

    const cardResult = Card.safeParse(
      await CardModel.findByPk(cardId),
    );

    if (!cardResult.success) {
      throw new CardNotFoundError('card does not exist');
    }

    const card = cardResult.data;

    const isUserIdMatching = req.session.user.id === card.userId;
    if (!isUserIdMatching) {
      throw new UnauthorizedActionError('not authorized to perform this action');
    }

    const newActivity = Activity.parse(
      await ActivityModel.create({
        userId,
        cardId,
        description,
      }),
    );

    res
      .status(201)
      .json(newActivity);
  } catch (err: unknown) {
    next(err);
  }
};

const controllers = {
  createActivityController,
};

export default controllers;
