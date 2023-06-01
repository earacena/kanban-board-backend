import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../../utils/db';

class Activity extends Model {}
Activity.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    cardId: {
      type: DataTypes.UUIDV4(),
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUIDV4(),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dateCreated: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'activity',
  },
);

export default Activity;
