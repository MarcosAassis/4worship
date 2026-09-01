import express, { Router } from 'express';
import { MusicSearchService, SpotifyUnavailableError } from './services/musicSearch';
import { isResendConfigured, resendFromEmail, sendTransactionalEmail } from './services/email';
import { clientIp, consumeRateLimit } from './rateLimit';
import { originAllowed } from './cors';

export function createMusicApiRouter(service = MusicSearchService.fromEnv()): Router {
  const router = Router();

  const healthPayload = () => ({
    ok: true as const,
    spotify: service.isSpotifyConfigured(),
    youtube: service.isYoutubeConfigured(),
    resend: isResendConfigured(),
    fromEmail: resendFromEmail(),
  });

  router.get('/health', (_req, res) => {
    res.json(healthPayload());
  });

  router.get('/music/health', (_req, res) => {
    res.json(healthPayload());
  });

  router.get('/music/search', async (req, res) => {
    try {
      const q = String(req.query.q ?? '').trim();
      if (!q) {
        res.status(400).json({
          error: 'invalid_query',
          message: 'Informe o parâmetro q com o nome da música ou artista.',
        });
        return;
      }
      if (q.length > 120) {
        res.status(400).json({
          error: 'invalid_query',
          message: 'A busca deve ter no máximo 120 caracteres.',
        });
        return;
      }

      const payload = await service.search(q);
      res.json(payload);
    } catch (error) {
      if (error instanceof SpotifyUnavailableError) {
        res.status(503).json({
          error: 'spotify_unavailable',
          message: error.message,
        });
        return;
      }

      console.error('[music-search]', error);
      res.status(500).json({
        error: 'search_failed',
        message: 'Não foi possível concluir a busca. Tente novamente.',
      });
    }
  });

  router.post('/email/send', async (req, res) => {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
    if (process.env.NODE_ENV === 'production' && !origin) {
      res.status(403).json({
        error: 'forbidden_origin',
        message: 'Origem não autorizada.',
      });
      return;
    }
    if (origin && !originAllowed(origin)) {
      res.status(403).json({
        error: 'forbidden_origin',
        message: 'Origem não autorizada.',
      });
      return;
    }

    const ip = clientIp(req);
    if (!consumeRateLimit(`email:${ip}`)) {
      res.status(429).json({
        error: 'rate_limited',
        message: 'Muitos envios. Aguarde alguns minutos e tente novamente.',
      });
      return;
    }

    const to = String(req.body?.to ?? '');
    const subject = String(req.body?.subject ?? '');
    const html = String(req.body?.html ?? '');
    const result = await sendTransactionalEmail({ to, subject, html });
    res.status(result.success ? 200 : 400).json(result);
  });

  return router;
}

export function createMusicApiApp(service?: MusicSearchService) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '800kb' }));
  app.use(createMusicApiRouter(service ?? MusicSearchService.fromEnv()));
  return app;
}
