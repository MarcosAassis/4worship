import type { Plugin } from 'vite';
import { createMusicApiApp } from './src/api';

export function musicApiPlugin(): Plugin {
  return {
    name: 'music-search-api',
    configureServer(server) {
      server.middlewares.use('/api', createMusicApiApp());
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api', createMusicApiApp());
    },
  };
}
