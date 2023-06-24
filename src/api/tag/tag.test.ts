import supertest from 'supertest';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import app from '../../app';
import User from '../user/user.model';
import Tag from './tag.model';
import {
  ApiResponse, ErrorResponse, TagResponse, TagsResponse,
} from '../../app.types';
import { type TagArrayType } from './tag.types';
import Card from '../card/card.model';
import { UserType } from '../user/user.types';
import { CardType } from '../card/card.types';

const agent = supertest.agent(app.app);
const api = supertest(app.app);

jest.mock('sequelize');
jest.mock('argon2');

describe('Tag API', () => {
  const credentials = {
    name: 'Test User',
    username: 'testuser123',
    password: 'testPassword0!',
  };

  const userId = uuidv4();
  const alternativeUserId = uuidv4();

  const cardId = uuidv4();
  const alternativeCardId = uuidv4();

  const mockUser: UserType = {
    id: userId,
    name: 'Test User',
    username: 'testuser123',
    passwordHash: 'passwordhash#',
    dateRegistered: new Date(),
  };

  const mockCard: CardType = {
    id: uuidv4(),
    userId,
    columnId: uuidv4(),
    brief: 'Test brief',
    body: 'Test body',
    color: '#AAAAAA',
    dateCreated: new Date(),
  };

  const tags: TagArrayType = [
    {
      id: uuidv4(),
      userId,
      cardIds: [
        cardId,
      ],
      label: 'Test label 1',
      color: '#333333',
    },
    {
      id: uuidv4(),
      userId: alternativeUserId,
      cardIds: [
        alternativeCardId,
      ],
      label: 'Test label 2',
      color: '#333333',
    },
    {
      id: uuidv4(),
      userId,
      cardIds: [
        cardId,
      ],
      label: 'Test label 3',
      color: '#333333',
    },
    {
      id: uuidv4(),
      userId: alternativeUserId,
      cardIds: [],
      label: 'Test label 4',
      color: '#333333',
    },
    {
      id: uuidv4(),
      userId: uuidv4(),
      cardIds: [],
      label: 'Test label 5',
      color: '#333333',
    },
  ];

  beforeAll((done) => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    void agent
      .post('/login')
      .send({ username: credentials.username, password: credentials.password })
      .expect(200)
      .end((err) => {
        if (err) { done(err); }
        done();
      });
  });

  describe('when getting tags', () => {
    test('retrieves tags by userId (200)', async () => {
      const userTags = tags.filter((t) => t.userId === userId);
      (Tag.findAll as jest.Mock).mockResolvedValueOnce(userTags);

      const response = await agent
        .get(`/api/tags/user/${userId}`)
        .expect(200);

      const responseData = TagsResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data?.tags).toStrictEqual(userTags);
    });

    test('rejects request of tags if userId does not exist (400)', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      const response = await agent
        .get(`/api/tags/user/${uuidv4()}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_credentials',
          value: '',
          path: '',
          message: 'user does not exist',
        },
      ]);
    });

    test('rejects request of tags if there is no valid user session (401)', async () => {
      const response = await api
        .get(`/api/tags/user/${userId}`)
        .expect(401);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toStrictEqual([
        {
          code: 'unauthorized_action',
          value: '',
          path: '',
          message: 'must be logged in to perform this action',
        },
      ]);
    });
  });

  describe('when created tags', () => {
    test('returns a created tag (201)', async () => {
      const newTag = {
        id: uuidv4(),
        userId,
        cardIds: [
          cardId,
        ],
        label: 'new tag',
        color: '#333333',
      };

      (Tag.create as jest.Mock).mockResolvedValueOnce(newTag);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(mockUser);

      const response = await agent
        .post('/api/tags')
        .send({
          userId,
          cardId,
          label: 'new tag',
          color: '#333333',
        })
        .expect(201);

      const responseData = TagResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.tag).toBeDefined();
      expect(responseData.data.tag).toStrictEqual(newTag);
    });

    test('rejects request if given userId does not exist (400)', async () => {
      const newTag = {
        id: uuidv4(),
        userId,
        cardIds: [
          cardId,
        ],
        label: 'new tag',
        color: '#333333',
      };

      (Tag.create as jest.Mock).mockResolvedValueOnce(newTag);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const response = await agent
        .post('/api/tags')
        .send({
          userId: uuidv4(),
          cardId,
          label: 'new tag',
          color: '#333333',
        })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_credentials',
          value: '',
          path: '',
          message: 'user does not exist',
        },
      ]);
    });

    test('rejects request if userId, label, cardId, or color are not supplied (400)', async () => {
      let response = await agent
        .post('/api/tags')
        .send({
          userId,
          cardId: uuidv4(),
          color: '#333333',
        })
        .expect(400);

      let responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('zod');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['label'],
        },
      ]);

      response = await agent
        .post('/api/tags')
        .send({
          label: 'new tag',
        })
        .expect(400);

      responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('zod');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['cardId'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['userId'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['color'],
        },
      ]);

      response = await agent
        .post('/api/tags')
        .send()
        .expect(400);

      responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('zod');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['cardId'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['userId'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['label'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['color'],
        },
      ]);
    });

    test('rejects request if user is not logged in (401)', async () => {
      const response = await api
        .post('/api/tags')
        .send({
          userId,
          cardId,
          label: 'test label',
          color: '#444444',
        })
        .expect(401);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'unauthorized_action',
          value: '',
          path: '',
          message: 'must be logged in to perform this action',
        },
      ]);
    });
  });

  describe('when deleting tags', () => {
    test('deletes a tag (200)', async () => {
      const testTag = tags[0];
      if (testTag) {
        const response = await agent
          .delete(`/api/tags/${testTag.id}`)
          .expect(200);

        const responseData = ApiResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(true);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('returns 200 even if tag does not exist (200)', async () => {
      (Tag.findByPk as jest.Mock).mockResolvedValueOnce(null);

      const response = await agent
        .delete(`/api/tags/${uuidv4()}`)
        .expect(200);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
    });

    test('rejects deletion request if there is no valid user session', async () => {
      const testTag = tags[0];
      if (testTag) {
        const response = await api
          .delete(`/api/tags/${testTag?.id}`)
          .expect(401);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(false);
        expect(responseData.errorType).toBe('base');
        expect(responseData.errors).toStrictEqual([
          {
            code: 'unauthorized_action',
            value: '',
            path: '',
            message: 'must be logged in to perform this action',
          },
        ]);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects deletion request if user did not create tag', async () => {
      const testTag = tags[1];
      (Tag.findByPk as jest.Mock).mockResolvedValueOnce(testTag);

      if (testTag) {
        const response = await agent
          .delete(`/api/tags/${testTag?.id}`)
          .expect(401);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(false);
        expect(responseData.errorType).toBe('base');
        expect(responseData.errors).toStrictEqual([
          {
            code: 'unauthorized_action',
            value: '',
            path: '',
            message: 'not authorized to perform this action',
          },
        ]);
      } else {
        throw new Error('undefined test data');
      }
    });
  });

  describe('when updating tags', () => {
    test('adds a cardId to a tag (200)', async () => {
      const testTag = tags[0];
      const newCardId = uuidv4();
      const updatedTag = { ...testTag, cardIds: testTag?.cardIds.concat(newCardId) };

      (Card.findByPk as jest.Mock).mockResolvedValueOnce(mockCard);
      (Tag.findByPk as jest.Mock).mockResolvedValueOnce(testTag);
      (Tag.update as jest.Mock).mockResolvedValueOnce([[], [updatedTag]]);

      if (testTag) {
        const response = await agent
          .put(`/api/tags/${testTag.id}/card`)
          .send({
            cardId: newCardId,
          })
          .expect(200);

        const responseData = TagResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(true);
        expect(responseData.data.tag).toStrictEqual(updatedTag);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects request to add cardId if card does not exist (400)', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const response = await agent
        .put(`/api/tags/${uuidv4()}/card`)
        .send({
          cardId: uuidv4(),
        })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_request',
          value: '',
          path: '',
          message: 'card does not exist',
        },
      ]);
    });

    test('rejects request to add cardId if tag does not exist (400)', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(mockCard);
      (Tag.findByPk as jest.Mock).mockResolvedValueOnce(null);

      const response = await agent
        .put(`/api/tags/${uuidv4()}/card`)
        .send({
          cardId: uuidv4(),
        })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_request',
          value: '',
          path: '',
          message: 'tag does not exist',
        },
      ]);
    });

    test('rejects request to add cardId if user did not create tag (401)', async () => {
      const testTag = tags[1];
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(mockCard);
      (Tag.findByPk as jest.Mock).mockResolvedValueOnce(testTag);

      if (testTag) {
        const response = await agent
          .put(`/api/tags/${testTag.id}/card`)
          .send({
            cardId,
          })
          .expect(401);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(false);
        expect(responseData.errorType).toBe('base');
        expect(responseData.errors).toStrictEqual([
          {
            code: 'unauthorized_action',
            value: '',
            path: '',
            message: 'not authorized to perform this action',
          },
        ]);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects request to add cardId if user did not create card (401)', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockCard,
        userId: alternativeUserId,
      });

      const response = await agent
        .put(`/api/tags/${uuidv4()}/card`)
        .send({
          cardId,
        });

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toStrictEqual([
        {
          code: 'unauthorized_action',
          value: '',
          path: '',
          message: 'not authorized to perform this action',
        },
      ]);
    });

    test('rejects request to add cardId if there is no valid user session (401)', async () => {
      const testTag = tags[0];

      if (testTag) {
        const response = await api
          .put(`/api/tags/${testTag?.id}/card`)
          .send({
            cardId: uuidv4(),
          })
          .expect(401);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(false);
        expect(responseData.errorType).toBe('base');
        expect(responseData.errors).toStrictEqual([
          {
            code: 'unauthorized_action',
            value: '',
            path: '',
            message: 'must be logged in to perform this action',
          },
        ]);
      } else {
        throw new Error('undefined test data');
      }
    });
  });
});
