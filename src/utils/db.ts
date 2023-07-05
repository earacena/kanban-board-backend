import { Sequelize } from 'sequelize';
import { NODE_ENV, database } from '../config';

let options = {};

if (NODE_ENV === 'development') {
  options = { logging: console.log };
}

if (NODE_ENV === 'production') {
  options = {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
      },
    },
  };
}

export const sequelize = new Sequelize(database.url, options);

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
  } catch (error: unknown) {
    console.log('Failed to connect to database: ', error);
  }
};

export default sequelize;
