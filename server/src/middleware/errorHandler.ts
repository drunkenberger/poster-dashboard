import type { Request, Response, NextFunction } from 'express';
import { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 502;
    const data = err.response?.data;
    res.status(status).json({
      error: data?.message ?? err.message,
      details: data,
    });
    return;
  }

  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
}
