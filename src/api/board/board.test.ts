import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import app from '../../app';
import { BoardArrayType } from './board.types';
import { ApiResponse, BoardResponse, BoardsResponse, ErrorResponse } from '../../app.types';
import User from '../user/user.model';
import Board from './board.model';

const agent = supertest.agent(app.app);
const api = supertest(app.app);

jest.mock('sequelize');
jest.mock('argon2');

describe('Board API', () => {
  const credentials = {
    name: 'Test User',
    username: 'testuser123',
    password: 'testPassword0!',
  };

  const userId = uuidv4();
  const alternativeUserId = uuidv4();

  const mockUser = {
    id: userId,
    name: 'Test User',
    username: 'testuser123',
    passwordHash: 'passwordhash#',
    dateRegistered: new Date(),
  };

  const boards: BoardArrayType = [
    {
      id: uuidv4(),
      userId,
      label: 'Test label 1',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId: alternativeUserId,
      label: 'Test label 2',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId,
      label: 'Test label 3',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId: alternativeUserId,
      label: 'Test label 4',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId,
      label: 'Test label 5',
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

  describe('when getting boards', () => {
    test('retrieves board by id (200)', async () => {
      (Board.findByPk as jest.Mock).mockResolvedValueOnce(boards[0]);

      const testBoard = boards[0];
      if (testBoard) {
        const response = await agent
          .get(`/api/boards/${testBoard?.id}`)
          .expect(200);

        console.log(JSON.parse(response.text));
        const responseData = BoardResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBeDefined();
        expect(responseData.success).toBe(true);
        expect(responseData.data).toBeDefined();
        expect(responseData.data?.board).toStrictEqual(boards[0]);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('retrieves boards by userId (200)', async () => {
      const userBoards = boards.filter((b) => b.userId === userId);
      (Board.findAll as jest.Mock).mockResolvedValueOnce(userBoards);

      const response = await agent
        .get(`/api/boards/user/${userId}`)
        .expect(200);

      const responseData = BoardsResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data?.boards).toStrictEqual(userBoards);
    });

    test('rejects board fetch request by id if there is no valid user session (401)', async () => {
      const testBoard = boards[0];
      if (testBoard) {
        const response = await api
          .get(`/api/boards/${testBoard.id}`)
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

    test('rejects boards fetch request by user id if there is no valid user session (401)', async () => {
      const testBoard = boards[0];
      if (testBoard) {
        const response = await api
          .get(`/api/boards/user/${testBoard.userId}`)
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

    test('rejects board fetch request by id if not the user who created it (401)', async () => {
      (Board.findByPk as jest.Mock).mockResolvedValueOnce(boards[1]);
      const testBoard = boards[1];
      if (testBoard) {
        const response = await agent
          .get(`/api/boards/${testBoard.id}`);

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

    test('rejects boards fetch request by user id if not the user who created them (401)', async () => {
      (Board.findAll as jest.Mock).mockResolvedValueOnce(
        boards.filter((b) => b.userId === boards[1]?.userId),
      );
      const testBoard = boards[1];
      if (testBoard) {
        const response = await agent
          .get(`/api/boards/user/${testBoard.userId}`)
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
            message: 'not authorized to perform that action',
          },
        ]);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects request if board does not exist (400)', async () => {
      const response = await agent
        .get(`/api/boards/${uuidv4()}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
    });

    test('rejects request of boards if userId does not exist (400)', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      const response = await agent
        .get(`/api/boards/user/${uuidv4()}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
    });
  });

  describe('when creating boards', () => {
    test('returns a created board (201)', async () => {
      const newBoard = {
        id: uuidv4(),
        userId,
        label: 'new board',
        dateCreated: new Date(),
      };

      (Board.create as jest.Mock).mockResolvedValueOnce(newBoard);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(mockUser);
      const response = await agent
        .post('/api/boards')
        .send({
          userId,
          label: 'new board',
        })
        .expect(201);

      const responseData = BoardResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.board).toBeDefined();
      expect(responseData.data.board).toStrictEqual(newBoard);
    });

    test('rejects request if given userId does not exist (400)', async () => {
      const newBoard = {
        id: uuidv4(),
        userId,
        label: 'new board',
        dateCreated: new Date(),
      };

      (Board.create as jest.Mock).mockResolvedValueOnce(newBoard);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const response = await agent
        .post('/api/boards')
        .send({
          userId: uuidv4(),
          label: 'new board',
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

    test('rejects request if userId and/or label are not supplied (400)', async () => {
      let response = await agent
        .post('/api/boards')
        .send({
          userId,
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
        .post('/api/boards')
        .send({
          label: 'new board',
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
      ]);

      response = await agent
        .post('/api/boards')
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
          path: ['label'],
        },
      ]);
    });

    test('rejects request if session userId and given userId do not match (401)', async () => {
      (User.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        id: alternativeUserId,
      });

      const response = await agent
        .post('/api/boards')
        .send({
          userId: alternativeUserId,
          label: 'test label',
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
        .post('/api/boards')
        .send({
          userId,
          label: 'test label',
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

  describe('when deleting boards', () => {
    test('deletes a board (204)', async () => {
      const testBoard = boards[0];
      if (testBoard) {
        const response = await agent
          .delete(`/api/boards/${testBoard?.id}`)
          .expect(204);

        const responseData = ApiResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(true);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects deletion request if there is no valid user session', async () => {
      const testBoard = boards[0];
      if (testBoard) {
        const response = await api
          .delete(`/api/boards/${testBoard?.id}`)
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

    test('rejects deletion request if user did not create board', async () => {
      const testBoard = boards[1];
      (Board.findByPk as jest.Mock).mockResolvedValueOnce(testBoard);

      if (testBoard) {
        const response = await api
          .delete(`/api/boards/${testBoard?.id}`)
          .expect(401);

        const responseData = ErrorResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(false);
        expect(responseData.errorType).toBe('base');
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

    test('rejects deletion request if board does not exist', async () => {
      (Board.findByPk as jest.Mock).mockResolvedValueOnce(null);

      const response = await agent
        .delete(`/api/boards/${uuidv4()}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(false);
      expect(responseData.errorType).toBe('base');
      expect(responseData.errors).toStrictEqual([
        {
          code: 'invalid_request',
          value: '',
          path: '',
          message: 'board does not exist',
        },
      ]);
    });
  });

  describe('when updating boards', () => {});
});
