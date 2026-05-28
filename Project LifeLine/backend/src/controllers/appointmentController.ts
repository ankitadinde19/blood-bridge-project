import { Response } from 'express';
import DonationAppointment from '../models/DonationAppointment.js';
import BloodBank from '../models/BloodBank.js';
import BloodInventory from '../models/BloodInventory.js';
import Donor from '../models/Donor.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../utils/auditLogger.js';

export async function bookAppointment(req: any, res: Response) {
  try {
    const { bloodBankId, date, timeSlot, bloodType } = req.body;

    const bank = await BloodBank.findByPk(bloodBankId);
    if (!bank) {
      return res.status(404).json({
        success: false,
        message: 'No regional blood center matches the specified facility ID.',
        data: null,
      });
    }

    const donor = await Donor.findOne({ where: { userId: req.user?.id } });
    if (!donor) {
      return res.status(403).json({
        success: false,
        message: 'Only registered whole-blood donors can schedule reservation slots.',
        data: null,
      });
    }

    const apptId = 'appt_' + Math.random().toString(36).substring(2, 9);
    const qrText = `LIFELINK-QR-${apptId.toUpperCase()}-${bloodType || donor.bloodGroup}`;

    const newAppointment = await DonationAppointment.create({
      id: apptId,
      donorId: donor.id,
      bloodBankId: bank.id,
      appointmentDate: date,
      timeSlot,
      status: 'scheduled',
      qrCodeValue: qrText,
    });

    // Create a notification for the booking donor
    await Notification.create({
      userId: req.user?.id,
      title: 'Appointment Reserved! 📅',
      message: `Your booking at ${bank.bloodBankName} is scheduled for ${date} at ${timeSlot}. Present QR code on arrival.`,
      type: 'reminder',
      isRead: false,
    });

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'BOOK_APPOINTMENT',
      'APPOINTMENT',
      `Reserved blood-donation reservation ${timeSlot} at ${bank.bloodBankName} on date ${date}.`
    );

    res.status(201).json({
      success: true,
      message: 'Donation slot registered. Safe QR handshake generated.',
      data: {
        id: newAppointment.id,
        donorId: donor.id,
        donorName: req.user?.fullName || 'John Doe',
        bloodType: bloodType || donor.bloodGroup,
        bloodBankId: bank.id,
        bloodBankName: bank.bloodBankName,
        date: date,
        timeSlot: timeSlot,
        status: newAppointment.status,
        qrCodeValue: newAppointment.qrCodeValue,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Reservation transaction failed during file sync.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function getAllAppointments(req: any, res: Response) {
  try {
    const appointments = await DonationAppointment.findAll({
      order: [['appointmentDate', 'ASC']],
      include: [
        {
          model: Donor,
          as: 'donor',
          include: [{ model: User, as: 'user', attributes: ['fullName'] }]
        },
        {
          model: BloodBank,
          as: 'bloodBank',
          attributes: ['bloodBankName']
        }
      ]
    });

    const formatted = appointments.map((appt: any) => ({
      id: appt.id,
      donorId: appt.donorId,
      donorName: appt.donor?.user?.fullName || 'Active Donor',
      bloodType: appt.donor?.bloodGroup || 'O+',
      bloodBankId: appt.bloodBankId,
      bloodBankName: appt.bloodBank?.bloodBankName || 'Clinical Cold Storage',
      date: appt.appointmentDate,
      timeSlot: appt.timeSlot,
      status: appt.status,
      qrCodeValue: appt.qrCodeValue,
    }));

    res.json({
      success: true,
      message: 'All coordinated clinical appointment reserves fetched.',
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to extract slot reports.',
      data: null,
    });
  }
}

export async function updateAppointmentStatus(req: any, res: Response) {
  try {
    const { status } = req.body;
    const apptId = req.params.id;

    const appointment = await DonationAppointment.findByPk(apptId, {
      include: [{ model: BloodBank, as: 'bloodBank' }, { model: Donor, as: 'donor' }]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'No reserving record found matching this index key.',
        data: null,
      });
    }

    const previousStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    if (status === 'completed' && previousStatus !== 'completed') {
      // Find or build inventory at blood bank
      const apptDonor = (appointment as any).donor;
      const bType = apptDonor?.bloodGroup || 'O+';
      
      const inventoryRow = await BloodInventory.findOne({
        where: { bloodBankId: appointment.bloodBankId, bloodGroup: bType }
      });

      if (inventoryRow) {
        inventoryRow.unitsAvailable += 1;
        await inventoryRow.save();
      } else {
        await BloodInventory.create({
          bloodBankId: appointment.bloodBankId,
          bloodGroup: bType,
          unitsAvailable: 1,
        });
      }

      // Update donor last donation date and eligibility (+90 days rest)
      if (apptDonor) {
        const todayStr = new Date().toISOString().substring(0, 10);
        apptDonor.lastDonationDate = todayStr;

        const date = new Date(todayStr);
        date.setDate(date.getDate() + 90);
        apptDonor.eligibilityDate = date.toISOString().substring(0, 10);
        await apptDonor.save();

        // Push award alert to donor
        await Notification.create({
          userId: apptDonor.userId,
          title: '🏆 Achievement Earned: Lifesaver Medal!',
          message: 'You\'ve successfully completed standard whole blood donation! We thank you deeply.',
          type: 'badge',
          isRead: false,
        });
      }
    }

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'UPDATE_APPOINTMENT_STATUS',
      'APPOINTMENT',
      `Modified appointment ID ${apptId} state parameter from ${previousStatus} to ${status}.`
    );

    res.json({
      success: true,
      message: 'Check-In transaction processed and balanced.',
      data: appointment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Check-In routing engine crash.',
      data: null,
    });
  }
}

export async function cancelAppointment(req: any, res: Response) {
  try {
    const appt = await DonationAppointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Reservation not found' });

    appt.status = 'cancelled';
    await appt.save();

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'CANCEL_APPOINTMENT',
      'APPOINTMENT',
      `Cancelled scheduled donation appointment reservation ID ${req.params.id}.`
    );

    res.json({
      success: true,
      message: 'Scheduled reservation cancelled successfully.',
      data: appt,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Slot cancellation process error.',
    });
  }
}
