import { MusicSearchResponse, UnifiedMusicResult } from '../../../src/types/musicSearch';
import { MemoryCache } from './cache';
import { CifraProvider, CifraClubSearchProvider } from './cifra';
import {
  scoreQueryAgainstTrack,
  trackDedupeKey,
} from './musicMatching';
import { SpotifyService, SpotifyTrack, SpotifyUnavailableError } from './spotify';
import { YoutubeProvider, YoutubeService } from './youtube';

const RESULT_LIMIT = 5;
const SPOTIFY_FETCH_LIMIT = 12;

export { SpotifyUnavailableError };

export class MusicSearchService {
  constructor(
    private spotify: SpotifyService,
    private cifra: CifraProvider,
    private youtube: YoutubeProvider,
    private cache = new MemoryCache(),
  ) {}

  static fromEnv(): MusicSearchService {
    return new MusicSearchService(
      new SpotifyService(),
      new CifraClubSearchProvider(),
      new YoutubeService(),
    );
  }

  isSpotifyConfigured(): boolean {
    return this.spotify.isConfigured();
  }

  isYoutubeConfigured(): boolean {
    return this.youtube instanceof YoutubeService ? this.youtube.isConfigured() : false;
  }

  async search(query: string): Promise<MusicSearchResponse> {
    const q = query.trim();
    const cacheKey = `music:${q.toLowerCase()}`;
    const cached = this.cache.get<MusicSearchResponse>(cacheKey);
    if (cached) return cached;

    const tracks = await this.spotify.searchTracks(q, SPOTIFY_FETCH_LIMIT);
    const ranked = rankAndDedupe(tracks, q).slice(0, RESULT_LIMIT);

    const results = await Promise.all(ranked.map((track) => this.enrich(track)));
    const payload: MusicSearchResponse = { query: q, results };
    this.cache.set(cacheKey, payload);
    return payload;
  }

  private async enrich(track: RankedTrack): Promise<UnifiedMusicResult> {
    const [cifra, youtube] = await Promise.all([
      this.cifra.findCifra(track.artist, track.name).catch(() => ({
        found: false,
        title: track.name,
        artist: track.artist,
        url: `https://www.cifraclub.com.br/?q=${encodeURIComponent(`${track.artist} ${track.name}`)}`,
        search_url: `https://www.cifraclub.com.br/?q=${encodeURIComponent(`${track.artist} ${track.name}`)}`,
      })),
      this.youtube.findVideo(track.artist, track.name).catch(() => ({
        found: false,
        video_id: null,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artist} ${track.name}`)}`,
        thumbnail: null,
      })),
    ]);

    return {
      title: track.name,
      artist: track.artist,
      album: track.album,
      cover: track.cover,
      spotify: {
        id: track.id,
        url: track.url,
        embed_url: track.embedUrl,
        preview_url: track.previewUrl,
      },
      cifra,
      youtube,
      match_score: track.queryScore,
    };
  }
}

interface RankedTrack extends SpotifyTrack {
  queryScore: number;
}

function rankAndDedupe(tracks: SpotifyTrack[], query: string): RankedTrack[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const ranked: RankedTrack[] = [];

  for (const track of tracks) {
    if (!track?.id || seenIds.has(track.id)) continue;
    const key = trackDedupeKey(track.name, track.artist);
    if (seenKeys.has(key)) continue;
    seenIds.add(track.id);
    seenKeys.add(key);
    ranked.push({
      ...track,
      queryScore: scoreQueryAgainstTrack(query, track.name, track.artist),
    });
  }

  return ranked.sort((a, b) => {
    const exactDelta = Number(b.queryScore >= 0.95) - Number(a.queryScore >= 0.95);
    if (exactDelta !== 0) return exactDelta;
    return b.queryScore - a.queryScore;
  });
}
