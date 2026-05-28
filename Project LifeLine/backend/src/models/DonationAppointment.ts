import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Donor from './Donor.js';
import BloodBank from './BloodBank.js';

export class DonationAppointment extends Model {
  public id!: string;
  public donorId!: string;
  public bloodBankId!: string;
  public appointmentDate!: string;
  public timeSlot!: string;
  public status!: 'scheduled' | 'completed' | 'cancelled';
  public qrCodeValue!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DonationAppointment.init(
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
    bloodBankId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'blood_banks',
        key: 'id',
      },
    },
    appointmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    timeSlot: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    qrCodeValue: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'DonationAppointment',
    tableName: 'donation_appointments',
    timestamps: true,
  }
);

DonationAppointment.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });
DonationAppointment.belongsTo(BloodBank, { foreignKey: 'bloodBankId', as: 'bloodBank' });

Donor.hasMany(DonationAppointment, { foreignKey: 'donorId', as: 'appointments' });
BloodBank.hasMany(DonationAppointment, { foreignKey: 'bloodBankId', as: 'appointments' });

export default DonationAppointment;
