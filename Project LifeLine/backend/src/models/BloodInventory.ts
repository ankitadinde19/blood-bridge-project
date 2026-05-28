import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import BloodBank from './BloodBank.js';

export class BloodInventory extends Model {
  public id!: string;
  public bloodGroup!: string;
  public unitsAvailable!: number;
  public expiryDate?: string;
  public bloodBankId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BloodInventory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bloodGroup: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    unitsAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    bloodBankId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'blood_banks',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'BloodInventory',
    tableName: 'blood_inventories',
    timestamps: true,
  }
);

BloodInventory.belongsTo(BloodBank, { foreignKey: 'bloodBankId', as: 'bloodBank' });
BloodBank.hasMany(BloodInventory, { foreignKey: 'bloodBankId', as: 'inventories' });

export default BloodInventory;
