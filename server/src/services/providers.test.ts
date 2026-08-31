import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CifraClubSearchProvider } from './cifra';
import { MusicSearchService } from './musicSearch';
import { SpotifyService, SpotifyUnavailableError } from './spotify';
import { YoutubeService } from './youtube';

describe('CifraClubSearchProvider', () => {
  it('retorna link de pesquisa sem scraping e found=false', async () => {
    const provider = new CifraClubSearchProvider();
    const result = await provider.findCifra('Legião Urbana', 'Tempo Perdido');
    assert.equal(result.found, false);
    assert.ok(result.url.includes('cifraclub.com.br'));
    assert.ok(result.url.includes(encodeURIComponent('Legião Urbana Tempo Perdido')));
    assert.equal(result.search_url, result.url);
  });
});

describe('YoutubeService fallback', () => {
  it('gera URL de pesquisa quando a API não está configurada', async () => {
    const youtube = new YoutubeService('');
    const result = await youtube.findVideo('Legião Urbana', 'Tempo Perdido');
    assert.equal(result.found, false);
    assert.equal(result.video_id, null);
    assert.ok(result.url.includes('youtube.com/results'));
    assert.ok(result.url.includes('Tempo'));
  });

  it('não quebra o resultado se a API do YouTube falhar', async () => {
    const youtube = new YoutubeService('fake-key', async () => {
      throw new Error('network down');
    });
    const result = await youtube.findVideo('Legião Urbana', 'Tempo Perdido');
    assert.equal(result.found, false);
    assert.ok(result.url.includes('youtube.com/results'));
  });

  it('só marca found quando o vídeo corresponde à música e ao artista', async () => {
    const youtube = new YoutubeService('fake-key', async () =>
      new Response(
        JSON.stringify({
          items: [
            {
              id: { videoId: 'wrong' },
              snippet: { title: 'Outra Música', channelTitle: 'Outro Canal' },
            },
            {
              id: { videoId: 'abc123' },
              snippet: {
                title: 'Legião Urbana - Tempo Perdido (Official Music Video)',
                channelTitle: 'Legião Urbana',
                thumbnails: { high: { url: 'https://i.ytimg.com/vi/abc123/hqdefault.jpg' } },
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await youtube.findVideo('Legião Urbana', 'Tempo Perdido');
    assert.equal(result.found, true);
    assert.equal(result.video_id, 'abc123');
    assert.equal(result.url, 'https://www.youtube.com/watch?v=abc123');
  });
});

describe('SpotifyService errors', () => {
  it('falha de forma explícita sem credenciais', async () => {
    const spotify = new SpotifyService('', '');
    await assert.rejects(() => spotify.searchTracks('tempo perdido'), SpotifyUnavailableError);
  });

  it('propaga indisponibilidade da API', async () => {
    const spotify = new SpotifyService('id', 'secret', async (input) => {
      const url = String(input);
      if (url.includes('accounts.spotify.com')) {
        return new Response(JSON.stringify({ access_token: 't', expires_in: 3600 }), { status: 200 });
      }
      return new Response('boom', { status: 503 });
    });
    await assert.rejects(() => spotify.searchTracks('tempo perdido'), SpotifyUnavailableError);
  });
});

describe('MusicSearchService', () => {
  it('monta resultado unificado mesmo sem cifra/vídeo encontrados', async () => {
    const spotify = new SpotifyService('id', 'secret', async (input) => {
      const url = String(input);
      if (url.includes('accounts.spotify.com')) {
        return new Response(JSON.stringify({ access_token: 't', expires_in: 3600 }), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          tracks: {
            items: [
              {
                id: 'sp1',
                name: 'Tempo Perdido',
                preview_url: null,
                external_urls: { spotify: 'https://open.spotify.com/track/sp1' },
                album: { name: 'Dois', images: [{ url: 'https://cover/dois.jpg' }] },
                artists: [{ name: 'Legião Urbana' }],
              },
              {
                id: 'sp1',
                name: 'Tempo Perdido',
                artists: [{ name: 'Legião Urbana' }],
                album: { name: 'Dois', images: [] },
                external_urls: { spotify: 'https://open.spotify.com/track/sp1' },
              },
            ],
          },
        }),
        { status: 200 },
      );
    });

    const cifra = { findCifra: async () => ({ found: false, title: 'Tempo Perdido', artist: 'Legião Urbana', url: 'https://www.cifraclub.com.br/?q=x', search_url: 'https://www.cifraclub.com.br/?q=x' }) };
    const youtube = { findVideo: async () => ({ found: false, video_id: null, url: 'https://www.youtube.com/results?search_query=x', thumbnail: null }) };

    const service = new MusicSearchService(spotify, cifra, youtube);
    const result = await service.search('Tempo Perdido');
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].title, 'Tempo Perdido');
    assert.equal(result.results[0].spotify.id, 'sp1');
    assert.equal(result.results[0].cifra.found, false);
    assert.equal(result.results[0].youtube.found, false);
    assert.ok(result.results[0].match_score >= 0.8);
  });

  it('não impede o resultado se cifra ou youtube falharem', async () => {
    const spotify = new SpotifyService('id', 'secret', async (input) => {
      const url = String(input);
      if (url.includes('accounts.spotify.com')) {
        return new Response(JSON.stringify({ access_token: 't', expires_in: 3600 }), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          tracks: {
            items: [
              {
                id: 'sp2',
                name: 'Tempo Perdido',
                artists: [{ name: 'Legião Urbana' }],
                album: { name: 'Dois', images: [] },
                external_urls: { spotify: 'https://open.spotify.com/track/sp2' },
                preview_url: null,
              },
            ],
          },
        }),
        { status: 200 },
      );
    });

    const cifra = { findCifra: async () => { throw new Error('cifra down'); } };
    const youtube = { findVideo: async () => { throw new Error('youtube down'); } };
    const service = new MusicSearchService(spotify, cifra, youtube);
    const result = await service.search('Tempo Perdido');
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].cifra.found, false);
    assert.equal(result.results[0].youtube.found, false);
  });
});
