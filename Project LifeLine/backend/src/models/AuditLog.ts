import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class AuditLog extends Model {
  public id!: string;
  public userId?: string; // UUID of actor, type string to prevent foreign key errors with synthetic logins or null admins
  public userDetails?: string; // string representing user details (e.g. name + role)
  public action!: string;
  public module!: string; // 'AUTH' | 'INVENTORY' | 'EMERGENCY' | 'APPOINTMENT' | 'COORDINATION'
  public timestamp!: string;
  public details?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    userDetails: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
  }
);

export default AuditLog;
