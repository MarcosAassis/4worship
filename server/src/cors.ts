import { NextFunction, Request, Response } from 'express';

const DEFAULT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export function allowedOrigins(): string[] {
  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const frontend = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
  return [...new Set([...DEFAULT_ORIGINS, ...extra.map((o) => o.replace(/\/$/, '')), frontend].filter(Boolean))];
}

export function originAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  const allowed = allowedOrigins();
  if (allowed.includes(origin)) return true;
  if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && /\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}

export function applyCors(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  if (origin && originAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
