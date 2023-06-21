import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../../utils/db';

class User extends Model {}
User.init({
  id: {
    type: DataTypes.UUIDV4,
    primaryKey: true,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: {
      name: 'username',
      msg: 'username must be unique',
    },
    validate: {
      len: {
        args: [8, 64],
        msg: 'username must contain 8 to 64 characters',
      },
    },
  },
  name: {
    type: DataTypes.TEXT,
    unique: {
      name: 'name',
      msg: 'name must be unique',
    },
    validate: {
      len: {
        args: [3, 20],
        msg: 'name must contain 3 to 20 characters',
      },
    },
  },
  dateRegistered: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  passwordHash: {
    type: DataTypes.TEXT,
  },
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'user',
});

export default User;
