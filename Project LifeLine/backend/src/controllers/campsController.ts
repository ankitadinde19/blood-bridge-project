import { Response } from 'express';
import BloodDriveEvent from '../models/BloodDriveEvent.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getAllCamps(req: any, res: Response) {
  try {
    const drives = await BloodDriveEvent.findAll({
      order: [['eventDate', 'ASC']],
    });

    // Make sure we format to match standard keys expected by React
    const formatted = drives.map((d: any) => ({
      id: d.id,
      title: d.title,
      organizer: d.organizer,
      address: d.location,
      date: d.eventDate,
      time: d.time,
      latitude: d.latitude || 37.7749,
      longitude: d.longitude || -122.4194,
      capacity: d.capacity,
      registeredCount: d.registeredCount,
      description: d.description,
    }));

    res.json({
      success: true,
      message: 'Active community blood drives retrieved successfully.',
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to query camp registrations database.',
      data: [],
    });
  }
}

export async function createCamp(req: any, res: Response) {
  try {
    const { title, date, time, capacity, address, description, latitude, longitude } = req.body;

    const newCamp = await BloodDriveEvent.create({
      title,
      organizer: (req.user?.fullName || 'SYSTEM') + ' (Coordinator)',
      eventDate: date,
      time: time || '10:00 AM - 04:00 PM',
      capacity: parseInt(capacity || 100),
      registeredCount: 0,
      location: address,
      latitude: latitude ? parseFloat(latitude) : 37.7749,
      longitude: longitude ? parseFloat(longitude) : -122.4194,
      description,
    });

    // Notify all system users about a new community drive
    await Notification.create({
      userId: 'ALL',
      title: '📢 New Community Donation Camp Announced!',
      message: `A new drive has been registered: "${title}" is happening on ${date}! Check spots.`,
      type: 'system',
      isRead: false,
    });

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'CREATE_BLOOD_CAMP',
      'COORDINATION',
      `Registered new blood donation drive campaign "${title}" on date ${date}.`
    );

    res.status(201).json({
      success: true,
      message: 'Drives initialized. Notifications broadcasted successfully.',
      data: newCamp,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to log camp formation.',
    });
  }
}

export async function registerForCamp(req: any, res: Response) {
  try {
    const camp = await BloodDriveEvent.findByPk(req.params.id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'No drive matches specified tracking ID.',
        data: null,
      });
    }

    if (camp.registeredCount >= camp.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Registration slots for this campaign event are fully completed.',
        data: null,
      });
    }

    camp.registeredCount += 1;
    await camp.save();

    await Notification.create({
      userId: req.user?.id,
      title: 'Registered for Blood Camp! 🏕️',
      message: `You've reserved a walk-up slot for "${camp.title}" on ${camp.eventDate}. Thank you!`,
      type: 'reminder',
      isRead: false,
    });

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'REGISTER_BLOOD_CAMP',
      'COORDINATION',
      `Donor signed up to event: ${camp.title}`
    );

    res.json({
      success: true,
      message: 'Appointment reservation processed. Attendance logged.',
      data: camp,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Operation failed.',
    });
  }
}
