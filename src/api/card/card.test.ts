import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import app from '../../app';
import { CardArrayType } from './card.types';
import {
  ApiResponse, CardResponse, CardsResponse, ErrorResponse,
} from '../../app.types';
import User from '../user/user.model';
import Card from './card.model';
import Column from '../column/column.model';

const agent = supertest.agent(app.app);
const api = supertest(app.app);

jest.mock('sequelize');
jest.mock('argon2');
jest.mock('./card.model');
jest.mock('../user/user.model');
jest.mock('../column/column.model');

describe('Card API', () => {
  const credentials = {
    name: 'Test User',
    username: 'testuser123',
    password: 'testPassword0!',
  };

  const userId = uuidv4();
  const alternativeUserId = uuidv4();

  const boardId = uuidv4();
  const columnId = uuidv4();
  const alternativeColumnId = uuidv4();

  const mockUser = {
    id: userId,
    name: 'Test User',
    username: 'testuser123',
    passwordHash: 'passwordhash#',
    dateRegistered: new Date(),
  };

  const mockColumn = {
    id: columnId,
    userId,
    boardId,
    label: 'column label',
    dateCreated: new Date(),
  };

  const cards: CardArrayType = [
    {
      id: uuidv4(),
      userId,
      columnId,
      brief: 'Test label 1',
      body: 'Test body 1',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId: alternativeUserId,
      columnId: alternativeColumnId,
      brief: 'Test brief 2',
      body: 'Test body 1',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId,
      columnId,
      brief: 'Test brief 3',
      body: 'Test body 2',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId: alternativeUserId,
      columnId: alternativeColumnId,
      brief: 'Test brief 4',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId,
      columnId: uuidv4(),
      brief: 'Test brief 5',
      dateCreated: new Date(),
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

  describe('when getting cards', () => {
    test('retrieves card by id (200)', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(cards[0]);

      const testCard = cards[0];
      if (testCard) {
        const response = await agent
          .get(`/api/cards/${testCard?.id}`)
          .expect(200);

        console.log(JSON.parse(response.text));
        const responseData = CardResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBeDefined();
        expect(responseData.success).toBe(true);
        expect(responseData.data).toBeDefined();
        expect(responseData.data?.card).toStrictEqual(cards[0]);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('retrieves cards by columnId (200)', async () => {
      const userCards = cards.filter((c) => c.columnId === columnId);
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(mockColumn);
      (Card.findAll as jest.Mock).mockResolvedValueOnce(userCards);

      const response = await agent
        .get(`/api/cards/column/${columnId}`)
        .expect(200);

      const responseData = CardsResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data?.cards).toStrictEqual(userCards);
    });

    test('rejects retrieving cards by columnId if user did not create column (401)', async () => {
      const userCards = cards.filter((c) => c.columnId === alternativeColumnId);
      (Column.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockColumn,
        userId: alternativeUserId,
      });
      (Card.findAll as jest.Mock).mockResolvedValueOnce(userCards);

      const response = await agent
        .get(`/api/cards/column/${columnId}`)
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
    });

    test('rejects card fetch request by id if there is no valid user session (401)', async () => {
      const testCard = cards[0];
      if (testCard) {
        const response = await api
          .get(`/api/cards/${testCard.id}`)
          .expect(401);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBeDefined();
        expect(responseData.success).toBe(false);
        expect(responseData.errors).toBeDefined();
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

    test('rejects card fetch request by columnId if there is no valid user session (401)', async () => {
      const testCard = cards[0];
      if (testCard) {
        const response = await api
          .get(`/api/cards/column/${testCard.columnId}`)
          .expect(401);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBeDefined();
        expect(responseData.success).toBe(false);
        expect(responseData.errors).toBeDefined();
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

    test('rejects card fetch request by id if not the user who created it (401)', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(cards[1]);
      const testCard = cards[1];
      if (testCard) {
        const response = await agent
          .get(`/api/cards/${testCard.id}`);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        console.log(responseData.errors);
        expect(responseData.success).toBeDefined();
        expect(responseData.success).toBe(false);
        expect(responseData.errors).toBeDefined();
        expect(responseData.errors).toStrictEqual([
          {
            code: 'unauthorized_action',
            value: '',
            path: '',
            message: 'not authorized to perform that action',
          },
        ]);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects request if card does not exist (400)', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const response = await agent
        .get(`/api/cards/${uuidv4()}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_request',
          value: '',
          path: '',
          message: 'card does not exist',
        },
      ]);
    });

    test('rejects request of cards if columnId does not exist (400)', async () => {
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(null);
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      const response = await agent
        .get(`/api/cards/column/${uuidv4()}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_request',
          value: '',
          path: '',
          message: 'column does not exist',
        },
      ]);
    });
  });

  describe('when creating cards', () => {
    test('returns a created card (201)', async () => {
      const newCard = {
        id: uuidv4(),
        userId,
        columnId,
        brief: 'new card brief',
        body: 'new card body',
        dateCreated: new Date(),
      };

      (Card.create as jest.Mock).mockResolvedValueOnce(newCard);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(mockUser);
      const response = await agent
        .post('/api/cards')
        .send({
          userId,
          columnId,
          brief: 'new card brief',
          body: 'new card body',
        })
        .expect(201);

      const responseData = CardResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.card).toBeDefined();
      expect(responseData.data.card).toStrictEqual(newCard);
    });

    test('rejects request if given userId does not exist (400)', async () => {
      const newCard = {
        id: uuidv4(),
        userId,
        columnId,
        brief: 'new card brief',
        body: 'new card body',
        dateCreated: new Date(),
      };

      (Card.create as jest.Mock).mockResolvedValueOnce(newCard);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const response = await agent
        .post('/api/cards')
        .send({
          userId: uuidv4(),
          columnId,
          brief: 'new card brief',
          body: 'new card body',
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

    test('rejects request if columnId and/or brief and/or userId are not supplied (400)', async () => {
      let response = await agent
        .post('/api/cards')
        .send({
          userId,
          columnId: uuidv4(),
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
          path: ['brief'],
        },
      ]);

      response = await agent
        .post('/api/cards')
        .send({
          brief: 'new card brief',
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
          path: ['userId'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['columnId'],
        },
      ]);

      response = await agent
        .post('/api/cards')
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
          path: ['userId'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['columnId'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['brief'],
        },
      ]);
    });

    test('rejects request if session userId and given userId do not match (401)', async () => {
      (User.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        id: alternativeUserId,
      });

      const response = await agent
        .post('/api/cards')
        .send({
          userId: alternativeUserId,
          columnId: uuidv4(),
          brief: 'test card brief',
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
          message: 'not authorized to perform that action',
        },
      ]);
    });

    test('rejects request if user is not logged in (401)', async () => {
      const response = await api
        .post('/api/cards')
        .send({
          userId,
          columnId,
          brief: 'test brief',
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

  describe('when deleting cards', () => {
    test('deletes a card (200)', async () => {
      const testCard = cards[0];
      if (testCard) {
        const response = await agent
          .delete(`/api/cards/${testCard.id}`)
          .expect(200);

        const responseData = ApiResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(true);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('deletes cards by column id (200)', async () => {
      const columnCards = cards.filter((c) => c.columnId === columnId);
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(mockColumn);
      (Card.findAll as jest.Mock).mockResolvedValueOnce(columnCards);

      const response = await agent
        .delete(`/api/cards/column/${columnId}`);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
    });

    test('rejects deletion of cards by column if user did not create column', async () => {
      (Column.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockColumn,
        userId: alternativeUserId,
      });

      const response = await agent
        .delete(`/api/cards/column/${alternativeUserId}`)
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
    });

    test('returns 200 even if card does not exist (200)', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(null);

      const response = await agent
        .delete(`/api/cards/${uuidv4()}`)
        .expect(200);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
    });

    test('rejects deletion request if there is no valid user session', async () => {
      const testCard = cards[0];
      if (testCard) {
        const response = await api
          .delete(`/api/cards/${testCard?.id}`)
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

    test('rejects deletion request if user did not create card', async () => {
      const testCard = cards[1];
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(testCard);

      if (testCard) {
        const response = await agent
          .delete(`/api/cards/${testCard?.id}`)
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

  describe('when updating cards', () => {
    test('updates a card (200)', async () => {
      const testCard = cards[0];
      const changes = {
        brief: 'this brief was updated',
        body: 'this body was updated',
        columnId: testCard?.columnId,
        color: 'red',
      };
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(testCard);
      (Card.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testCard, ...changes }, {}],
      ]);
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(mockColumn);

      if (testCard) {
        const response = await agent
          .put(`/api/cards/${testCard.id}`)
          .send(changes)
          .expect(200);

        const responseData = CardResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(true);
        expect(responseData.data).toBeDefined();
        expect(responseData.data.card).toStrictEqual({
          ...testCard,
          ...changes,
        });
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects request if there is no valid user session (401)', async () => {
      const testCard = cards[0];
      const changes = { brief: 'this brief was updated' };
      (Card.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testCard, ...changes }, {}],
      ]);

      if (testCard) {
        const response = await api
          .put(`/api/cards/${testCard.id}`)
          .send(changes)
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

    test('rejects request if user did not create the card', async () => {
      const testCard = cards[1];
      const changes = {
        columnId: testCard?.columnId,
        brief: 'this brief was updated',
        body: 'this body was updated',
        color: 'red',
      };
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(testCard);
      (Card.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testCard, ...changes }, {}],
      ]);
      (Column.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockColumn,
        userId: alternativeUserId,
      });

      if (testCard) {
        const response = await agent
          .put(`/api/cards/${testCard.id}`)
          .send(changes)
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

    test('rejects request if card does not exist (400)', async () => {
      const testCard = cards[0];
      const changes = {
        columnId: testCard?.columnId,
        brief: 'this brief was updated',
        body: 'this body was updated',
        color: 'red',
      };
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(null);
      (Card.update as jest.Mock).mockResolvedValueOnce(null);
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(mockColumn);

      if (testCard) {
        const response = await agent
          .put(`/api/cards/${uuidv4()}`)
          .send(changes)
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
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects request if updating fields that dont exist (400)', async () => {
      const testCard = cards[0];
      const changes = {
        columnId: testCard?.columnId,
        brief: 'this brief was updated',
        body: 'this body was updated',
        color: 'red',
        address: 'address was updated',
      };
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(null);
      (Card.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testCard, ...changes }, {}],
      ]);

      if (testCard) {
        const response = await agent
          .put(`/api/cards/${testCard.id}`)
          .send(changes)
          .expect(400);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(false);
        // expect(responseData.errorType).toBe('zod');
        expect(responseData.errors).toStrictEqual([
          {
            code: 'unrecognized_keys',
            message: 'Unrecognized key(s) in object: \'address\'',
            path: [],
          },
        ]);
      } else {
        throw new Error('undefined test data');
      }
    });
  });
});
