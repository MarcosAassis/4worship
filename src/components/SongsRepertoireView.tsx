import React, { useState } from 'react';
import { 
  Music, 
  Search, 
  Plus, 
  ExternalLink, 
  Youtube, 
  FileText, 
  Tag, 
  Clock, 
  Sliders,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit2,
  Minus,
  RotateCcw
} from 'lucide-react';
import { Song } from '../types';
import { ALL_KEYS, transposeTextWithChords, getSemitoneDistance, transposeChord } from '../services/chordTransposer';
import { MusicDiscoverySearch } from './MusicDiscoverySearch';

interface SongsRepertoireViewProps {
  songs: Song[];
  organizationId: string;
  onOpenNewSong: () => void;
  onSaveSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
}

export const SongsRepertoireView: React.FC<SongsRepertoireViewProps> = ({
  songs,
  organizationId,
  onOpenNewSong,
  onSaveSong,
  onDeleteSong,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedKey, setSelectedKey] = useState<string>('ALL');
  
  // Mobile active subtab: 'list' | 'preview'
  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list');

  // Selected song for active chord & lyric preview
  const [selectedSong, setSelectedSong] = useState<Song | null>(songs[0] || null);
  const [transposedKey, setTransposedKey] = useState<string>(songs[0]?.defaultKey || 'G');

  // Extract all unique tags
  const allTags = Array.from(new Set(songs.flatMap(s => s.tags)));

  // Filter songs
  const filteredSongs = songs.filter(song => {
    if (selectedTag !== 'ALL' && !song.tags.includes(selectedTag)) return false;
    if (selectedKey !== 'ALL' && song.defaultKey !== selectedKey) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setTransposedKey(song.defaultKey);
    setMobileView('preview');
  };

  // Step Transpose by semitones (+1 / -1)
  const handleShiftSemitone = (step: number) => {
    if (!selectedSong) return;
    const currentIdx = ALL_KEYS.indexOf(transposedKey);
    if (currentIdx === -1) return;
    let nextIdx = (currentIdx + step) % ALL_KEYS.length;
    if (nextIdx < 0) nextIdx += ALL_KEYS.length;
    setTransposedKey(ALL_KEYS[nextIdx]);
  };

  // Calculate transposed lyrics
  const semitoneShift = selectedSong ? getSemitoneDistance(selectedSong.defaultKey, transposedKey) : 0;
  const renderedChords = selectedSong?.chords 
    ? transposeTextWithChords(selectedSong.chords, semitoneShift) 
    : 'Nenhuma cifra cadastrada para esta música.';

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="md:hidden">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Repertório</h2>
          <p className="text-slate-500 text-xs mt-0.5">{songs.length} músicas</p>
        </div>

        <button
          onClick={onOpenNewSong}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition w-full sm:w-auto sm:ml-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova música</span>
        </button>
      </div>

      <MusicDiscoverySearch
        songs={songs}
        organizationId={organizationId}
        onAddSong={onSaveSong}
      />

      {/* Mobile Switcher (List vs Cifra) */}
      <div className="lg:hidden flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-2 text-center font-bold rounded-lg transition ${
            mobileView === 'list'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          📋 Lista ({filteredSongs.length})
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2 text-center font-bold rounded-lg transition ${
            mobileView === 'preview'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          🎸 {selectedSong ? `Cifra (${selectedSong.title.split(' ')[0]})` : 'Ver Cifra'}
        </button>
      </div>

      {/* Search & Filters */}
      <div className={`${mobileView === 'list' ? 'block' : 'hidden lg:block'} bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5`}>
        <div className="flex flex-col sm:flex-row gap-2.5">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar música por título, cantor, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <select
              aria-label="Filtrar por Tom Original"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Todos os Tons</option>
              {ALL_KEYS.map(k => (
                <option key={k} value={k}>Tom: {k}</option>
              ))}
            </select>

            <select
              aria-label="Filtrar por Categoria"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Todas Categorias</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Split Grid: Left Catalog + Right Live Chord Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Songs List */}
        <div className={`${mobileView === 'list' ? 'block' : 'hidden lg:block'} lg:col-span-5 space-y-2.5`}>
          {filteredSongs.map(song => {
            const isSelected = selectedSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer relative touch-manipulation active:scale-[0.99] ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-500 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                      {song.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{song.artist}</p>
                  </div>

                  <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-black px-2.5 py-1 rounded-lg">
                    {song.defaultKey}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
                  {song.bpm && <span>BPM: <strong className="text-slate-700">{song.bpm}</strong></span>}
                  {song.timeSignature && <span>Compasso: <strong className="text-slate-700">{song.timeSignature}</strong></span>}
                  
                  {song.cifraClubUrl && (
                    <span className="text-amber-700 font-bold">🎸 CifraClub</span>
                  )}
                  {song.youtubeUrl && (
                    <span className="text-rose-700 font-bold">▶ Vídeo</span>
                  )}
                </div>

                {song.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {song.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredSongs.length === 0 && (
            <div className="p-8 text-center border border-dashed border-slate-300 rounded-2xl bg-white space-y-2">
              <Music className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Nenhuma música encontrada.</p>
              <button
                onClick={onOpenNewSong}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                + Cadastrar nova música
              </button>
            </div>
          )}
        </div>

        {/* Selected Song Viewer & Real-time Transposer */}
        <div className={`${mobileView === 'preview' ? 'block' : 'hidden lg:block'} lg:col-span-7`}>
          {selectedSong ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 sticky top-20 shadow-xs">
              
              {/* Mobile back button */}
              <div className="lg:hidden flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  onClick={() => setMobileView('list')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>← Voltar para lista</span>
                </button>
              </div>

              {/* Song Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-md border border-indigo-200">
                      Tom Original: {selectedSong.defaultKey}
                    </span>
                    {selectedSong.bpm && (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {selectedSong.bpm} BPM
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedSong.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedSong.artist}</p>
                </div>

                {/* External Links */}
                <div className="flex items-center space-x-2">
                  {selectedSong.cifraClubUrl && (
                    <a
                      href={selectedSong.cifraClubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg transition font-bold touch-manipulation"
                    >
                      <span>Cifra Club</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {selectedSong.youtubeUrl && (
                    <a
                      href={selectedSong.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg transition font-bold touch-manipulation"
                    >
                      <Youtube className="w-3.5 h-3.5 text-rose-600" />
                      <span>YouTube</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Real-time Tone Transposer Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Transposição de Tom:</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Semitone down */}
                  <button
                    onClick={() => handleShiftSemitone(-1)}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-bold text-xs shadow-xs touch-manipulation active:scale-95"
                    title="Diminuir 1 semitom (-1)"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <select
                    aria-label="Selecionar Tom Transposto"
                    value={transposedKey}
                    onChange={(e) => setTransposedKey(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                  >
                    {ALL_KEYS.map(k => (
                      <option key={k} value={k}>
                        Tom: {k} {k === selectedSong.defaultKey ? '(Original)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Semitone up */}
                  <button
                    onClick={() => handleShiftSemitone(1)}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-bold text-xs shadow-xs touch-manipulation active:scale-95"
                    title="Aumentar 1 semitom (+1)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {transposedKey !== selectedSong.defaultKey && (
                    <button
                      onClick={() => setTransposedKey(selectedSong.defaultKey)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 ml-1 touch-manipulation"
                      title="Voltar ao tom original"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Original</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Technical Notes if any */}
              {selectedSong.technicalNotes && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900">
                  <strong className="font-bold text-indigo-900">📝 Instruções de Arranjo & Dinâmica:</strong>
                  <p className="mt-1 text-slate-700 leading-relaxed">{selectedSong.technicalNotes}</p>
                </div>
              )}

              {/* Cifra & Chords Display with High Readability */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-800">Cifra no Tom {transposedKey}:</span>
                  <span className="text-[11px] text-slate-400">cifra transposta</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed selection:bg-indigo-500 selection:text-white shadow-inner">
                  {renderedChords}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
              <Music className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">Selecione uma música da lista para ver a cifra e transposição.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
