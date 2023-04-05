import supertest from 'supertest';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import User from '../user/user.model';
import app from '../../app';
import { decodeWith } from '../../utils/decode';
import { UserDetails } from './login.types';

const api = supertest(app.app);

jest.mock('sequelize');
jest.mock('argon2');
jest.mock('../user/user.model');

describe('Login API', () => {
  beforeAll(() => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: uuidv4(),
      name: 'Mock User 1',
      username: 'mockuser1',
      passwordHash: 'password_hash',
      dateRegistered: new Date(),
    });
    (argon2.verify as jest.Mock).mockResolvedValue(true);
  });

  describe('when receiving a login request', () => {
    const credentials = {
      username: 'testUser',
      password: 'testPassword!1',
    };

    test('correct credentials return user details', async () => {
      const response = await api
        .post('/login')
        .send(credentials)
        .expect(200);

      const responseData = decodeWith(UserDetails)(JSON.parse(response.text));
      expect(responseData.id).toBeDefined();
      expect(responseData.name).toBeDefined();
      expect(responseData.username).toBeDefined();
    });

    test('incorrect credentials return an error', async () => {
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
      await api
        .post('/login')
        .send(credentials)
        .expect(400);

      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      await api
        .post('/login')
        .send(credentials)
        .expect(400);
    });
  });
});
