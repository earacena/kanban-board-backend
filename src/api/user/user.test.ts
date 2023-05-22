import supertest from 'supertest';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { UniqueConstraintError, ValidationError, ValidationErrorItem } from 'sequelize';
import User from './user.model';
import app from '../../app';
import { UserDetailsResponse, ErrorResponse, SessionResponse } from '../../app.types';

const api = supertest(app.app);
const agent = supertest.agent(app.app);

jest.mock('argon2');
jest.mock('../user/user.model');

describe('User API', () => {
  const credentials = {
    name: 'Test User',
    username: 'testuser123',
    password: 'testPassword0!',
  };

  const userId = uuidv4();

  const mockUser = {
    id: userId,
    name: 'Test User',
    username: 'testuser123',
    passwordHash: 'passwordhash#',
    dateRegistered: new Date(),
  };

  beforeAll((done) => {
    (User.create as jest.Mock).mockResolvedValue({
      id: uuidv4(),
      name: 'Mock User 1',
      username: 'mockuser1',
      passwordHash: 'password_hash',
      dateRegistered: new Date(),

    });
    (argon2.hash as jest.Mock).mockResolvedValue('password_hash');
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

  describe('when creating a user', () => {
    test('valid credentials return a session cookie (201)', async () => {
      const response = await api
        .post('/api/users/')
        .send(credentials)
        .expect(201);

      const responseData = UserDetailsResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data?.user.id).toBeDefined();
      expect(responseData.data?.user.name).toBeDefined();
      expect(responseData.data?.user.username).toBeDefined();
    });

    test('duplicate username credential return an error (400 - bad request)', async () => {
      (User.create as jest.Mock).mockImplementationOnce(() => {
        throw new UniqueConstraintError({
          message: 'validation error',
          errors: [
            new ValidationErrorItem(
              'username must be unique',
              'DB',
              'username',
              'testuser123',
              new User(),
              'test',
              'unique',
              [true],
            ),
          ],
        });
      });

      const response = await api
        .post('/api/users/')
        .send(credentials)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('sequelize');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'validation_error',
          message: 'username must be unique',
          path: 'username',
          value: 'testuser123',
        },
      ]);
    });

    test('username too short should return an error (400 - bad request)', async () => {
      (User.create as jest.Mock).mockImplementationOnce(() => {
        throw new ValidationError(
          'validation error',
          [
            new ValidationErrorItem(
              'username must have a length between 8 and 64 characters',
              'DB',
              'username',
              'te23',
              new User(),
              'test',
              'len',
              [true],
            ),
          ],
        );
      });

      const response = await api
        .post('/api/users/')
        .send({ ...credentials, username: 'test' })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('sequelize');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'validation_error',
          message: 'username must have a length between 8 and 64 characters',
          path: 'username',
          value: 'te23',
        },
      ]);
    });

    test('duplicate name credential return an error (400 - bad request)', async () => {
      (User.create as jest.Mock).mockImplementationOnce(() => {
        throw new UniqueConstraintError({
          message: 'validation error',
          errors: [
            new ValidationErrorItem(
              'name must be unique',
              'DB',
              'name',
              'Test User',
              new User(),
              'test',
              'unique',
              [true],
            ),
          ],
        });
      });

      const response = await api
        .post('/api/users/')
        .send(credentials)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('sequelize');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'validation_error',
          message: 'name must be unique',
          path: 'name',
          value: 'Test User',
        },
      ]);
    });

    test('duplicate username and name credential return an error (400 - bad request)', async () => {
      (User.create as jest.Mock).mockImplementationOnce(() => {
        throw new UniqueConstraintError({
          message: 'validation error',
          errors: [
            new ValidationErrorItem(
              'name must be unique',
              'DB',
              'name',
              'Test User',
              new User(),
              'test',
              'unique',
              [true],
            ),
            new ValidationErrorItem(
              'username must be unique',
              'DB',
              'username',
              'testuser123',
              new User(),
              'test',
              'unique',
              [true],
            ),
          ],
        });
      });

      const response = await api
        .post('/api/users/')
        .send(credentials)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('sequelize');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'validation_error',
          message: 'name must be unique',
          path: 'name',
          value: 'Test User',
        },
        {
          code: 'validation_error',
          message: 'username must be unique',
          path: 'username',
          value: 'testuser123',
        },
      ]);
    });

    test('missing credentials return an error (400 - bad request)', async () => {
      const response = await api
        .post('/api/users/')
        .send({ username: 'testUser123' })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('zod');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['name'],
        },
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['password'],
        },
      ]);
    });

    test('invalid credential shape return an error (400 - bad request)', async () => {
      const response = await api
        .post('/api/users/')
        .send({ ...credentials, value: '11134343aaabbcccc' })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('zod');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'unrecognized_keys',
          message: 'Unrecognized key(s) in object: \'value\'',
          path: [],
        },
      ]);
    });

    test('username not being alphanumeric return an error (400 - bad request)', async () => {
      (User.create as jest.Mock).mockImplementationOnce(() => {
        throw new ValidationError(
          'validation error',
          [
            new ValidationErrorItem(
              'username must be alphanumeric',
              'DB',
              'username',
              'te23_',
              new User(),
              'test',
              'isAlphanumeric',
              [true],
            ),
          ],
        );
      });

      const response = await api
        .post('/api/users/')
        .send({ ...credentials, username: 'te23_' })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('sequelize');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'validation_error',
          path: 'username',
          value: 'te23_',
          message: 'username must be alphanumeric',
        },
      ]);
    });

    test('password not meeting requirements return an error (400 - bad request)', async () => {
      const response = await api
        .post('/api/users/')
        .send({ ...credentials, password: 'testUser' })
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBeDefined();
      expect(responseData.errorType).toBe('zod');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_string',
          message: 'Invalid',
          path: [
            'password',
          ],
        },
      ]);
    });
  });

  describe('when fetching current user', () => {
    test('returns current session information (200)', async () => {
      const response = await agent
        .get('/api/users/fetch-user')
        .expect(200);

      const responseData = SessionResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
      expect(responseData.data).toStrictEqual({
        user: {
          id: userId,
          name: credentials.name,
          username: credentials.username,
        },
      });
    });

    test('rejects request if user is there is not valid session (401)', async () => {
      const response = await api
        .get('/api/users/fetch-user')
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
    });
  });
});
