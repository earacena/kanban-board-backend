import supertest from 'supertest';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { UniqueConstraintError } from 'sequelize';
import User from './user.model';
import app from '../../app';

const UserDetailsPayload = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
});

const ApiResponse = z.object({
  success: z.boolean(),
  errors: z.optional(z.array(z.string())),
  data: z.optional(UserDetailsPayload),
});

const api = supertest(app.app);

jest.mock('sequelize');
jest.mock('argon2');
jest.mock('../user/user.model');

describe('User API', () => {
  beforeAll(() => {
    (User.create as jest.Mock).mockResolvedValue({
      id: uuidv4(),
      name: 'Mock User 1',
      username: 'mockuser1',
      passwordHash: 'password_hash',
      dateRegistered: new Date(),

    });
    (argon2.hash as jest.Mock).mockResolvedValue('password_hash');
  });

  describe('when creating a user', () => {
    const credentials = {
      name: 'Test User',
      username: 'testuser123',
      password: 'testPassword123!',
    };

    test('valid credentials return a session cookie', async () => {
      const response = await api
        .post('/api/users/')
        .send(credentials)
        .expect(201);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data?.user.id).toBeDefined();
      expect(responseData.data?.user.name).toBeDefined();
      expect(responseData.data?.user.username).toBeDefined();
    });

    test('duplicate username credential return an error (400 - bad request)', async () => {
      (UniqueConstraintError as unknown as jest.Mock).mockReturnValue(() => ({
        message: 'validation error',
        fields: {
          username: 'testuser123',
        },
        errors: [
          {
            type: 'unique violation',
            path: 'username',
            value: 'testuser123',
            message: 'username must be unique',
          },
        ],
      }));

      (User.create as jest.Mock).mockImplementationOnce(() => {
        throw new UniqueConstraintError({});
      });

      const response = await api
        .post('/api/users/')
        .send(credentials)
        .expect(400);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toContain('username must be unique');
    });

    test('duplicate name credential return an error (400 - bad request)', async () => {
      (UniqueConstraintError as unknown as jest.Mock).mockReturnValue(() => ({
        message: 'validation error',
        fields: {
          username: 'Test User',
        },
        errors: [
          {
            type: 'unique violation',
            path: 'name',
            value: 'Test User',
            message: 'name must be unique',
          },
        ],
      }));

      const response = await api
        .post('/api/users/')
        .send(credentials)
        .expect(400);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toContain('name must be unique');
    });

    test('duplicate username and name credential return an error (400 - bad request)', async () => {
      (UniqueConstraintError as unknown as jest.Mock).mockReturnValue(() => ({
        message: 'validation error',
        fields: {
          username: 'Test User',
        },
        errors: [
          {
            type: 'unique violation',
            path: 'name',
            value: 'Test User',
            message: 'name must be unique',
          },
          {
            type: 'unique violation',
            path: 'username',
            value: 'testuser123',
            message: 'username must be unique',
          },

        ],
      }));

      const response = await api
        .post('/api/users/')
        .send(credentials)
        .expect(400);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toContain('name must be unique');
      expect(responseData.errors).toContain('username must be unique');
    });

    test('missing credentials return an error (400 - bad request)', async () => {
      const response = await api
        .post('/api/users/')
        .send({ username: 'testUser123' })
        .expect(400);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toContain('missing or invalid credentials');
    });

    test('invalid credential shape return an error (400 - bad request)', async () => {
      const response = await api
        .post('/api/users/')
        .send({ username: 'testUser123', value: '11134343aaabbcccc' })
        .expect(400);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toContain('missing or invalid credentials');
    });

    test('username not meeting requirements return an error (400 - bad request)', async () => {
      const response = await api
        .post('/api/users/')
        .send({ username: 'testUser123' })
        .expect(400);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toContain('username must be alphanumeric and must contain between 8 and 64 characters');
    });

    test('password not meeting requirements return an error (400 - bad request)', async () => {
      const response = await api
        .post('/api/users/')
        .send({ username: 'testUser123' })
        .expect(400);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toBe('password must contain a lowercase letter, an uppercase letter, a digit, one of the following symbols !@#$%^&*+=-, and must contain between 8 and 64 characters');
    });
  });
});
