import { Server, Socket } from 'socket.io';
import logger from '../utils/logger.js';

let ioInstance: Server | null = null;

export function initializeSockets(server: any) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    logger.info(`[Real-time Network] Client connected to live WebSocket node: ${socket.id}`);

    // Join room based on user role (e.g. 'donor', 'hospital', 'bank', etc.)
    socket.on('join_role_room', (roleName: string) => {
      if (roleName) {
        const uppercaseRoom = roleName.toUpperCase();
        socket.join(uppercaseRoom);
        logger.info(`[Socket Room] Client ${socket.id} joined role channel: ${uppercaseRoom}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Real-time Network] Client disconnected: ${socket.id}`);
    });
  });

  logger.info('[Real-time Network] Socket.IO server modules synchronized.');
  return io;
}

// Global dispatcher to broadcast live emergency dispatches
export function broadcastEmergencyAlert(requestData: any) {
  if (ioInstance) {
    logger.info(`[Broadcasting Alert] Transmitting trauma dispatch for ${requestData.bloodGroup} to donor rooms`);
    ioInstance.to('DONOR').emit('new_emergency_alert', {
      success: true,
      message: '🚨 CRITICAL EMERGENCY SHIELD IN PLAY!',
      data: requestData,
    });
    
    // Also notify active admin consoles
    ioInstance.to('ADMIN').emit('admin_dashboard_refresh', {
      action: 'NEW_EMERGENCY',
      id: requestData.id,
    });
  }
}

// Global dispatcher to refresh supply chain counters
export function broadcastInventoryUpdate(bankId: string, updatedInventory: any) {
  if (ioInstance) {
    logger.info(`[Broadcasting Update] Inventory metrics updated at clinical center ${bankId}`);
    ioInstance.emit('inventory_synchronized', {
      success: true,
      bankId,
      inventory: updatedInventory,
    });
  }
}
