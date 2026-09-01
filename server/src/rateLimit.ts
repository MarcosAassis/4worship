import { Request } from 'express';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 30;
const hits = new Map<string, { count: number; resetAt: number }>();

export function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (value && value.trim()) {
    return value.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function consumeRateLimit(key: string): boolean {
  const now = Date.now();
  const current = hits.get(key);
  if (!current || now > current.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}
