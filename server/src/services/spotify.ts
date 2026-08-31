export class SpotifyUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpotifyUnavailableError';
  }
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  artists: string[];
  album: string;
  cover: string | null;
  url: string;
  embedUrl: string;
  previewUrl: string | null;
}

interface SpotifyToken {
  accessToken: string;
  expiresAt: number;
}

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SEARCH_URL = 'https://api.spotify.com/v1/search';

export class SpotifyService {
  private token: SpotifyToken | null = null;

  constructor(
    private clientId = process.env.SPOTIFY_CLIENT_ID || '',
    private clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '',
    private fetchImpl: typeof fetch = fetch,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  async searchTracks(query: string, limit = 10): Promise<SpotifyTrack[]> {
    if (!this.isConfigured()) {
      throw new SpotifyUnavailableError(
        'Credenciais do Spotify não configuradas. Defina SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET no .env.local.',
      );
    }

    const token = await this.getAccessToken();
    const url = new URL(SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'track');
    url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), 20)));
    url.searchParams.set('market', 'BR');

    const response = await this.fetchImpl(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const detail = await safeText(response);
      throw new SpotifyUnavailableError(
        `A API do Spotify está indisponível (${response.status}). ${detail}`.trim(),
      );
    }

    const data = (await response.json()) as SpotifySearchResponse;
    const items = data.tracks?.items ?? [];
    return items.filter(Boolean).map(mapTrack);
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt - 30_000) {
      return this.token.accessToken;
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await this.fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const detail = await safeText(response);
      throw new SpotifyUnavailableError(
        `Falha na autenticação do Spotify (${response.status}). ${detail}`.trim(),
      );
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    this.token = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    return this.token.accessToken;
  }
}

interface SpotifySearchResponse {
  tracks?: {
    items?: Array<{
      id: string;
      name: string;
      preview_url: string | null;
      external_urls?: { spotify?: string };
      album?: {
        name?: string;
        images?: Array<{ url: string }>;
      };
      artists?: Array<{ name: string }>;
    } | null>;
  };
}

function mapTrack(item: NonNullable<NonNullable<SpotifySearchResponse['tracks']>['items']>[number]): SpotifyTrack {
  const artists = (item.artists ?? []).map((artist) => artist.name).filter(Boolean);
  const cover = item.album?.images?.[0]?.url ?? item.album?.images?.[1]?.url ?? null;
  return {
    id: item.id,
    name: item.name,
    artist: artists[0] || 'Artista desconhecido',
    artists,
    album: item.album?.name || '',
    cover,
    url: item.external_urls?.spotify || `https://open.spotify.com/track/${item.id}`,
    embedUrl: `https://open.spotify.com/embed/track/${item.id}`,
    previewUrl: item.preview_url ?? null,
  };
}

async function safeText(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 180);
  } catch {
    return '';
  }
}
