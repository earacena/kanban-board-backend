import { Sequelize } from 'sequelize';
import { NODE_ENV, database } from '../config';

let options = {};

if (NODE_ENV === 'development') {
  options = { logging: true };
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
  } catch {
    console.log('Failed to connect to database');
  }
};

export default sequelize;
