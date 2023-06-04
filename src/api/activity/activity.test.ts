import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import app from '../../app';
import User from '../user/user.model';
import Card from '../card/card.model';
import Activity from './activity.model';
import { ActivitiesResponse, ActivityResponse, ErrorResponse } from '../../app.types';

const agent = supertest.agent(app.app);
const api = supertest(app.app);

jest.mock('sequelize');
jest.mock('argon2');
jest.mock('../activity/activity.model');
jest.mock('../card/card.model');
jest.mock('../user/user.model');
jest.mock('../column/column.model');

describe('Activity API', () => {
  const credentials = {
    name: 'Test User',
    username: 'testuser123',
    password: 'testPassword0!',
  };

  const userId = uuidv4();
  const alternativeUserId = uuidv4();

  const cardId = uuidv4();
  const alternativeCardId = uuidv4();

  const columnId = uuidv4();
  const alternativeColumnId = uuidv4();

  const mockUser = {
    id: userId,
    name: 'Test User',
    username: 'testuser123',
    passwordHash: 'passwordhash#',
    dateRegistered: new Date(),
  };

  const mockCard = {
    id: cardId,
    userId,
    columnId,
    brief: 'mock brief',
    body: 'mock body',
    dateCreated: new Date(),
  };

  const activities = [
    {
      id: uuidv4(),
      cardId,
      userId,
      description: 'activity description 1',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      cardId: alternativeCardId,
      userId: alternativeUserId,
      description: 'activity description 2',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      cardId,
      userId,
      description: 'activity description 3',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      cardId: alternativeCardId,
      userId: alternativeUserId,
      description: 'activity description 4',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      cardId,
      userId,
      description: 'activity description 5',
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

  describe('when getting activities', () => {
    test('returns activities with given card id (200)', async () => {
      const testActivities = activities.filter((a) => a.cardId === cardId);
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(mockCard);
      (Activity.findAll as jest.Mock).mockResolvedValueOnce(testActivities);

      const response = await agent
        .get(`/api/activity/${cardId}`)
        .expect(200);

      const responseData = ActivitiesResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.activities).toStrictEqual(testActivities);
    });

    test('rejects request if there is no valid user session (401)', async () => {
      const response = await api
        .get(`/api/activity/${cardId}`)
        .expect(401);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toStrictEqual([{
        code: 'unauthorized_action',
        value: '',
        path: '',
        message: 'must be logged in to perform this action',
      }]);
    });

    test('rejects request if user did not create the card (401)', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockCard,
        userId: alternativeUserId,
      });
      const response = await agent
        .get(`/api/activity/${cardId}`)
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
          message: 'not authorized to perform this action',
        },
      ]);
    });

    test('rejects request if card does not exist', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const response = await agent
        .get(`/api/activity/${cardId}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_request',
          value: '',
          path: '',
          message: 'card does not exist',
        },
      ]);
    });
  });

  describe('when creating activity entries', () => {
    test('returns created activity (200)', async () => {
      const activity = activities[0];
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(mockCard);
      (Activity.create as jest.Mock).mockResolvedValueOnce(activity);

      const response = await agent
        .post('/api/activity/')
        .send({
          userId,
          cardId,
          description: 'activity description 1',
        })
        .expect(201);

      const responseData = ActivityResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
      expect(responseData.data?.activity).toStrictEqual(activity);
    });

    test('rejects request if there is no valid user session (401)', async () => {
      const response = await api
        .post('/api/activity')
        .send({
          userId,
          cardId,
          description: 'activity description 1',
        })
        .expect(401);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toStrictEqual([{
        code: 'unauthorized_action',
        value: '',
        path: '',
        message: 'must be logged in to perform this action',
      }]);
    });

    test('rejects request if user did not create the card (401)', async () => {
      const activity = activities[0];
      (Card.findByPk as jest.Mock).mockReturnValueOnce({ ...mockCard, userId: alternativeUserId });
      (Activity.create as jest.Mock).mockResolvedValueOnce(activity);
      const response = await agent
        .post('/api/activity/')
        .send({
          userId,
          cardId,
          description: 'activity description 1',
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
          message: 'not authorized to perform this action',
        },
      ]);
    });

    test('rejects request if card does not exist', async () => {
      (Card.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const response = await agent
        .post('/api/activity/')
        .send({
          userId,
          cardId,
          description: 'activity description 1',
        })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_request',
          value: '',
          path: '',
          message: 'card does not exist',
        },
      ]);
    });
  });
});
