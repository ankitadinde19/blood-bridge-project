import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Notification extends Model {
  public id!: string;
  public userId!: string; // 'ALL' or User UUID
  public title!: string;
  public message!: string;
  public type!: 'emergency' | 'system' | 'reminder' | 'inventory' | 'badge';
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(100), // can hold 'ALL' or User UUID
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('emergency', 'system', 'reminder', 'inventory', 'badge'),
      allowNull: false,
      defaultValue: 'system',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
  }
);

export default Notification;
