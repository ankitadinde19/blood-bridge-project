import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_session_jwt_key_987654321';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No session authorization token provided.',
      data: null,
      errors: ['No token provided'],
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: JWT Token form must be "Bearer <token>".',
      data: null,
      errors: ['Token malformed'],
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; fullName: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Session Expired or Refused: Handshake validation signature mismatch.',
      data: null,
      errors: ['Invalid or expired JWT token.'],
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access: Login required.',
        data: null,
        errors: ['User unauthenticated'],
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Security Guard: Your profile credentials do not have clearances for this clinical command node.',
        data: null,
        errors: [`Required roles: ${allowedRoles.join(', ')}. Yours: ${req.user.role}`],
      });
    }

    next();
  };
}
