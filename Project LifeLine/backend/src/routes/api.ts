import { Router } from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  refreshToken, 
  forgotPassword, 
  resetPassword, 
  logout 
} from '../controllers/authController.js';
import { 
  getAllDonors, 
  getDonorById, 
  createDonor, 
  updateDonor, 
  deleteDonor, 
  getEligibleDonors 
} from '../controllers/donorController.js';
import { 
  createEmergencyRequest, 
  getAllEmergencyRequests, 
  getEmergencyRequestById, 
  getNearbyEligibleDonors, 
  updateRequestStatus, 
  respondToEmergency, 
  completeResponse 
} from '../controllers/emergencyController.js';
import { 
  getInventory, 
  addInventory, 
  updateInventory, 
  deleteInventory, 
  getLowStockAlerts 
} from '../controllers/inventoryController.js';
import { 
  bookAppointment, 
  getAllAppointments, 
  updateAppointmentStatus, 
  cancelAppointment 
} from '../controllers/appointmentController.js';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllRead 
} from '../controllers/notificationController.js';
import { 
  getAllCamps, 
  registerForCamp, 
  createCamp 
} from '../controllers/campsController.js';
import { 
  getForecast, 
  handleChatbot 
} from '../controllers/geminiController.js';
import { 
  getAuditLogs, 
  getHospitals, 
  onboardHospital 
} from '../controllers/adminController.js';

import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin, validateEmergencyRequest } from '../middleware/validationMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// ==========================================
// 1. AUTHENTICATION MODULE ENDPOINTS
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', authRateLimiter, validateLogin, login);
router.post('/auth/logout', authenticateJWT, logout);
router.post('/auth/refresh-token', refreshToken);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/me', authenticateJWT, getCurrentUser);

// ==========================================
// 2. EMERGENCY DISPATCH MODULE ENDPOINTS
// ==========================================
// Dual alignment support for both REST specification and React frontend fetching:
router.post('/emergency/create', authenticateJWT, validateEmergencyRequest, createEmergencyRequest);
router.post('/emergency-requests', authenticateJWT, validateEmergencyRequest, createEmergencyRequest);

router.get('/emergency/all', getAllEmergencyRequests);
router.get('/emergency-requests', getAllEmergencyRequests);

router.get('/emergency/nearby-donors', authenticateJWT, getNearbyEligibleDonors);

// Ensure registration order puts static qualifiers first
router.get('/emergency/completed/:id', authenticateJWT, completeResponse);
router.post('/emergency-requests/:id/complete-response', authenticateJWT, completeResponse);

router.put('/emergency/status/:id', authenticateJWT, updateRequestStatus);
router.post('/emergency-requests/:id/respond', authenticateJWT, respondToEmergency);

router.get('/emergency/:id', getEmergencyRequestById);
router.get('/emergency-requests/:id', getEmergencyRequestById);

// ==========================================
// 3. SECURE CIVILIAN DONOR MODULE ENDPOINTS
// ==========================================
// Static qualifiers must precede dynamic parameters
router.get('/donors/eligible/list', getEligibleDonors);
router.get('/donors', getAllDonors);
router.get('/donors/:id', getDonorById);
router.post('/donors', authenticateJWT, createDonor);
router.put('/donors/:id', authenticateJWT, updateDonor);
router.delete('/donors/:id', authenticateJWT, requireRole(['ADMIN']), deleteDonor);

// ==========================================
// 4. COLD SUPPLIES INVENTORY MODULE ENDPOINTS
// ==========================================
router.get('/inventory', getInventory);
router.get('/inventory/low-stock', getLowStockAlerts);
router.post('/inventory/add', authenticateJWT, addInventory);
router.put('/inventory/update/:id', authenticateJWT, updateInventory);
router.post('/inventory/update', authenticateJWT, updateInventory); // Backwards compatibility QUICK update callback
router.delete('/inventory/:id', authenticateJWT, deleteInventory);

// ==========================================
// 5. DONATION RESERVATIONS APPOINTMENTS
// ==========================================
router.post('/appointments/book', authenticateJWT, bookAppointment);
router.post('/appointments', authenticateJWT, bookAppointment); // Backwards compatibility for frontend booking
router.get('/appointments', getAllAppointments);
router.post('/appointments/:id/status', authenticateJWT, updateAppointmentStatus);
router.delete('/appointments/:id', authenticateJWT, cancelAppointment);

// ==========================================
// 6. SYSTEM ALERTS NOTIFICATIONS PIPELINE
// ==========================================
router.get('/notifications', authenticateJWT, getMyNotifications);
router.put('/notifications/read/:id', authenticateJWT, markAsRead);
router.post('/notifications/read-all', authenticateJWT, markAllRead);

// ==========================================
// 7. COMMUNITY CAMERAS BLOOD DRIVES
// ==========================================
router.get('/camps', getAllCamps);
router.post('/camps', authenticateJWT, createCamp);
router.post('/camps/:id/register', authenticateJWT, registerForCamp);

// ==========================================
// 8. GEMINI INTELLIGENCE DOME DYNAMICS
// ==========================================
router.get('/gemini/forecast', getForecast);
router.post('/gemini/chatbot', handleChatbot);

// ==========================================
// 9. SUPERVISOR OPERATIONS AUDIT MODULE
// ==========================================
router.get('/audit-logs', authenticateJWT, getAuditLogs);
router.get('/hospitals', getHospitals);
router.post('/hospitals', authenticateJWT, onboardHospital);

export default router;
