import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../config/errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', issues: err.issues });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.code ?? 'ERROR', message: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'INTERNAL', message: 'Terjadi kesalahan pada server' });
};
