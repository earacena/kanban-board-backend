import { NextFunction, Request, Response } from 'express';
import supertest from 'supertest';
import session from 'express-session';
import app from '../../app';
import { BoardArrayType, BoardType } from './board.types';
import { ApiResponse, BoardPayload, BoardResponse } from '../../app.types';

const api = supertest(app.app);

// jest.mock('express-session', () => ({
//   // eslint-disable-next-line max-len
// default: jest.fn().mockImplementation(() => (req:
// Request, res: Response, next: NextFunction) => next()),
// }));

jest.mock('express-session', () => ({
  __esModule: true,
  default: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
}));

describe('Board API', () => {
  const board: BoardType = {
    id: 'uuid-board-id',
    userId: 'uuid-user-id',
    label: 'Test label',
    dateCreated: new Date(),
  };

  const boards: BoardArrayType = [
    {
      id: 'uuid-board-id-1',
      userId: 'uuid-user-id',
      label: 'Test label 1',
      dateCreated: new Date(),
    },
    {
      id: 'uuid-board-id-2',
      userId: 'uuid-user-id',
      label: 'Test label 2',
      dateCreated: new Date(),
    },
    {
      id: 'uuid-board-id-3',
      userId: 'uuid-user-id',
      label: 'Test label 3',
      dateCreated: new Date(),
    },
  ];

  beforeAll(() => {
  });

  describe('when getting boards', () => {
    test('retrieves board by id (200)', async () => {
      const response = await api
        .get('/api/boards/uuid-board-id')
        .expect(200);

      const responseData = BoardResponse.parse(await JSON.parse(response.text));
      expect(responseData.success).toBeDefined();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data?.board).toBe(board);
    });

    test('retrieves boards by userId (200)', () => { expect(true).toBe(false); });
    test('rejects board fetch request by id if there is no valid user session (401)', () => { expect(true).toBe(false); });
    test('rejects boards fetch request by user id if there is no valid user session (401)', () => { expect(true).toBe(false); });
    test('rejects board fetch request by id if not the user who created it (401)', () => { expect(true).toBe(false); });
    test('rejects boards fetch request by user id if not the user who created them (401)', () => { expect(true).toBe(false); });
    test('rejects request if board does not exist (400)', () => { expect(true).toBe(false); });
    test('rejects request of boards if user does not exist (400)', () => { expect(true).toBe(false); });
  });

  describe('when creating boards', () => {});
  describe('when deleting boards', () => {});
  describe('when updating boards', () => {});
});
