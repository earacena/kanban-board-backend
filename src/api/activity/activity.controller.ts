import {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { CardNotFoundError, UnauthorizedActionError } from '../../utils/errors';
import { Card } from '../card/card.types';
import CardModel from '../card/card.model';
import ActivityModel from './activity.model';
import {
  CreateActivityPayload,
  Activity,
  Activities,
  GetActivitiesByCardIdParams,
} from './activity.types';

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

    const {
      cardId, userId, type, description,
    } = CreateActivityPayload.parse(req.body);

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
        type,
        description,
      }),
    );

    res
      .status(201)
      .json({
        success: true,
        data: {
          activity: newActivity,
        },
      });
  } catch (err: unknown) {
    next(err);
  }
};

const getActivitiesByCardIdController = async (
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

    const { cardId } = GetActivitiesByCardIdParams.parse(req.params);

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

    const activities = Activities.parse(
      await ActivityModel.findAll({ where: { cardId } }),
    );

    res
      .status(200)
      .json({
        success: true,
        data: {
          activities,
        },
      });
  } catch (err: unknown) {
    next(err);
  }
};

const controllers = {
  createActivityController,
  getActivitiesByCardIdController,
};

export default controllers;
