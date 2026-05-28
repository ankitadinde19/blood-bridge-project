import cron from 'node-cron';
import BloodInventory from '../models/BloodInventory.js';
import BloodBank from '../models/BloodBank.js';
import Notification from '../models/Notification.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import Donor from '../models/Donor.js';
import logger from '../utils/logger.js';

export function startBackgroundJobs() {
  console.log('[Chronos Engine] Scheduling system maintenance jobs...');

  // 1. Every day at midnight: Audit inventory expirations
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('[Chronos Job] Analyzing blood inventory expiration dates...');
      const today = new Date();
      
      const inventories = await BloodInventory.findAll({
        include: [{ model: BloodBank, as: 'bloodBank' }]
      });

      for (const item of inventories) {
        if (item.expiryDate) {
          const expDate = new Date(item.expiryDate);
          const diffTime = expDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // 3 days threshold: broadcast warning to regional cold bank
          if (diffDays <= 3 && diffDays > 0) {
            const warnMsg = `⚠️ EXPIRY ALERT: ${item.unitsAvailable} units of ${item.bloodGroup} are expiring in ${diffDays} days at ${(item as any).bloodBank?.bloodBankName || 'facility'}.`;
            await Notification.create({
              userId: (item as any).bloodBank?.userId || 'ALL',
              title: `Inventory Expiring Soon: ${item.bloodGroup}`,
              message: warnMsg,
              type: 'inventory',
              isRead: false,
            });
          }
        }
      }
    } catch (err) {
      logger.error('[Chronos Job Error] Inventory scan failed:', err);
    }
  });

  // 2. Every 6 hours: Escalate outstanding critical trauma dispatches
  cron.schedule('0 */6 * * *', async () => {
    try {
      logger.info('[Chronos Job] Reviewing pending emergency requests...');
      const pendingRequests = await EmergencyRequest.findAll({
        where: { status: 'pending' }
      });

      for (const reqItem of pendingRequests) {
        if (reqItem.urgencyLevel === 'critical') {
          // Escalate status notification to all system administrators
          await Notification.create({
            userId: 'ALL',
            title: `🚨 CRITICAL ESCALATION: ${reqItem.bloodGroup} trauma request unfulfilled!`,
            message: `A critical demand for ${reqItem.unitsRequired} units of ${reqItem.bloodGroup} raised by trauma unit has remained unresponded. Manual intervention recommended.`,
            type: 'emergency',
            isRead: false,
          });
        }
      }
    } catch (err) {
      logger.error('[Chronos Job Error] Emergency escalation check failed:', err);
    }
  });

  // 3. Daily: Recalculate donor eligibility states
  cron.schedule('12 0 * * *', async () => {
    try {
      logger.info('[Chronos Job] Refreshing donor clinical eligibility states...');
      const donors = await Donor.findAll();
      const today = new Date();

      for (const donor of donors) {
        if (donor.lastDonationDate) {
          const lastDonation = new Date(donor.lastDonationDate);
          const diffTime = Math.abs(today.getTime() - lastDonation.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 90 && donor.eligibilityDate) {
            // reset criteria back to active
            const nextEligibility = new Date(donor.eligibilityDate);
            if (today >= nextEligibility) {
              await Notification.create({
                userId: donor.userId,
                title: 'You are Eligible to Donate! ❤️',
                message: 'Your standard 90-day whole blood donation resting window has completed. You can schedule another reservation now.',
                type: 'reminder',
                isRead: false,
              });
            }
          }
        }
      }
    } catch (err) {
      logger.error('[Chronos Job Error] Donor eligibility update failed:', err);
    }
  });

  logger.info('[Chronos Engine] Background tasks initialized.');
}
