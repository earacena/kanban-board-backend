import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../../utils/db';

class Card extends Model {}
Card.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    userId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    columnId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    brief: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
    },
    color: {
      type: DataTypes.TEXT,
    },
    dateCreated: {
      type: DataTypes.TEXT,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'card',
  },
);

export default Card;
