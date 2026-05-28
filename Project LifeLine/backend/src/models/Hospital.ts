import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

export class Hospital extends Model {
  public id!: string;
  public userId!: string;
  public hospitalName!: string;
  public licenseNumber?: string;
  public location?: string;
  public emergencyContact?: string;
  public verified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Hospital.init(
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
    hospitalName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    licenseNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emergencyContact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Hospital',
    tableName: 'hospitals',
    timestamps: true,
  }
);

Hospital.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Hospital, { foreignKey: 'userId', as: 'hospitalProfile' });

export default Hospital;
