import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Global Error Middleware] Caught error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred within the Clinical Network.';
  const errors = err.errors || [err.stack || 'Internal Server Error'];

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: process.env.NODE_ENV === 'production' ? ['Emergency core error'] : errors,
  });
}
