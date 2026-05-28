import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Donor from './Donor.js';

export class DonationHistory extends Model {
  public id!: string;
  public donorId!: string;
  public donationDate!: string;
  public unitsDonated!: number;
  public location?: string;
  public status!: string; // 'completed' | 'cancelled'
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DonationHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    donorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'donors',
        key: 'id',
      },
    },
    donationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    unitsDonated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'completed',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DonationHistory',
    tableName: 'donation_histories',
    timestamps: true,
  }
);

DonationHistory.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });
Donor.hasMany(DonationHistory, { foreignKey: 'donorId', as: 'donationHistory' });

export default DonationHistory;
