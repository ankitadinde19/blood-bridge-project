import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class BloodDriveEvent extends Model {
  public id!: string;
  public title!: string;
  public location!: string;
  public eventDate!: string;
  public time!: string;
  public organizer!: string;
  public capacity!: number;
  public registeredCount!: number;
  public latitude?: number;
  public longitude?: number;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BloodDriveEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    organizer: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    registeredCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'BloodDriveEvent',
    tableName: 'blood_drive_events',
    timestamps: true,
  }
);

export default BloodDriveEvent;
