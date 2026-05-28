export type UserRole = 'ADMIN' | 'HOSPITAL' | 'DONOR' | 'BLOOD_BANK';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type RequestPriority = 'critical' | 'high' | 'medium' | 'low';

export type RequestStatus = 'pending' | 'in-progress' | 'completed';

export type DonorResponseStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  locationName?: string;
  locationCoords?: { lat: number; lng: number };
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  verified: boolean;
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodType: BloodType;
  phone: string;
  latitude: number;
  longitude: number;
  locationName: string;
  lastDonationDate?: string;
  isAvailable: boolean;
  badges: string[];
  eligibilityCountdown: number; // in days
  healthQuestionnaireCompleted: boolean;
  medicalDocumentUrl?: string;
  history: DonationHistoryItem[];
}

export interface DonationHistoryItem {
  id: string;
  date: string;
  units: number;
  location: string;
  status: 'completed' | 'deferred';
  notes?: string;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  inventory: Record<BloodType, number>; // bloodType -> units
  expiryAlerts: ExpiryAlert[];
}

export interface ExpiryAlert {
  bloodType: BloodType;
  units: number;
  daysToExpiry: number;
}

export interface DonorResponse {
  id: string;
  donorId: string;
  donorName: string;
  phone: string;
  bloodType: BloodType;
  status: DonorResponseStatus;
  message?: string;
  distanceKm: number; // computed helper
}

export interface EmergencyRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: BloodType;
  unitsRequired: number;
  unitsFulfilled: number;
  priority: RequestPriority;
  status: RequestStatus;
  locationName: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  description: string;
  responses: DonorResponse[];
}

export interface Appointment {
  id: string;
  donorId: string;
  donorName: string;
  bloodType: BloodType;
  bloodBankId: string;
  bloodBankName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  qrCodeValue: string;
}

export interface BloodCamp {
  id: string;
  title: string;
  organizer: string;
  address: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  capacity: number;
  registeredCount: number;
  description: string;
}

export interface SystemNotification {
  id: string;
  userId: string; // "ALL" or specific user's id
  title: string;
  message: string;
  type: 'emergency' | 'reminder' | 'inventory' | 'badge' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AIAnalysisForecast {
  bloodShortageForecast: {
    bloodType: BloodType;
    shortageRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    predictedDaysOfSupply: number;
    explanation: string;
  }[];
  donorRecommendations: {
    bloodType: BloodType;
    recCount: number;
    targetedCampaignConcept: string;
  }[];
  generalAssessment: string;
}
