import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Role extends Model {
  public id!: string;
  public name!: string; // 'ADMIN' | 'HOSPITAL' | 'DONOR' | 'BLOOD_BANK'
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
  }
);

export default Role;
