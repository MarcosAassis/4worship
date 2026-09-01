export interface SpotifyTrackRef {
  id: string;
  url: string;
  embed_url: string;
  preview_url: string | null;
}

export interface CifraRef {
  found: boolean;
  title: string;
  artist: string;
  url: string;
  search_url: string;
}

export interface YoutubeRef {
  found: boolean;
  video_id: string | null;
  url: string;
  thumbnail: string | null;
  title?: string;
  channel?: string;
}

export interface UnifiedMusicResult {
  title: string;
  artist: string;
  album: string;
  cover: string | null;
  spotify: SpotifyTrackRef;
  cifra: CifraRef;
  youtube: YoutubeRef;
  match_score: number;
}

export interface MusicSearchResponse {
  query: string;
  results: UnifiedMusicResult[];
}

export interface MusicSearchErrorBody {
  error: string;
  message: string;
}

export interface MusicSearchHealth {
  ok?: boolean;
  spotify: boolean;
  youtube: boolean;
  resend?: boolean;
  fromEmail?: string;
}
