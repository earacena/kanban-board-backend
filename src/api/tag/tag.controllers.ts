import { NextFunction, Request, Response } from 'express';
import {
  UnauthorizedActionError, UserNotFoundError, CardNotFoundError, TagNotFoundError,
} from '../../utils/errors';
import { User } from '../user/user.types';
import UserModel from '../user/user.model';
import TagModel from './tag.model';
import {
  AddCardIdToTagParams,
  AddCardIdToTagPayload,
  CreateTagPayload, DeleteTagByIdParams, GetTagsByUserIdParams, Tag, Tags,
} from './tag.types';
import { Card } from '../card/card.types';
import CardModel from '../card/card.model';

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
      await TagModel.create({
        userId,
        cardIds: [cardId],
        label,
        color,
      }),
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

const getTagsByUserIdController = async (
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

    const { userId } = GetTagsByUserIdParams.parse(req.params);
    const result = User.safeParse(
      await UserModel.findByPk(userId),
    );

    if (!result.success) {
      throw new UserNotFoundError('user does not exist');
    }

    const user = result.data;
    const sessionUserId = req.session.user.id;
    if (user.id !== sessionUserId) {
      throw new UnauthorizedActionError('not authorized to perform this action');
    }

    const tags = Tags.parse(
      await TagModel.findAll({ where: { userId } }),
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
    const sessionUserId = req.session.user.id;
    if (tag.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

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

const addCardIdToTagController = async (
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

    const { tagId } = AddCardIdToTagParams.parse(req.params);
    const { cardId } = AddCardIdToTagPayload.parse(req.body);
    const results = Card.safeParse(await CardModel.findByPk(cardId));

    if (!results.success) {
      console.error(results.error);
    }

    if (!results.success) {
      throw new CardNotFoundError('card does not exist');
    }

    const card = results.data;
    const sessionUserId = req.session.user.id;
    if (card.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    const tagResult = Tag.safeParse(await TagModel.findByPk(tagId));

    if (!tagResult.success) {
      throw new TagNotFoundError('tag does not exist');
    }

    const tag = tagResult.data;

    if (tag.userId !== sessionUserId) {
      throw new UnauthorizedActionError(
        'not authorized to perform this action',
      );
    }

    const updateResults = await TagModel.update(
      { cardIds: tag.cardIds.concat(cardId) },
      { where: { id: tag.id }, returning: true },
    );

    const updatedTag = Tag.parse(updateResults[1][0]);

    res.status(200).json({
      success: true,
      data: {
        tag: updatedTag,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};

const tagControllers = {
  createTagController,
  getTagsByUserIdController,
  deleteTagController,
  addCardIdToTagController,
};

export default tagControllers;
