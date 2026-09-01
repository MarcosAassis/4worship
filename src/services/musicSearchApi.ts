import { MusicSearchErrorBody, MusicSearchHealth, MusicSearchResponse } from '../types/musicSearch';
import { apiUrl } from './apiBase';

export class MusicSearchApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'MusicSearchApiError';
  }
}

export async function fetchApiHealth(): Promise<MusicSearchHealth> {
  try {
    const response = await fetch(apiUrl('/api/health'));
    if (!response.ok) {
      return { spotify: false, youtube: false, resend: false };
    }
    return response.json();
  } catch {
    return { spotify: false, youtube: false, resend: false };
  }
}

export async function fetchMusicSearchHealth(): Promise<MusicSearchHealth> {
  return fetchApiHealth();
}

export async function searchUnifiedMusic(
  query: string,
  signal?: AbortSignal,
): Promise<MusicSearchResponse> {
  const response = await fetch(apiUrl(`/api/music/search?q=${encodeURIComponent(query)}`), { signal });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Partial<MusicSearchErrorBody>;
    throw new MusicSearchApiError(
      body.error || 'search_failed',
      body.message || 'Não foi possível buscar músicas agora.',
      response.status,
    );
  }
  return response.json();
}
