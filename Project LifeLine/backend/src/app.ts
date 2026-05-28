import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { globalRateLimiter } from './middleware/rateLimitMiddleware.js';
import { morganMiddleware } from './middleware/loggerMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import apiRouter from './routes/api.js';

const app = express();

// Trust upstream reverse proxies (e.g. Nginx, Cloud Run) for accurate rate-limiting
app.set('trust proxy', 1);

// Set up security layers
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP so that Vite server assets load smoothly inside iframe preview
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: '*', // Allow sandbox environments
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Express decoders
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request monitor middleware loggers
app.use(morganMiddleware);

// Rate limiter (restricted specifically to API endpoints to prevent throttling Vite static assets/submodules)
app.use('/api', globalRateLimiter);

// Mount API routing endpoints under `/api` namespace
app.use('/api', apiRouter);

// Serve static compiled uploads folder
const uploadsPath = path.join(process.cwd(), 'backend', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Global Error boundary handling middleware
app.use(errorHandler);

export default app;
