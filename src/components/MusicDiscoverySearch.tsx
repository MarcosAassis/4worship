import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Guitar, Loader2, Plus, Search, Youtube } from 'lucide-react';
import { Song } from '../types';
import { MusicSearchHealth, UnifiedMusicResult } from '../types/musicSearch';
import { MusicSearchApiError, fetchMusicSearchHealth, searchUnifiedMusic } from '../services/musicSearchApi';

interface MusicDiscoverySearchProps {
  songs: Song[];
  organizationId: string;
  onAddSong: (song: Song) => void;
}

export const MusicDiscoverySearch: React.FC<MusicDiscoverySearchProps> = ({
  songs,
  organizationId,
  onAddSong,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedMusicResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<MusicSearchHealth | null>(null);
  const [addedKeys, setAddedKeys] = useState<string[]>([]);

  useEffect(() => {
    fetchMusicSearchHealth().then(setHealth).catch(() => setHealth({ spotify: false, youtube: false }));
  }, []);

  const existingKeys = useMemo(
    () => new Set(songs.map((song) => `${song.title.trim().toLowerCase()}::${song.artist.trim().toLowerCase()}`)),
    [songs],
  );

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const payload = await searchUnifiedMusic(q);
      setResults(payload.results);
      if (payload.results.length === 0) {
        setError('Nenhum resultado encontrado no Spotify para esta busca.');
      }
    } catch (err) {
      setResults([]);
      if (err instanceof MusicSearchApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível concluir a busca. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item: UnifiedMusicResult) => {
    const newSong: Song = {
      id: `sng_${Date.now()}`,
      organizationId,
      title: item.title,
      artist: item.artist,
      defaultKey: 'G',
      cifraClubUrl: item.cifra.url,
      youtubeUrl: item.youtube.url,
      spotifyUrl: item.spotify.url,
      tags: ['Descoberta'],
      updatedAt: new Date().toISOString(),
    };
    onAddSong(newSong);
    setAddedKeys((prev) => [...prev, resultKey(item)]);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="mb-3">
        <h3 className="text-sm font-extrabold text-slate-900">Buscar música (Spotify, cifra e YouTube)</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Digite o nome da música, do artista ou ambos. Os 5 melhores resultados do Spotify ganham links de cifra e vídeo.
        </p>
      </div>

      {health && !health.spotify && (
        <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Configure SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET no arquivo .env.local e reinicie o servidor para ativar a busca.
        </p>
      )}

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome da música ou artista..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Buscar
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {results.map((item) => {
            const key = resultKey(item);
            const already =
              existingKeys.has(`${item.title.trim().toLowerCase()}::${item.artist.trim().toLowerCase()}`) ||
              addedKeys.includes(key);

            return (
              <article
                key={item.spotify.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row"
              >
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={`Capa de ${item.title}`}
                    className="h-24 w-24 shrink-0 rounded-xl object-cover shadow-xs sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-400 sm:h-28 sm:w-28">
                    <Search className="h-6 w-6" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <h4 className="truncate text-sm font-extrabold text-slate-900">{item.title}</h4>
                    <p className="truncate text-xs font-semibold text-slate-600">{item.artist}</p>
                    {item.album && <p className="truncate text-[11px] text-slate-400">{item.album}</p>}
                  </div>

                  <iframe
                    title={`Spotify — ${item.title}`}
                    src={`${item.spotify.embed_url}?utm_source=generator&theme=0`}
                    width="100%"
                    height="80"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="w-full overflow-hidden rounded-xl border-0"
                  />

                  <div className="flex flex-wrap gap-1.5">
                    <a
                      href={item.spotify.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800"
                    >
                      Abrir no Spotify
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href={item.cifra.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800"
                    >
                      <Guitar className="h-3 w-3" />
                      {item.cifra.found ? 'Ver cifra' : 'Buscar cifra'}
                    </a>

                    <a
                      href={item.youtube.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800"
                    >
                      <Youtube className="h-3 w-3" />
                      {item.youtube.found ? 'Assistir no YouTube' : 'Buscar no YouTube'}
                    </a>
                  </div>

                  {!item.cifra.found && (
                    <p className="text-[11px] font-semibold text-amber-700">🎸 Cifra não encontrada — abrimos a pesquisa no Cifra Club.</p>
                  )}
                  {!item.youtube.found && (
                    <p className="text-[11px] font-semibold text-rose-700">▶ Vídeo não encontrado — abrimos a pesquisa no YouTube.</p>
                  )}

                  {item.youtube.found && item.youtube.video_id && (
                    <iframe
                      title={`YouTube — ${item.title}`}
                      src={`https://www.youtube.com/embed/${item.youtube.video_id}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="aspect-video w-full rounded-xl border-0"
                    />
                  )}

                  <button
                    type="button"
                    disabled={already}
                    onClick={() => handleAdd(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {already ? 'Já no repertório' : 'Adicionar ao repertório'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

function resultKey(item: UnifiedMusicResult): string {
  return item.spotify.id;
}
