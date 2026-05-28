import { Response } from 'express';
import AuditLog from '../models/AuditLog.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getAuditLogs(req: any, res: Response) {
  try {
    const logs = await AuditLog.findAll({
      order: [['timestamp', 'DESC']],
    });

    const formatted = logs.map((log: any) => ({
      id: log.id,
      user: log.userDetails || 'SYSTEM CORE',
      action: log.action,
      timestamp: log.timestamp,
      module: log.module,
      details: log.details,
    }));

    res.json({
      success: true,
      message: 'System operations ledger decoded successfully.',
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Audit query transaction failed.',
      data: [],
    });
  }
}

export async function getHospitals(req: any, res: Response) {
  try {
    const hospitalsList = await Hospital.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['phone', 'email']
      }]
    });

    const formatted = hospitalsList.map((h: any) => ({
      id: h.id,
      name: h.hospitalName,
      address: h.location,
      phone: h.emergencyContact || h.user?.phone || '+1 (555) 123-0000',
      latitude: h.user?.latitude || 37.7556,
      longitude: h.user?.longitude || -122.4047,
      verified: h.verified,
    }));

    res.json({
      success: true,
      message: 'Clinical institution network fetched.',
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Hospital directory fetch error.',
    });
  }
}

export async function onboardHospital(req: any, res: Response) {
  try {
    const { name, address, phone, latitude, longitude, verified } = req.body;

    // Build user row first for credentials mapping
    const hospRole = await Role.findOne({ where: { name: 'HOSPITAL' } });
    const dummyEmail = `hospital-${Math.random().toString(36).substring(2, 7)}@lifelink.org`;

    const newUser = await User.create({
      fullName: name,
      email: dummyEmail,
      phone: phone || '+1 (555) 123-0000',
      password: 'password_hospital_mock',
      roleId: hospRole!.id,
      status: 'active',
      address,
      latitude: latitude ? parseFloat(latitude) : 37.7749,
      longitude: longitude ? parseFloat(longitude) : -122.4194,
    });

    const hospital = await Hospital.create({
      userId: newUser.id,
      hospitalName: name,
      location: address,
      emergencyContact: phone,
      verified: verified !== undefined ? !!verified : true,
    });

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'ONBOARD_HOSPITAL',
      'COORDINATION',
      `Onboarded verified hospital registry: ${name} at ${address}`
    );

    res.status(201).json({
      success: true,
      message: 'New clinic successfully added to verified LifeLink Registry.',
      data: {
        id: hospital.id,
        name: hospital.hospitalName,
        address: hospital.location,
        phone: hospital.emergencyContact,
        latitude: newUser.latitude,
        longitude: newUser.longitude,
        verified: hospital.verified,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to balance onboard transaction.',
    });
  }
}
