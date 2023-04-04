import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../../utils/db';

class Column extends Model {}
Column.init(
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
    boardId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'column',
  },
);

export default Column;
