import http from 'http';
import pathNode from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './backend/src/app.js';
import { initializeDatabase } from './backend/src/services/dbInitService.js';
import { startBackgroundJobs } from './backend/src/jobs/cronJobs.js';
import { initializeSockets } from './backend/src/sockets/socketHandler.js';
import logger from './backend/src/utils/logger.js';

const PORT = 3000;

async function bootstrap() {
  try {
    logger.info('[Bootstrap] Initializing LifeLink Unified Core Environment...');

    // 1. Initialize, sync and seed the SQLite / MySQL Database
    await initializeDatabase();

    // 2. Start background cron microservices
    startBackgroundJobs();

    // 3. Create HTTP Server instance
    const server = http.createServer(app);

    // 4. Bind Socket.IO channels
    initializeSockets(server);

    // 5. Build dynamic Vite Asset pipeline or serve compiled dist folders
    if (process.env.NODE_ENV !== 'production') {
      logger.info('[Bootstrap] Coupling dynamic Vite Dev Server modules...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      logger.info('[Bootstrap] Static production asset allocation binding in play...');
      const distPath = pathNode.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(pathNode.join(distPath, 'index.html'));
      });
    }

    // 6. Bind listener on Port 3000
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`⚡ [LifeLink Enterprise Engine Live] http://0.0.0.0:${PORT} under environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('CRITICAL: Unified Lifelink server boot failed during instantiation:', error);
    process.exit(1);
  }
}

bootstrap();
