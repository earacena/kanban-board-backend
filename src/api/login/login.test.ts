import supertest from 'supertest';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import User from '../user/user.model';
import app from '../../app';
import { ErrorResponse, UserDetailsResponse } from '../../app.types';

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

      const responseData = UserDetailsResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data?.user.id).toBeDefined();
      expect(responseData.data?.user.name).toBeDefined();
      expect(responseData.data?.user.username).toBeDefined();
    });

    test('incorrect credentials for existing user return an error', async () => {
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
      const response = await api
        .post('/login')
        .send(credentials)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_credentials',
          message: 'credentials do not match records',
          path: '',
          value: '',
        },
      ]);
    });

    test('credentials for user that does not exist return an error', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      const response = await api
        .post('/login')
        .send(credentials)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_credentials',
          message: 'user does not exist',
          path: '',
          value: '',
        },
      ]);
    });
  });
});
