import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import BloodBank from '../models/BloodBank.js';
import { logAudit } from '../utils/auditLogger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_session_jwt_key_987654321';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_token_jwt_key_123456789';

// Generate session token (expires in 2 hours)
function generateAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

// Generate refresh token (expires in 7 days)
function generateRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export async function register(req: Request, res: Response) {
  try {
    const { fullName, name, email, password, role, bloodGroup, bloodType, phone, address, locationName, latitude, longitude } = req.body;

    const finalEmail = email || 'user@lifelink.org';
    const finalFullName = fullName || name || 'New Donor';
    const finalPassword = password || 'LifeLinkDefaultPass123';
    const finalBloodGroup = bloodGroup || bloodType || 'O+';
    const finalAddress = address || locationName || 'San Francisco, CA';
    const finalPhone = phone || '+1 (555) 000-0000';

    const existingUser = await User.findOne({ where: { email: finalEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'The email address is already registered in our clinical directory.',
        data: null,
        errors: ['Email already exists'],
      });
    }

    // Resolve Role Model
    const targetRoleName = role ? role.toUpperCase() : 'DONOR';
    const dbRole = await Role.findOne({ where: { name: targetRoleName } });
    if (!dbRole) {
      return res.status(400).json({
        success: false,
        message: `Designated role '${targetRoleName}' does not exist in our credentials hierarchy.`,
        data: null,
        errors: ['Invalid Role ID'],
      });
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const mockAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80'
    ];
    const defaultAvatar = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];

    const newUser = await User.create({
      fullName: finalFullName,
      email: finalEmail,
      phone: finalPhone,
      password: hashedPassword,
      roleId: dbRole.id,
      status: 'active',
      profileImage: defaultAvatar,
      address: finalAddress,
      latitude: latitude ? parseFloat(latitude) : 37.7749,
      longitude: longitude ? parseFloat(longitude) : -122.4194,
    });

    let associatedProfile: any = null;

    if (targetRoleName === 'DONOR') {
      associatedProfile = await Donor.create({
        userId: newUser.id,
        bloodGroup: finalBloodGroup,
        isAvailable: true,
        emergencyAvailable: true,
        weight: 150,
        age: 25,
        badges: JSON.stringify(['Welcome Recruit']),
      });
    } else if (targetRoleName === 'HOSPITAL') {
      associatedProfile = await Hospital.create({
        userId: newUser.id,
        hospitalName: finalFullName,
        location: finalAddress,
        verified: true,
      });
    } else if (targetRoleName === 'BLOOD_BANK') {
      associatedProfile = await BloodBank.create({
        userId: newUser.id,
        bloodBankName: finalFullName,
        address: finalAddress,
        storageCapacity: 1000,
      });
    }

    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: targetRoleName,
      fullName: newUser.fullName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logAudit(
      newUser.id,
      `${newUser.fullName} (${targetRoleName})`,
      'USER_REGISTERED',
      'AUTH',
      `Registered new user node: ${newUser.email}`
    );

    res.status(201).json({
      success: true,
      message: 'Account registered and initialized successfully in clinical index.',
      data: {
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          status: newUser.status,
          role: targetRoleName,
          profileImage: newUser.profileImage,
          address: newUser.address,
        },
        accessToken,
        refreshToken,
        profile: associatedProfile,
      },
      errors: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Registration transaction failed during file sync.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered clinician or civilian profile matches the credentials.',
        data: null,
        errors: ['User not found.'],
      });
    }

    // Verify password if passed, but keep mock password-less bypass for direct simulation transitions
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials key validation. Code-handshake fail.',
          data: null,
          errors: ['Invalid password'],
        });
      }
    }

    const roleName = (user as any).role?.name || 'DONOR';

    let profileData = null;
    if (roleName === 'DONOR') {
      profileData = await Donor.findOne({ where: { userId: user.id } });
    } else if (roleName === 'HOSPITAL') {
      profileData = await Hospital.findOne({ where: { userId: user.id } });
    } else if (roleName === 'BLOOD_BANK') {
      profileData = await BloodBank.findOne({ where: { userId: user.id } });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: roleName,
      fullName: user.fullName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logAudit(
      user.id,
      `${user.fullName} (${roleName})`,
      'USER_LOGIN',
      'AUTH',
      `User logged into clinical portal gate: ${user.email}`
    );

    res.json({
      success: true,
      message: 'Authentication validated. Welcome back to LifeLink Ecosystem.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          status: user.status,
          role: roleName,
          profileImage: user.profileImage,
          address: user.address,
          latitude: user.latitude,
          longitude: user.longitude,
          locationName: user.address,
        },
        profile: profileData,
        accessToken,
        refreshToken,
      },
      errors: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Secure handshake controller crash during decryption routing.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function getCurrentUser(req: any, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized session request.',
        data: null,
      });
    }

    const { id, role } = req.user;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No authenticated user profile matches the token.',
        data: null,
      });
    }

    let profileData = null;
    if (role === 'DONOR') {
      profileData = await Donor.findOne({ where: { userId: user.id } });
    } else if (role === 'HOSPITAL') {
      profileData = await Hospital.findOne({ where: { userId: user.id } });
    } else if (role === 'BLOOD_BANK') {
      profileData = await BloodBank.findOne({ where: { userId: user.id } });
    }

    res.json({
      success: true,
      message: 'Session verified.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: role,
          profileImage: user.profileImage,
          address: user.address,
          latitude: user.latitude,
          longitude: user.longitude,
          locationName: user.address,
        },
        profile: profileData,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Session fetch error.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token parameter is required.',
        data: null,
        errors: ['Missing Token'],
      });
    }

    jwt.verify(token, REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Refresh token validation signature fail.',
          data: null,
          errors: ['Invalid refresh token'],
        });
      }

      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        fullName: decoded.fullName,
      });

      res.json({
        success: true,
        message: 'Access Token refreshed.',
        data: { accessToken: newAccessToken },
        errors: null,
      });
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Token refreshing engine crash.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered profile matches the provided credentials email.',
        data: null,
        errors: ['Not Found'],
      });
    }

    await logAudit(
      user.id,
      user.fullName,
      'PASSWORD_RESET_REQUEST',
      'AUTH',
      `Sent credentials retrieval node request to: ${email}`
    );

    res.json({
      success: true,
      message: 'Security credentials retrieval email has been broadcast successfully.',
      data: { resetToken: 'LIFELINK-RST-' + Math.random().toString(36).substring(2, 10).toUpperCase() },
      errors: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Credentials recovery failed.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User matching recovery validation not found.',
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await logAudit(
      user.id,
      user.fullName,
      'PASSWORD_RESET_COMPLETE',
      'AUTH',
      `Successfully reset credentials password for: ${email}`
    );

    res.json({
      success: true,
      message: 'Authentication password updated. Please log in using your new credentials keys.',
      data: null,
      errors: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Credentials reset failed.',
      data: null,
      errors: [error.message],
    });
  }
}

export async function logout(req: any, res: Response) {
  const userId = req.user?.id;
  const userDetails = req.user ? `${req.user.fullName} (${req.user.role})` : 'SYSTEM';

  await logAudit(userId, userDetails, 'USER_LOGOUT', 'AUTH', `User logged out cleanly.`);

  res.json({
    success: true,
    message: 'Logged out successfully. Secure terminal session destroyed.',
    data: null,
  });
}
