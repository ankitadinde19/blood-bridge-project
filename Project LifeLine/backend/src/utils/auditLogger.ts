import AuditLog from '../models/AuditLog.js';
import logger from './logger.js';

export async function logAudit(
  userId: string | undefined,
  userDetails: string | undefined,
  action: string,
  module: 'AUTH' | 'INVENTORY' | 'EMERGENCY' | 'APPOINTMENT' | 'COORDINATION',
  details: string
) {
  try {
    const timestamp = new Date().toISOString();
    await AuditLog.create({
      userId,
      userDetails,
      action,
      module,
      timestamp,
      details,
    });
    logger.info(`[Audit Logged] User: ${userDetails || 'SYSTEM'} - Action: ${action} - Module: ${module}`);
  } catch (error) {
    logger.error('Failed to write system audit trail entry:', error);
  }
}
