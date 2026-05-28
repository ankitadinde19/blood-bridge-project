import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import Role from '../models/Role.js';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import BloodBank from '../models/BloodBank.js';
import BloodInventory from '../models/BloodInventory.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import DonationAppointment from '../models/DonationAppointment.js';
import Notification from '../models/Notification.js';
import BloodDriveEvent from '../models/BloodDriveEvent.js';
import DonationHistory from '../models/DonationHistory.js';
import AuditLog from '../models/AuditLog.js';

export async function initializeDatabase() {
  try {
    console.log('[Database] Synergizing Sequelize models and foreign key configurations...');
    // Sync tables safely (use alter so we preserve or add tables incrementally)
    await sequelize.sync({ alter: true });
    console.log('[Database] SQL tables synchronized successfully.');

    // 1. Seed Roles if empty
    const roleCount = await Role.count();
    let adminRole, hospRole, donorRole, bankRole;

    if (roleCount === 0) {
      console.log('[Database] Seeding default credentials roles...');
      adminRole = await Role.create({ name: 'ADMIN', description: 'Central Operations Supervisor Node' });
      hospRole = await Role.create({ name: 'HOSPITAL', description: 'Emergency Trauma Hospital Portal' });
      donorRole = await Role.create({ name: 'DONOR', description: 'Civilian Emergency Donor Node' });
      bankRole = await Role.create({ name: 'BLOOD_BANK', description: 'Regional Cold-Storage Logistics Bank' });
    } else {
      adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
      hospRole = await Role.findOne({ where: { name: 'HOSPITAL' } });
      donorRole = await Role.findOne({ where: { name: 'DONOR' } });
      bankRole = await Role.findOne({ where: { name: 'BLOOD_BANK' } });
    }

    // 2. Seed default system users with safe hashed passwords (e.g. 'password') if user matches are empty
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('[Database] Seeding clinical system profiles with encrypted credentials...');
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Admin user
      const adminUser = await User.create({
        fullName: 'Super Admin',
        email: 'admin@lifelink.org',
        phone: '+1 (555) 019-9231',
        password: hashedPassword,
        roleId: adminRole!.id,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
        address: 'Central Ops Hub, San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
      });

      // Hospital user
      const hospUser = await User.create({
        fullName: 'Dr. Sarah Jenkins',
        email: 'hospital@lifelink.org',
        phone: '+1 (555) 014-9844',
        password: hashedPassword,
        roleId: hospRole!.id,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
        address: '1001 Potrero Ave, San Francisco, CA 94110',
        latitude: 37.7556,
        longitude: -122.4047,
      });

      // Donor user
      const donorUser = await User.create({
        fullName: 'John Doe',
        email: 'donor@lifelink.org',
        phone: '+1 (555) 018-2931',
        password: hashedPassword,
        roleId: donorRole!.id,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
        address: 'Mission District, SF',
        latitude: 37.7610,
        longitude: -122.4100,
      });

      // Blood Bank user
      const bankUser = await User.create({
        fullName: 'Lisa Thompson',
        email: 'bloodbank@lifelink.org',
        phone: '+1 (555) 012-7489',
        password: hashedPassword,
        roleId: bankRole!.id,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
        address: '2200 O\'Farrell St, San Francisco, CA 94115',
        latitude: 37.7825,
        longitude: -122.4398,
      });

      // 3. Connect sub profiles
      const mainDonor = await Donor.create({
        userId: donorUser.id,
        bloodGroup: 'O-',
        lastDonationDate: '2026-02-15',
        eligibilityDate: '2026-05-15',
        medicalHistory: JSON.stringify({ allergy: 'none', ironLevel: 'high' }),
        emergencyAvailable: true,
        weight: 165,
        age: 28,
        badges: JSON.stringify(['First Responder', 'Lifesaver Medal', 'O- Elite Hero']),
      });

      const mainHospital = await Hospital.create({
        userId: hospUser.id,
        hospitalName: 'St. Jude General Hospital',
        licenseNumber: 'LIC-772849',
        location: '1001 Potrero Ave, San Francisco, CA 94110',
        emergencyContact: '+1 (555) 123-4567',
        verified: true,
      });

      const mainBank = await BloodBank.create({
        userId: bankUser.id,
        bloodBankName: 'Metro Blood Center',
        storageCapacity: 2500,
        address: '2200 O\'Farrell St, San Francisco, CA 94115',
      });

      // 4. Seed Blood Inventory for Metro Blood Center
      await BloodInventory.bulkCreate([
        { bloodBankId: mainBank.id, bloodGroup: 'O-', unitsAvailable: 8, expiryDate: '2026-06-15' },
        { bloodBankId: mainBank.id, bloodGroup: 'O+', unitsAvailable: 24, expiryDate: '2026-06-25' },
        { bloodBankId: mainBank.id, bloodGroup: 'A+', unitsAvailable: 32, expiryDate: '2026-06-30' },
        { bloodBankId: mainBank.id, bloodGroup: 'A-', unitsAvailable: 12, expiryDate: '2026-06-20' },
        { bloodBankId: mainBank.id, bloodGroup: 'B+', unitsAvailable: 18, expiryDate: '2026-07-02' },
        { bloodBankId: mainBank.id, bloodGroup: 'B-', unitsAvailable: 5, expiryDate: '2026-06-18' },
        { bloodBankId: mainBank.id, bloodGroup: 'AB+', unitsAvailable: 15, expiryDate: '2026-07-10' },
        { bloodBankId: mainBank.id, bloodGroup: 'AB-', unitsAvailable: 4, expiryDate: '2026-06-22' },
      ]);

      // Create a second clinical bank
      const seedBank2User = await User.create({
        fullName: 'Bay Area Logistics Lead',
        email: 'bayarea@lifelink.org',
        phone: '+1 (555) 234-5678',
        password: hashedPassword,
        roleId: bankRole!.id,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
        address: '1663 Geary Blvd, San Francisco, CA 94115',
        latitude: 37.7836,
        longitude: -122.4300,
      });

      const bank2 = await BloodBank.create({
        userId: seedBank2User.id,
        bloodBankName: 'Red Cross Bay Area',
        storageCapacity: 5000,
        address: '1663 Geary Blvd, San Francisco, CA 94115',
      });

      await BloodInventory.bulkCreate([
        { bloodBankId: bank2.id, bloodGroup: 'O-', unitsAvailable: 3, expiryDate: '2026-06-10' },
        { bloodBankId: bank2.id, bloodGroup: 'O+', unitsAvailable: 45, expiryDate: '2026-06-29' },
        { bloodBankId: bank2.id, bloodGroup: 'A+', unitsAvailable: 29, expiryDate: '2026-06-15' },
        { bloodBankId: bank2.id, bloodGroup: 'A-', unitsAvailable: 8, expiryDate: '2026-06-22' },
        { bloodBankId: bank2.id, bloodGroup: 'B+', unitsAvailable: 20, expiryDate: '2026-07-05' },
        { bloodBankId: bank2.id, bloodGroup: 'B-', unitsAvailable: 2, expiryDate: '2026-06-14' },
      ]);

      // 5. Seed Emergency Requests
      await EmergencyRequest.bulkCreate([
        {
          hospitalId: mainHospital.id,
          bloodGroup: 'O-',
          unitsRequired: 6,
          unitsFulfilled: 2,
          urgencyLevel: 'critical',
          status: 'in-progress',
          patientDetails: 'Multi-vehicle highway pileup trauma patient in critical hemorrhagic arrest.',
          description: 'Emergency allocation O- Universal Negative groups matches required immediately.',
          requestLocation: 'St. Jude General Hospital Trauma Ward',
          latitude: 37.7556,
          longitude: -122.4047,
          responses: JSON.stringify([
            {
              id: 'resp_1',
              donorId: mainDonor.id,
              donorName: 'John Doe',
              phone: '+1 (555) 018-2931',
              bloodType: 'O-',
              status: 'accepted',
              message: 'Leaving work right now. Arriving in 10 minutes to help.',
              distanceKm: 0.77,
            },
          ]),
        },
      ]);

      // 6. Seed Blood Camps
      await BloodDriveEvent.bulkCreate([
        {
          title: 'Golden Gate Community Donation Camp',
          location: 'SF City Hall Plaza, San Francisco, CA 94102',
          eventDate: '2026-05-30',
          time: '09:00 AM - 04:00 PM',
          organizer: 'Metro Blood Center & SF City Hall',
          capacity: 150,
          registeredCount: 48,
          latitude: 37.7792,
          longitude: -122.4192,
          description: 'Join LifeLink and Red Cross for a mass community blood donation drive. Food trucks, local music, and free health checks provided for all eligible donors!',
        },
        {
          title: 'Sunset District Emergency Drive',
          location: 'Sunset Community Gym, SF CA 94122',
          eventDate: '2026-06-03',
          time: '10:00 AM - 02:00 PM',
          organizer: 'Red Cross Bay Area',
          capacity: 80,
          registeredCount: 12,
          latitude: 37.7400,
          longitude: -122.4800,
          description: 'Urgent call for Negative blood subgroups (O-, A-, B-, AB-). Help restock critical hospital supplies heading into summer.',
        },
      ]);

      // 7. Seed Initial Notifications
      await Notification.bulkCreate([
        {
          userId: donorUser.id,
          title: '🚨 URGENT: CRITICAL O- REQUEST NEARBY',
          message: 'St. Jude General Hospital (0.8km away) has a critical O- transfusion emergency. Can you assist?',
          type: 'emergency',
          isRead: false,
        },
        {
          userId: adminUser.id,
          title: 'Emergency Request Created',
          message: 'Critical O- emergency raised by St. Jude General Hospital.',
          type: 'system',
          isRead: false,
        },
        {
          userId: bankUser.id,
          title: '⚠️ Expiry Warning',
          message: '2 units of O- are expiring in 3 days. Coordinate with St. Jude for immediate allocation.',
          type: 'inventory',
          isRead: true,
        },
      ]);

      // 8. Seed Initial Audit Logs
      await AuditLog.bulkCreate([
        {
          userId: hospUser.id,
          userDetails: 'Sarah Jenkins (Hospital)',
          action: 'CREATE_EMERGENCY_REQUEST',
          timestamp: new Date().toISOString(),
          module: 'EMERGENCY',
          details: 'Urgent O- request for trauma victim (6 units required)',
        },
        {
          userId: donorUser.id,
          userDetails: 'John Doe (Donor)',
          action: 'ACCEPT_EMERGENCY_RESPONSE',
          timestamp: new Date().toISOString(),
          module: 'COORDINATION',
          details: 'Donor John Doe accepted St. Jude O- critical demand',
        },
        {
          userId: bankUser.id,
          userDetails: 'Lisa Thompson (Blood Bank)',
          action: 'UPDATE_INVENTORY',
          timestamp: new Date().toISOString(),
          module: 'INVENTORY',
          details: 'Refreshed Metro Blood Center O- and O+ counts',
        },
      ]);

      console.log('[Database] Dynamic clinical datasets seeded successfully!');
    } else {
      console.log('[Database] System database already contains operational datasets.');
    }
  } catch (error) {
    console.error('[Database Error] Failed to initialize/seed database:', error);
  }
}
