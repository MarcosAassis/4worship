import React, { useState } from 'react';
import { X, Music, Plus, Sliders } from 'lucide-react';
import { Song } from '../types';
import { ALL_KEYS } from '../services/chordTransposer';

interface NewSongModalProps {
  onClose: () => void;
  onSave: (newSong: Song) => void;
  organizationId: string;
}

export const NewSongModal: React.FC<NewSongModalProps> = ({
  onClose,
  onSave,
  organizationId,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [defaultKey, setDefaultKey] = useState('G');
  const [bpm, setBpm] = useState<number | ''>(72);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [cifraClubUrl, setCifraClubUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('Adoração, Congregacional');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [chords, setChords] = useState(`[Intro]
[G]  [C]  [G]  [C]

[Verso]
[G]             [C]            [G]
 Te louvamos Senhor em todo o tempo
[D/F#]   [Em]         [C]            [D]
 Pois Tu és Santo e digno de louvor

[Refrão]
[C]                           [G]
 Santo, Santo, Santo é o Senhor!`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      alert('Informe o título e o artista da música.');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const newSong: Song = {
      id: `sng_${Date.now()}`,
      organizationId,
      title,
      artist,
      defaultKey,
      bpm: bpm ? Number(bpm) : undefined,
      timeSignature,
      cifraClubUrl: cifraClubUrl || undefined,
      youtubeUrl: youtubeUrl || undefined,
      spotifyUrl: spotifyUrl || undefined,
      tags: tags.length > 0 ? tags : ['Adoração'],
      technicalNotes: technicalNotes || undefined,
      chords: chords || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(newSong);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50/90 px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <span>Cadastrar Música no Repertório</span>
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 shadow-xs transition touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Título da Música *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Bondade de Deus, Leão, A Ele a Glória..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Artista / Ministério *</label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ex: Gabriela Rocha, Isaías Saad, Morada..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tom Original *</label>
              <select
                value={defaultKey}
                onChange={(e) => setDefaultKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-indigo-700 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {ALL_KEYS.map(k => (
                  <option key={k} value={k}>Tom: {k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">BPM (Tempo)</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 72"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Compasso</label>
              <input
                type="text"
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                placeholder="4/4, 6/8, 3/4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Link Cifra Club</label>
              <input
                type="url"
                value={cifraClubUrl}
                onChange={(e) => setCifraClubUrl(e.target.value)}
                placeholder="https://www.cifraclub.com.br/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Link YouTube</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Link Spotify</label>
            <input
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tags / Categorias (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Adoração, Celebração, Ceia, Congregacional..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cifra Completa com Tags de Acorde [G], [C]...</label>
            <textarea
              rows={6}
              value={chords}
              onChange={(e) => setChords(e.target.value)}
              className="w-full bg-slate-900 font-mono text-emerald-400 border border-slate-800 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Cole a letra e insira os acordes entre colchetes, ex: [G] [Em] [C] [D]"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition touch-manipulation active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Música</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
