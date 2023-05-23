# Kanban Board - Backend

## Description

The backend of a kanban board web application used for task management.
Deployed live [here](https://kanban-board.onrender.com).

The frontend of this project is [here](https://github.com/earacena/kanban-board).

### Routes (WIP)

#### /api/boards

| Method | Route                    | Behavior                                |
| ------ | ------                   | -----------                             |
| POST   | /api/boards/             | creates a board                         |
| GET    | /api/boards/:boardId     | retrieves board by id                   |
| GET    | /api/boards/user/:userId | retrieves all boards with given userId  |
| PUT    | /api/boards/:boardId     | updates board with given id             |
| DELETE | /api/boards/:boardId     | delete board with given id              |

#### /api/columns

| Method | Route                     | Behavior
|---     | ---                       | ---                                     |
| POST   | /api/columns/             | creates a column                        |
| GET    | /api/columns/:columnId    | retrieves column by id                  |
| GET    | /api/columns/user/:userId | retrieves all columns with given userId |
| PUT    | /api/columns/:columnId    | updates a column with given id          |
| DELETE | /api/columns/:columnId    | deletes a column with given id          |

#### /api/cards
  * WIP

#### /api/user

| Method | Route                     | Behavior
|---     | ---                       | ---                                     |
| POST   | /api/users/               | creates a user                          |
| GET    | /api/users/fetch-user     | retrieves current user session          |

#### /login

| Method | Route                     | Behavior
|---     | ---                       | ---                                           |
| POST   | /login                    | creates a session with given user credentials |

#### /logout

| Method | Route                     | Behavior
|---     | ---                       | ---                                           |
| POST   | /logout                   | destroys user session associated with request |

### Technologies

* Typescript
* Express
* PostgreSQL
* express-session (Session-based authentication)
* Sequelize
* Zod
* Jest

## Usage

### Download

While in terminal with chosen directory, enter the command:

```bash
git clone https://github.com/earacena/kanban-board-backend.git
```

### Install

While in the root project folder, enter the command:

```bash
npm install
```

### Setup

In order to run the backend or deploy locally, a .env file with the following variables must be in root project folder:

```text
# Development environment
DEV_DATABASE_URL="postgres://pguser:pgpass@localhost:3003/pgdb"
DEV_DATABASE_USER=pguser
DEV_DATABASE_PASSWORD=pgpass
DEV_DATABASE_HOST=localhost
DEV_DATABASE_PORT=3003
DEV_DATABASE_NAME=pgdb

# Test environment, currently not necessary for running tests
TEST_DATABASE_USER='pguser'
TEST_DATABASE_PASSWORD='pgpass'
TEST_DATABASE_HOST='localhost'
TEST_DATABASE_PORT=3003
TEST_DATABASE_NAME='pgdb'

# Production environment, supply your own credentials for your production environment
PROD_DATABASE_USER=...
PROD_DATABASE_PASSWORD=...
PROD_DATABASE_HOST=...
PROD_DATABASE_PORT=...
PROD_DATABASE_NAME=...

SERVER_PORT=3001
SECRET_SESSION_KEY=...        # Generate your own key and paste here
CORS_ORIGIN= ...              # Place address to frontend here
```

### Deploy locally for development

To deploy the database locally, ensure you have the Docker service running and run:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Open another terminal then run the following in the root project folder:

```bash
npm run dev
```

At this point, a containerized docker containing PostgreSQL and a development server for this project should be running.

### Testing

Run the following in the root project folder:

```bash
npm test
```

Note: Database does not need to be running to run tests.
