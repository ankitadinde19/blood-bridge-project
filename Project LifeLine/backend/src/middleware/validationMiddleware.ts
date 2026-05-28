import { Request, Response, NextFunction } from 'express';

const VALID_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { fullName, email, password, role, bloodGroup } = req.body;
  const errors: string[] = [];

  if (!fullName || fullName.trim().length === 0) {
    errors.push('Full name is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid unique email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters in length.');
  }

  const allowedRoles = ['DONOR', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN'];
  if (!role || !allowedRoles.includes(role.toUpperCase())) {
    errors.push(`Role must be one of: ${allowedRoles.join(', ')}`);
  }

  if (role === 'DONOR' && (!bloodGroup || !VALID_BLOOD_GROUPS.includes(bloodGroup))) {
    errors.push(`Blood group is required for Donors and must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Schema verification failed: invalid transfer format.',
      data: null,
      errors,
    });
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  const errors: string[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Email address is missing or malformed.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Authentication failed: incomplete criteria.',
      data: null,
      errors,
    });
  }

  next();
}

export function validateEmergencyRequest(req: Request, res: Response, next: NextFunction) {
  const { bloodGroup, unitsRequired, urgencyLevel, latitude, longitude } = req.body;
  const errors: string[] = [];

  if (!bloodGroup || !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push(`Blood group must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }

  const units = parseInt(unitsRequired);
  if (isNaN(units) || units < 1) {
    errors.push('Selected units required must be a valid positive integer.');
  }

  const urgencyLevels = ['critical', 'high', 'medium', 'low'];
  if (!urgencyLevel || !urgencyLevels.includes(urgencyLevel.toLowerCase())) {
    errors.push(`Urgency level must be one of: ${urgencyLevels.join(', ')}`);
  }

  if (latitude !== undefined && (isNaN(parseFloat(latitude)) || Math.abs(parseFloat(latitude)) > 90)) {
    errors.push('Hospital physical latitude must represent valid decimal coordinates [-90, 90].');
  }

  if (longitude !== undefined && (isNaN(parseFloat(longitude)) || Math.abs(parseFloat(longitude)) > 180)) {
    errors.push('Hospital physical longitude must represent valid decimal coordinates [-180, 180].');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Emergency registration error: data schema mismatch.',
      data: null,
      errors,
    });
  }

  next();
}
