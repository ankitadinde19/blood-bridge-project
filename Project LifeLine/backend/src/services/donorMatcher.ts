import { Donor } from '../models/Donor.js';
import { User } from '../models/User.js';

// Haversine formula for exact distance between two sets of GPS coordinates in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth ratio in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // returns distance in km
}

// Complete Clinical Blood Group Recipient Matrix
export const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // AB+ donor can only give to AB+ recipient
};

export interface MatchingConditions {
  targetBloodGroup: string;
  targetLatitude: number;
  targetLongitude: number;
}

export async function findCompatibleDonors(conditions: MatchingConditions) {
  const { targetBloodGroup, targetLatitude, targetLongitude } = conditions;

  // Retrieve all active donors and join with user coordinates
  const donors = await Donor.findAll({
    include: [{
      model: User,
      as: 'user',
      where: { status: 'active' }
    }]
  });

  const matchingDonors = donors
    .filter((donor) => {
      // 1. Check donor blood group compatibility
      const compatibleGroups = BLOOD_COMPATIBILITY[donor.bloodGroup] || [];
      const isMatch = compatibleGroups.includes(targetBloodGroup);
      if (!isMatch) return false;

      // 2. Check if donor is globally available for emergencies
      if (!donor.emergencyAvailable) return false;

      // 3. Check physical eligibility (if last donation date exists)
      if (donor.lastDonationDate) {
        const lastDonation = new Date(donor.lastDonationDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastDonation.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 90) {
          // Under standard clinical safety window
          return false;
        }
      }

      return true;
    })
    .map((donor) => {
      const user = (donor as any).user;
      const donorLat = user?.latitude || 37.7749;
      const donorLng = user?.longitude || -122.4194;
      const distance = calculateDistance(targetLatitude, targetLongitude, donorLat, donorLng);

      return {
        id: donor.id,
        fullName: user?.fullName || 'Anonymous Donor',
        email: user?.email || '',
        phone: user?.phone || '',
        bloodGroup: donor.bloodGroup,
        lastDonationDate: donor.lastDonationDate,
        emergencyAvailable: donor.emergencyAvailable,
        weight: donor.weight,
        age: donor.age,
        badges: JSON.parse(donor.badges || '[]'),
        distanceKm: parseFloat(distance.toFixed(2)),
        latitude: donorLat,
        longitude: donorLng,
      };
    });

  // Sort matched results primarily by distance (nearest first)
  return matchingDonors.sort((a, b) => a.distanceKm - b.distanceKm);
}
