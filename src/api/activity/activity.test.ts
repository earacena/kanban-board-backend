import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import app from '../../app';
import User from '../user/user.model';
import Card from '../card/card.model';
import Activity from './activity.model';
import { ActivityResponse } from '../../app.types';

const agent = supertest.agent(app.app);
// const api = supertest(app.app);

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
  });
});