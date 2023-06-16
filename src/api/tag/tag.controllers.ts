import { NextFunction, Request, Response } from 'express';
import { CardNotFoundError, UnauthorizedActionError, UserNotFoundError } from '../../utils/errors';
import { User } from '../user/user.types';
import UserModel from '../user/user.model';
import CardModel from '../card/card.model';
import TagModel from '../tag/tag.model';
import { Card } from '../card/card.types';
import { CreateTagPayload, DeleteTagByIdParams, GetTagsByCardIdParams, Tag, Tags } from './tag.types';

const createTagController = async (
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
      userId,
      cardId,
      label,
      color,
    } = CreateTagPayload.parse(req.body);

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

    const newTag = Tag.parse(
      await TagModel.create({ cardId, label, color }),
    );

    res.status(201).json({
      success: true,
      data: {
        tag: newTag,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const getTagsByCardIdController = async (
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

    const { cardId } = GetTagsByCardIdParams.parse(req.params);
    const result = Card.safeParse(
      await CardModel.findByPk(cardId),
    );

    if (!result.success) {
      throw new CardNotFoundError('card does not exist');
    }

    const card = result.data;
    const sessionUserId = req.session.user.id;
    if (card.userId !== sessionUserId) {
      throw new UnauthorizedActionError('not authorized to perform this action');
    }

    const tags = Tags.parse(
      await TagModel.findAll({ where: { cardId } }),
    );

    res
      .status(200)
      .json({
        success: true,
        data: {
          tags,
        },
      });
  } catch (err: unknown) {
    next(err);
  }
};

const deleteTagController = async (
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

    const { tagId } = DeleteTagByIdParams.parse(req.params);

    const result = Tag.safeParse(await TagModel.findByPk(tagId));

    if (!result.success) {
      // preserve idempotence
      res.status(200).json({ success: true });
      return;
    }

    const tag = result.data;

    await TagModel.destroy({
      where: {
        id: tag.id,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    next(error);
  }
};

const tagControllers = {
  createTagController,
  getTagsByCardIdController,
  deleteTagController,
};

export default tagControllers;
