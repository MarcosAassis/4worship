import express, { Router } from 'express';
import { MusicSearchService, SpotifyUnavailableError } from './services/musicSearch';

export function createMusicApiRouter(service = MusicSearchService.fromEnv()): Router {
  const router = Router();

  router.get('/music/health', (_req, res) => {
    res.json({
      spotify: service.isSpotifyConfigured(),
      youtube: service.isYoutubeConfigured(),
    });
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

  return router;
}

export function createMusicApiApp(service?: MusicSearchService) {
  const app = express();
  app.disable('x-powered-by');
  app.use(createMusicApiRouter(service ?? MusicSearchService.fromEnv()));
  return app;
}
