import { YoutubeRef } from '../../../src/types/musicSearch';
import { isAutoMatch, matchScore, textSimilarity, youtubeBoost } from './musicMatching';

export interface YoutubeProvider {
  findVideo(artist: string, song: string): Promise<YoutubeRef>;
}

interface YoutubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
}

export class YoutubeService implements YoutubeProvider {
  constructor(
    private apiKey = process.env.YOUTUBE_API_KEY || '',
    private fetchImpl: typeof fetch = fetch,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async findVideo(artist: string, song: string): Promise<YoutubeRef> {
    const searchUrl = youtubeSearchUrl(artist, song);
    if (!this.isConfigured()) {
      return {
        found: false,
        video_id: null,
        url: searchUrl,
        thumbnail: null,
      };
    }

    try {
      const query = `${artist} ${song} official`;
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('type', 'video');
      url.searchParams.set('maxResults', '5');
      url.searchParams.set('q', query);
      url.searchParams.set('key', this.apiKey);

      const response = await this.fetchImpl(url.toString());
      if (!response.ok) {
        return {
          found: false,
          video_id: null,
          url: searchUrl,
          thumbnail: null,
        };
      }

      const data = (await response.json()) as { items?: YoutubeSearchItem[] };
      const ranked = (data.items ?? [])
        .map((item) => {
          const videoId = item.id?.videoId;
          const title = item.snippet?.title || '';
          const channel = item.snippet?.channelTitle || '';
          if (!videoId) return null;
          const structured = matchScore({
            songA: song,
            artistA: artist,
            songB: title,
            artistB: channel,
          });
          const combined = textSimilarity(`${artist} ${song}`, title);
          const score = Math.max(structured, combined) + youtubeBoost(title, channel, artist);
          return { videoId, title, channel, score, item };
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row))
        .sort((a, b) => b.score - a.score);

      const best = ranked[0];
      if (!best || !isAutoMatch(best.score)) {
        return {
          found: false,
          video_id: null,
          url: searchUrl,
          thumbnail: null,
        };
      }

      const thumb =
        best.item.snippet?.thumbnails?.high?.url ||
        best.item.snippet?.thumbnails?.medium?.url ||
        best.item.snippet?.thumbnails?.default?.url ||
        `https://i.ytimg.com/vi/${best.videoId}/hqdefault.jpg`;

      return {
        found: true,
        video_id: best.videoId,
        url: `https://www.youtube.com/watch?v=${best.videoId}`,
        thumbnail: thumb,
        title: best.title,
        channel: best.channel,
      };
    } catch {
      return {
        found: false,
        video_id: null,
        url: searchUrl,
        thumbnail: null,
      };
    }
  }
}

export function youtubeSearchUrl(artist: string, song: string): string {
  const query = [artist, song].filter(Boolean).join(' ').trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
