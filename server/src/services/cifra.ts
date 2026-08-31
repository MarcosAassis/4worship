import { CifraRef } from '../../../src/types/musicSearch';

export interface CifraProvider {
  findCifra(artist: string, song: string): Promise<CifraRef>;
}

/**
 * Cifra Club does not offer a public official API for third-party apps.
 * This provider only builds a search URL (no scraping, no unofficial endpoints).
 */
export class CifraClubSearchProvider implements CifraProvider {
  findCifra(artist: string, song: string): Promise<CifraRef> {
    const query = [artist, song].filter(Boolean).join(' ').trim();
    const searchUrl = `https://www.cifraclub.com.br/?q=${encodeURIComponent(query)}`;
    return Promise.resolve({
      found: false,
      title: song,
      artist,
      url: searchUrl,
      search_url: searchUrl,
    });
  }
}
