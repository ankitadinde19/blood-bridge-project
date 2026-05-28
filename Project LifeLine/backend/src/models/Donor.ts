import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

export class Donor extends Model {
  public id!: string;
  public userId!: string;
  public bloodGroup!: string;
  public lastDonationDate?: string;
  public eligibilityDate?: string;
  public medicalHistory?: string; // stored as JSON text or serialized string
  public emergencyAvailable!: boolean;
  public weight?: number;
  public age?: number;
  public badges?: string; // comma-separated or JSON
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Donor.init(
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
    bloodGroup: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    lastDonationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    eligibilityDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emergencyAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    badges: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]',
    },
  },
  {
    sequelize,
    modelName: 'Donor',
    tableName: 'donors',
    timestamps: true,
  }
);

Donor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Donor, { foreignKey: 'userId', as: 'donorProfile' });

export default Donor;
