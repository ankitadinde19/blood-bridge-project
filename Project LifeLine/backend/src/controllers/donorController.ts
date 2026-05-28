import { Response } from 'express';
import Donor from '../models/Donor.js';
import User from '../models/User.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getAllDonors(req: any, res: Response) {
  try {
    const donors = await Donor.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    const formattedDonors = donors.map((d: any) => ({
      id: d.id,
      userId: d.userId,
      name: d.user?.fullName || 'Unknown Donor',
      email: d.user?.email || '',
      phone: d.user?.phone || d.phone || '',
      avatar: d.user?.profileImage,
      address: d.user?.address,
      latitude: d.user?.latitude,
      longitude: d.user?.longitude,
      bloodType: d.bloodGroup,
      bloodGroup: d.bloodGroup,
      lastDonationDate: d.lastDonationDate,
      eligibilityDate: d.eligibilityDate,
      emergencyAvailable: d.emergencyAvailable,
      isAvailable: d.emergencyAvailable,
      weight: d.weight,
      age: d.age,
      badges: JSON.parse(d.badges || '[]'),
      history: [] // can load dynamic histories when querying details if needed
    }));

    res.json({
      success: true,
      message: 'Active donor profiles index fetched successfully.',
      data: formattedDonors,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch civilian donor registries.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function getDonorById(req: any, res: Response) {
  try {
    const donor = await Donor.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'No donor registry found under this index.',
        data: null,
      });
    }

    const d: any = donor;
    const formatted = {
      id: d.id,
      userId: d.userId,
      name: d.user?.fullName,
      email: d.user?.email,
      phone: d.user?.phone || d.phone || '',
      avatar: d.user?.profileImage,
      address: d.user?.address,
      latitude: d.user?.latitude,
      longitude: d.user?.longitude,
      bloodType: d.bloodGroup,
      bloodGroup: d.bloodGroup,
      lastDonationDate: d.lastDonationDate,
      eligibilityDate: d.eligibilityDate,
      emergencyAvailable: d.emergencyAvailable,
      isAvailable: d.emergencyAvailable,
      weight: d.weight,
      age: d.age,
      badges: JSON.parse(d.badges || '[]'),
    };

    res.json({
      success: true,
      message: 'Donor matching registry fetched successfully.',
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Registry retrieve fail.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function createDonor(req: any, res: Response) {
  try {
    const { userId, bloodGroup, weight, age, emergencyAvailable, medicalHistory } = req.body;

    const existing = await Donor.findOne({ where: { userId } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Donor profile already connected with this user account.',
        data: null,
      });
    }

    const donor = await Donor.create({
      userId,
      bloodGroup,
      weight,
      age,
      emergencyAvailable: emergencyAvailable !== undefined ? emergencyAvailable : true,
      medicalHistory: medicalHistory ? JSON.stringify(medicalHistory) : '{}',
      badges: JSON.stringify(['Active Supporter']),
    });

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'CREATE_DONOR_PROFILE',
      'COORDINATION',
      `Created sub-donor record for User UUID ${userId}.`
    );

    res.status(201).json({
      success: true,
      message: 'Donor profile file registered.',
      data: donor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to construct donor ledger.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function updateDonor(req: any, res: Response) {
  try {
    const { bloodGroup, weight, age, emergencyAvailable, lastDonationDate, badges, locationName } = req.body;
    const donor = await Donor.findByPk(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor record index not found.',
        data: null,
      });
    }

    if (bloodGroup) donor.bloodGroup = bloodGroup;
    if (weight) donor.weight = weight;
    if (age) donor.age = age;
    if (emergencyAvailable !== undefined) donor.emergencyAvailable = emergencyAvailable;
    if (lastDonationDate) {
      donor.lastDonationDate = lastDonationDate;
      // Calculate next eligibility (90 days later)
      const date = new Date(lastDonationDate);
      date.setDate(date.getDate() + 90);
      donor.eligibilityDate = date.toISOString().substring(0, 10);
    }
    if (badges) {
      donor.badges = Array.isArray(badges) ? JSON.stringify(badges) : badges;
    }

    await donor.save();

    // If coordinates or location name is updated, reflect on User row
    if (locationName) {
      const parentUser = await User.findByPk(donor.userId);
      if (parentUser) {
        parentUser.address = locationName;
        await parentUser.save();
      }
    }

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'UPDATE_DONOR_PROFILE',
      'COORDINATION',
      `Updated donor parameters on profile ID ${donor.id}.`
    );

    res.json({
      success: true,
      message: 'Donor credentials and vital parameters synchronized successfully.',
      data: donor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Donor update transaction failed.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function getEligibleDonors(req: any, res: Response) {
  try {
    const donors = await Donor.findAll({
      include: [{
        model: User,
        as: 'user',
        where: { status: 'active' },
        attributes: { exclude: ['password'] }
      }]
    });

    const eligible = donors
      .filter((d) => {
        if (!d.emergencyAvailable) return false;
        if (!d.lastDonationDate) return true;

        const lastDon = new Date(d.lastDonationDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastDon.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 90; // fully eligible
      })
      .map((d: any) => ({
        id: d.id,
        name: d.user?.fullName,
        bloodGroup: d.bloodGroup,
        phone: d.user?.phone,
        email: d.user?.email,
      }));

    res.json({
      success: true,
      message: 'Retrieved active, clinically eligible donors list.',
      data: eligible,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify eligibility countdown.',
      data: null,
    });
  }
}

export async function deleteDonor(req: any, res: Response) {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'No record matches indices.',
        data: null,
      });
    }

    await donor.destroy();

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'DELETE_DONOR_PROFILE',
      'COORDINATION',
      `De-registered donor record ID ${req.params.id}`
    );

    res.json({
      success: true,
      message: 'Donor bio records archived. Core account status remained active.',
      data: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Record delete transaction failed.',
      data: null,
    });
  }
}
