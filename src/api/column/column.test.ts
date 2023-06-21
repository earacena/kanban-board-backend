import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import app from '../../app';
import { ColumnArrayType } from './column.types';
import {
  ApiResponse, ColumnResponse, ColumnsResponse, ErrorResponse,
} from '../../app.types';
import User from '../user/user.model';
import Column from './column.model';
import Board from '../board/board.model';

const agent = supertest.agent(app.app);
const api = supertest(app.app);

jest.mock('sequelize');
jest.mock('argon2');

describe('Column API', () => {
  const credentials = {
    name: 'Test User',
    username: 'testuser123',
    password: 'testPassword0!',
  };

  const userId = uuidv4();
  const alternativeUserId = uuidv4();

  const boardId = uuidv4();
  const alternativeBoardId = uuidv4();

  const mockUser = {
    id: userId,
    name: 'Test User',
    username: 'testuser123',
    passwordHash: 'passwordhash#',
    dateRegistered: new Date(),
  };

  const mockBoard = {
    id: boardId,
    userId,
    label: 'board label',
    dateCreated: new Date(),
  };

  const columns: ColumnArrayType = [
    {
      id: uuidv4(),
      userId,
      boardId,
      label: 'Test label 1',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId: alternativeUserId,
      boardId: alternativeBoardId,
      label: 'Test label 2',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId,
      boardId,
      label: 'Test label 3',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId: alternativeUserId,
      boardId: alternativeBoardId,
      label: 'Test label 4',
      dateCreated: new Date(),
    },
    {
      id: uuidv4(),
      userId,
      boardId: uuidv4(),
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

  describe('when getting columns', () => {
    test('retrieves column by id (200)', async () => {
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(columns[0]);

      const testColumn = columns[0];
      if (testColumn) {
        const response = await agent
          .get(`/api/columns/${testColumn?.id}`)
          .expect(200);

        console.log(JSON.parse(response.text));
        const responseData = ColumnResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBeDefined();
        expect(responseData.success).toBe(true);
        expect(responseData.data).toBeDefined();
        expect(responseData.data?.column).toStrictEqual(columns[0]);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('retrieves columns by userId (200)', async () => {
      const userColumns = columns.filter((c) => c.userId === userId);
      (Column.findAll as jest.Mock).mockResolvedValueOnce(userColumns);

      const response = await agent
        .get(`/api/columns/user/${userId}`)
        .expect(200);
      const responseData = ColumnsResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data?.columns).toStrictEqual(userColumns);
    });

    test('retrieves columns by boardId (200)', async () => {
      const userColumns = columns.filter((c) => c.boardId === boardId);
      (Board.findByPk as jest.Mock).mockResolvedValueOnce(mockBoard);
      (Column.findAll as jest.Mock).mockResolvedValueOnce(userColumns);

      const response = await agent
        .get(`/api/columns/board/${boardId}`)
        .expect(200);

      const responseData = ColumnsResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data?.columns).toStrictEqual(userColumns);
    });

    test('rejects retrieving columns by boardId if user did not create board (401)', async () => {
      const userColumns = columns.filter((c) => c.boardId === alternativeBoardId);
      (Board.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockBoard,
        userId: alternativeUserId,
      });
      (Column.findAll as jest.Mock).mockResolvedValueOnce(userColumns);

      const response = await agent
        .get(`/api/columns/board/${boardId}`)
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

    test('rejects column fetch request by id if there is no valid user session (401)', async () => {
      const testColumn = columns[0];
      if (testColumn) {
        const response = await api
          .get(`/api/columns/${testColumn.id}`)
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

    test('rejects column fetch request by user id if there is no valid user session (401)', async () => {
      const testColumn = columns[0];
      if (testColumn) {
        const response = await api
          .get(`/api/columns/user/${testColumn.userId}`)
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

    test('rejects column fetch request by id if not the user who created it (401)', async () => {
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(columns[1]);
      const testColumn = columns[1];
      if (testColumn) {
        const response = await agent
          .get(`/api/columns/${testColumn.id}`);

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

    test('rejects columns fetch request by user id if not the user who created them (401)', async () => {
      (Column.findAll as jest.Mock).mockResolvedValueOnce(
        columns.filter((c) => c.userId === columns[1]?.userId),
      );
      const testColumn = columns[1];
      if (testColumn) {
        const response = await agent
          .get(`/api/columns/user/${testColumn.userId}`)
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

    test('rejects request if column does not exist (400)', async () => {
      const response = await agent
        .get(`/api/columns/${uuidv4()}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
    });

    test('rejects request of columns if userId does not exist (400)', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      const response = await agent
        .get(`/api/columns/user/${uuidv4()}`)
        .expect(400);

      const responseData = ErrorResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(false);
      expect(responseData.errors).toBeDefined();
    });
  });

  describe('when creating columns', () => {
    test('returns a created column (201)', async () => {
      const newColumn = {
        id: uuidv4(),
        userId,
        boardId,
        label: 'new column',
        dateCreated: new Date(),
      };

      (Column.create as jest.Mock).mockResolvedValueOnce(newColumn);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(mockUser);
      const response = await agent
        .post('/api/columns')
        .send({
          userId,
          boardId,
          label: 'new column',
        })
        .expect(201);

      const responseData = ColumnResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.column).toBeDefined();
      expect(responseData.data.column).toStrictEqual(newColumn);
    });

    test('rejects request if given userId does not exist (400)', async () => {
      const newColumn = {
        id: uuidv4(),
        userId,
        boardId,
        label: 'new column',
        dateCreated: new Date(),
      };

      (Column.create as jest.Mock).mockResolvedValueOnce(newColumn);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const response = await agent
        .post('/api/columns')
        .send({
          userId: uuidv4(),
          label: 'new column',
          boardId,
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

    test('rejects request if userId and/or label and/or boardId are not supplied (400)', async () => {
      let response = await agent
        .post('/api/columns')
        .send({
          userId,
          boardId: uuidv4(),
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
        .post('/api/columns')
        .send({
          label: 'new column',
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
          path: ['boardId'],
        },
      ]);

      response = await agent
        .post('/api/columns')
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
        {
          code: 'invalid_type',
          message: 'Required',
          path: ['boardId'],
        },
      ]);
    });

    test('rejects request if session userId and given userId do not match (401)', async () => {
      (User.findByPk as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        id: alternativeUserId,
      });

      const response = await agent
        .post('/api/columns')
        .send({
          userId: alternativeUserId,
          boardId: uuidv4(),
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
        .post('/api/columns')
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

  describe('when deleting columns', () => {
    test('deletes a column (200)', async () => {
      const testColumn = columns[0];
      if (testColumn) {
        const response = await agent
          .delete(`/api/columns/${testColumn.id}`)
          .expect(200);

        const responseData = ApiResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(true);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('returns 200 even if column does not exist (200)', async () => {
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(null);

      const response = await agent
        .delete(`/api/columns/${uuidv4()}`)
        .expect(200);

      const responseData = ApiResponse.parse(JSON.parse(response.text));
      expect(responseData.success).toBe(true);
    });

    test('rejects deletion request if there is no valid user session', async () => {
      const testColumn = columns[0];
      if (testColumn) {
        const response = await api
          .delete(`/api/columns/${testColumn?.id}`)
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

    test('rejects deletion request if user did not create column', async () => {
      const testColumn = columns[1];
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(testColumn);

      if (testColumn) {
        const response = await agent
          .delete(`/api/columns/${testColumn?.id}`)
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

  describe('when updating columns', () => {
    test('updates a column (200)', async () => {
      const testColumn = columns[0];
      const changes = { label: 'this label was updated' };
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(testColumn);
      (Column.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testColumn, ...changes }, {}],
      ]);

      if (testColumn) {
        const response = await agent
          .put(`/api/columns/${testColumn.id}`)
          .send(changes)
          .expect(200);

        const responseData = ColumnResponse.parse(JSON.parse(response.text));
        expect(responseData.success).toBe(true);
        expect(responseData.data).toBeDefined();
        expect(responseData.data.column).toStrictEqual({
          ...testColumn,
          label: 'this label was updated',
        });
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects request if there is no valid user session (401)', async () => {
      const testColumn = columns[0];
      const changes = { label: 'this label was updated' };
      (Column.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testColumn, ...changes }, {}],
      ]);

      if (testColumn) {
        const response = await api
          .put(`/api/columns/${testColumn.id}`)
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

    test('rejects request if user did not create the column', async () => {
      const testColumn = columns[1];
      const changes = { label: 'this label was updated' };
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(testColumn);
      (Column.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testColumn, ...changes }, {}],
      ]);

      if (testColumn) {
        const response = await agent
          .put(`/api/columns/${testColumn.id}`)
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

    test('rejects request if column does not exist (400)', async () => {
      const testColumn = columns[0];
      const changes = { label: 'this label was updated' };
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(null);
      (Column.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testColumn, ...changes }, {}],
      ]);

      if (testColumn) {
        const response = await agent
          .put(`/api/columns/${testColumn.id}`)
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
            message: 'column does not exist',
          },
        ]);
      } else {
        throw new Error('undefined test data');
      }
    });

    test('rejects request if updating fields that dont exist (400)', async () => {
      const testColumn = columns[0];
      const changes = { label: 'this was updated', address: 'address was updated' };
      (Column.findByPk as jest.Mock).mockResolvedValueOnce(null);
      (Column.update as jest.Mock).mockResolvedValueOnce([
        {},
        [{ ...testColumn, ...changes }, {}],
      ]);

      if (testColumn) {
        const response = await agent
          .put(`/api/columns/${testColumn.id}`)
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
