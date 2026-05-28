import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

export class BloodBank extends Model {
  public id!: string;
  public userId!: string;
  public bloodBankName!: string;
  public storageCapacity?: number;
  public address?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BloodBank.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    bloodBankName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    storageCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1000,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'BloodBank',
    tableName: 'blood_banks',
    timestamps: true,
  }
);

BloodBank.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(BloodBank, { foreignKey: 'userId', as: 'bloodBankProfile' });

export default BloodBank;
