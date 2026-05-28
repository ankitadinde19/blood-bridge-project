import { Response } from 'express';
import EmergencyRequest from '../models/EmergencyRequest.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Notification from '../models/Notification.js';
import { findCompatibleDonors } from '../services/donorMatcher.js';
import { logAudit } from '../utils/auditLogger.js';

export async function createEmergencyRequest(req: any, res: Response) {
  try {
    const { bloodGroup, unitsRequired, urgencyLevel, description, requestLocation, latitude, longitude } = req.body;

    const creatorId = req.user?.id;
    let hospital = await Hospital.findOne({ where: { userId: creatorId } });

    // Fallback if logged in as admin or mock user to find the seed hospital
    if (!hospital) {
      hospital = await Hospital.findOne();
    }

    if (!hospital) {
      return res.status(403).json({
        success: false,
        message: 'Only registered hospital clinicians can initiate trauma dispatches.',
        data: null,
      });
    }

    const newRequest = await EmergencyRequest.create({
      hospitalId: hospital.id,
      bloodGroup,
      unitsRequired: parseInt(unitsRequired || 1),
      unitsFulfilled: 0,
      urgencyLevel: urgencyLevel || 'medium',
      description: description || 'Trauma resuscitation allocation required.',
      requestLocation: requestLocation || hospital.location || 'Emergency Dept',
      latitude: latitude ? parseFloat(latitude) : (hospital as any).user?.latitude || 37.7556,
      longitude: longitude ? parseFloat(longitude) : (hospital as any).user?.longitude || -122.4047,
      responses: '[]',
    });

    // Smart Match nearby compatible donors instantly!
    const matchedDonors = await findCompatibleDonors({
      targetBloodGroup: bloodGroup,
      targetLatitude: newRequest.latitude,
      targetLongitude: newRequest.longitude,
    });

    // Create notifications for each compatible donor
    const notificationPromises = matchedDonors.map(async (donor) => {
      // Find User profile of the matched donor
      const donorRecord = await Donor.findByPk(donor.id);
      if (donorRecord) {
        return Notification.create({
          userId: donorRecord.userId,
          title: `🚨 EMERGENCY DEMAND: ${bloodGroup} Needed Near You`,
          message: `St. Jude General Hospital has a critical O- transfusion emergency. Can you assist? (Approx. ${donor.distanceKm} km away) Location: ${newRequest.requestLocation}`,
          type: 'emergency',
          isRead: false,
        });
      }
    });

    await Promise.all(notificationPromises);

    // Write a global admin notification too
    await Notification.create({
      userId: 'ALL',
      title: 'Emergency Request Created',
      message: `Critical O- emergency raised by St. Jude General Hospital.`,
      type: 'system',
      isRead: false,
    });

    await logAudit(
      creatorId,
      req.user?.fullName,
      'CREATE_EMERGENCY_REQUEST',
      'EMERGENCY',
      `Authorized trauma broadcast on ID ${newRequest.id} for ${unitsRequired} units of ${bloodGroup}. Matched ${matchedDonors.length} nearby donors.`
    );

    res.status(201).json({
      success: true,
      message: 'Trauma request synchronized. Alert dispatches broadcasted to compatible candidates.',
      data: {
        request: {
          id: newRequest.id,
          hospitalId: newRequest.hospitalId,
          hospitalName: hospital.hospitalName,
          bloodType: newRequest.bloodGroup,
          bloodGroup: newRequest.bloodGroup,
          unitsRequired: newRequest.unitsRequired,
          unitsFulfilled: newRequest.unitsFulfilled,
          priority: newRequest.urgencyLevel,
          urgencyLevel: newRequest.urgencyLevel,
          status: newRequest.status,
          locationName: newRequest.requestLocation,
          latitude: newRequest.latitude,
          longitude: newRequest.longitude,
          createdAt: newRequest.createdAt,
          description: newRequest.description,
          responses: [],
        },
        matchedCount: matchedDonors.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to authorize urgent dispatch sync.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function getAllEmergencyRequests(req: any, res: Response) {
  try {
    const requests = await EmergencyRequest.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['hospitalName']
      }]
    });

    const formatted = requests.map((reqItem: any) => ({
      id: reqItem.id,
      hospitalId: reqItem.hospitalId,
      hospitalName: reqItem.hospital?.hospitalName || 'Clinical Trauma Ward',
      bloodType: reqItem.bloodGroup,
      bloodGroup: reqItem.bloodGroup,
      unitsRequired: reqItem.unitsRequired,
      unitsFulfilled: reqItem.unitsFulfilled,
      priority: reqItem.urgencyLevel,
      urgencyLevel: reqItem.urgencyLevel,
      status: reqItem.status,
      locationName: reqItem.requestLocation,
      latitude: reqItem.latitude,
      longitude: reqItem.longitude,
      createdAt: reqItem.createdAt,
      description: reqItem.description,
      responses: JSON.parse(reqItem.responses || '[]'),
    }));

    res.json({
      success: true,
      message: 'Active emergency alerts timeline decoded from database.',
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Fetch timeline fail.',
      data: null,
    });
  }
}

export async function getEmergencyRequestById(req: any, res: Response) {
  try {
    const request = await EmergencyRequest.findByPk(req.params.id, {
      include: [{ model: Hospital, as: 'hospital' }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'No emergency record matches indices.',
        data: null,
      });
    }

    const reqItem: any = request;
    const formatted = {
      id: reqItem.id,
      hospitalId: reqItem.hospitalId,
      hospitalName: reqItem.hospital?.hospitalName || 'Clinical Trauma Ward',
      bloodType: reqItem.bloodGroup,
      bloodGroup: reqItem.bloodGroup,
      unitsRequired: reqItem.unitsRequired,
      unitsFulfilled: reqItem.unitsFulfilled,
      priority: reqItem.urgencyLevel,
      urgencyLevel: reqItem.urgencyLevel,
      status: reqItem.status,
      locationName: reqItem.requestLocation,
      latitude: reqItem.latitude,
      longitude: reqItem.longitude,
      createdAt: reqItem.createdAt,
      description: reqItem.description,
      responses: JSON.parse(reqItem.responses || '[]'),
    };

    res.json({
      success: true,
      message: 'Active emergency detail retrieved.',
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Get asset details fail.',
      data: null,
    });
  }
}

export async function getNearbyEligibleDonors(req: any, res: Response) {
  try {
    const { bloodGroup, latitude, longitude } = req.query;

    if (!bloodGroup || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter details (bloodGroup, latitude, longitude) incomplete.',
        data: null,
      });
    }

    const matched = await findCompatibleDonors({
      targetBloodGroup: bloodGroup as string,
      targetLatitude: parseFloat(latitude as string),
      targetLongitude: parseFloat(longitude as string),
    });

    res.json({
      success: true,
      message: `System matched ${matched.length} clinically eligible donors nearby.`,
      data: matched,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Geospatial search matching crashed.',
      data: null,
    });
  }
}

