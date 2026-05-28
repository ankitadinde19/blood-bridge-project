import { Response } from 'express';
import Notification from '../models/Notification.js';

export async function getMyNotifications(req: any, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ success: true, data: [] });
    }

    const notifications = await Notification.findAll({
      where: {
        userId: [userId, 'ALL'] // fetch both specific and broadcast notifications
      },
      order: [['createdAt', 'DESC']],
    });

    // Format to match the exact frontend schema expectancies
    const formatted = notifications.map((n: any) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.isRead,
      createdAt: n.createdAt,
    }));

    res.json({
      success: true,
      message: 'Coordinated notifications list decoded.',
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to extract security feeds.',
      data: [],
    });
  }
}

export async function markAsRead(req: any, res: Response) {
  try {
    const notifRow = await Notification.findByPk(req.params.id);
    if (!notifRow) {
      return res.status(404).json({
        success: false,
        message: 'Notification block index not found.',
        data: null,
      });
    }

    notifRow.isRead = true;
    await notifRow.save();

    res.json({
      success: true,
      message: 'Logged alert flag flipped to READ.',
      data: { id: notifRow.id, read: true },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Status save failure.',
    });
  }
}

export async function markAllRead(req: any, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ success: true });

    await Notification.update(
      { isRead: true },
      { where: { userId } }
    );

    res.json({
      success: true,
      message: 'All notifications cleared.',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Clear operation failed.',
    });
  }
}
