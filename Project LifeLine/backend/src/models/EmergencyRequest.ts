import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Hospital from './Hospital.js';

export class EmergencyRequest extends Model {
  public id!: string;
  public hospitalId!: string;
  public bloodGroup!: string;
  public unitsRequired!: number;
  public unitsFulfilled!: number;
  public urgencyLevel!: string; // 'critical' | 'high' | 'medium' | 'low'
  public status!: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  public patientDetails?: string;
  public description?: string;
  public requestLocation?: string;
  public latitude!: number;
  public longitude!: number;
  public responses!: string; // Stored as a JSON string to easily serialize responses
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmergencyRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hospitals',
        key: 'id',
      },
    },
    bloodGroup: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    unitsRequired: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitsFulfilled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    urgencyLevel: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    patientDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requestLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    responses: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
    },
  },
  {
    sequelize,
    modelName: 'EmergencyRequest',
    tableName: 'emergency_requests',
    timestamps: true,
  }
);

EmergencyRequest.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });
Hospital.hasMany(EmergencyRequest, { foreignKey: 'hospitalId', as: 'emergencyRequests' });

export default EmergencyRequest;