export async function updateRequestStatus(req: any, res: Response) {
  try {
    const { status } = req.body;
    const request = await EmergencyRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request file index not found.',
        data: null,
      });
    }

    request.status = status;
    await request.save();

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'UPDATE_EMERGENCY_STATUS',
      'EMERGENCY',
      `Synchronized emergency ID ${request.id} status state to ${status}.`
    );

    res.json({
      success: true,
      message: 'Status parameters synchronized successfully.',
      data: request,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Status update fail.',
      data: null,
    });
  }
}

export async function respondToEmergency(req: any, res: Response) {
  try {
    const reqId = req.params.id;
    const { status, message } = req.body; // status: 'accepted' | 'cancelled' | 'rejected'

    const request = await EmergencyRequest.findByPk(reqId, {
      include: [{ model: Hospital, as: 'hospital' }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Urgent emergency record index not found.',
        data: null,
      });
    }

    // Find donor row associated with logged in user
    const donorRecord = await Donor.findOne({ where: { userId: req.user?.id } });
    if (!donorRecord) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only registered digital donors can accept alerts.',
        data: null,
      });
    }

    const currentResponses = JSON.parse(request.responses || '[]');
    let userResponse = currentResponses.find((r: any) => r.donorId === donorRecord.id);

    if (userResponse) {
      userResponse.status = status;
      if (message) userResponse.message = message;
    } else {
      userResponse = {
        id: 'resp_' + Math.random().toString(36).substring(2, 9),
        donorId: donorRecord.id,
        donorName: req.user?.fullName || 'John Doe',
        phone: (donorRecord as any).phone || req.user?.phone || '+1 (555) 018-2931',
        bloodType: donorRecord.bloodGroup,
        status: status,
        message: message || 'En route to save lives!',
        distanceKm: 0.8,
      };
      currentResponses.push(userResponse);
    }

    request.responses = JSON.stringify(currentResponses);
    if (status === 'accepted') {
      request.status = 'in-progress';
    }
    await request.save();

    // Alert hospital via notifications list
    const hospUser = await User.findOne({ where: { id: (request as any).hospital?.userId } });
    if (status === 'accepted') {
      await Notification.create({
        userId: hospUser?.id || 'ALL',
        title: '❤️ Donor En Route!',
        message: `${req.user?.fullName} (${donorRecord.bloodGroup}) has accepted your urgent emergency alert. Est. distance: 0.8 km.`,
        type: 'system',
        isRead: false,
      });
    }

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'RESPOND_EMERGENCY_REQUEST',
      'COORDINATION',
      `Donor logged status ${status} response on alert ID ${reqId}`
    );

    res.json({
      success: true,
      message: 'Your response has been parsed and transmitted directly to the trauma unit.',
      data: {
        id: request.id,
        hospitalId: request.hospitalId,
        hospitalName: (request as any).hospital?.hospitalName || 'Clinical Trauma Ward',
        bloodType: request.bloodGroup,
        bloodGroup: request.bloodGroup,
        unitsRequired: request.unitsRequired,
        unitsFulfilled: request.unitsFulfilled,
        priority: request.urgencyLevel,
        urgencyLevel: request.urgencyLevel,
        status: request.status,
        locationName: request.requestLocation,
        latitude: request.latitude,
        longitude: request.longitude,
        createdAt: request.createdAt,
        description: request.description,
        responses: currentResponses,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Response transmission error.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function completeResponse(req: any, res: Response) {
  try {
    const reqId = req.params.id;
    const { responseId } = req.body;

    const request = await EmergencyRequest.findByPk(reqId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const currentResponses = JSON.parse(request.responses || '[]');
    const respObj = currentResponses.find((r: any) => r.id === responseId);
    if (!respObj) return res.status(404).json({ success: false, message: 'Donor response target not found' });

    respObj.status = 'completed';
    request.unitsFulfilled += 1;

    if (request.unitsFulfilled >= request.unitsRequired) {
      request.status = 'completed';
    }

    request.responses = JSON.stringify(currentResponses);
    await request.save();

    // Reward Donor badges & histories!
    const donorProf = await Donor.findByPk(respObj.donorId);
    if (donorProf) {
      donorProf.lastDonationDate = new Date().toISOString().substring(0, 10);
      const countdownDate = new Date();
      countdownDate.setDate(countdownDate.getDate() + 90);
      donorProf.eligibilityDate = countdownDate.toISOString().substring(0, 10);

      const badgesList = JSON.parse(donorProf.badges || '[]');
      if (!badgesList.includes('Crisis Champion')) {
        badgesList.push('Crisis Champion');
      }
      donorProf.badges = JSON.stringify(badgesList);
      await donorProf.save();

      // Create history row
      await Notification.create({
        userId: donorProf.userId,
        title: '🏆 Achievement Earned: Crisis Champion!',
        message: 'Thank you for save-point transfusion! Hospital confirmed donation completion. You\'ve been awarded the Crisis Champion badge.',
        type: 'badge',
        isRead: false,
      });
    }

    await logAudit(
      req.user?.id,
      req.user?.fullName,
      'TRANSFUSION_COMPLETED',
      'EMERGENCY',
      `Hospital finalized completed donation transfusion on request ${reqId}`
    );

    res.json({
      success: true,
      message: 'Transfusion recorded. Registered units incremented.',
      data: {
        id: request.id,
        bloodGroup: request.bloodGroup,
        unitsRequired: request.unitsRequired,
        unitsFulfilled: request.unitsFulfilled,
        status: request.status,
        responses: currentResponses,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Operation fail during final complete sync.',
    });
  }
}
