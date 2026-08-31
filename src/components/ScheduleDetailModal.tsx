import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Send, 
  Music, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  MoveUp, 
  MoveDown,
  Info,
  ExternalLink,
  Sparkles,
  Phone,
  MessageSquare
} from 'lucide-react';
import { WorshipEvent, User, Song, InstrumentType, AttendanceStatus, SetlistSong, ScheduleMember } from '../types';
import { ALL_KEYS } from '../services/chordTransposer';

interface ScheduleDetailModalProps {
  event: WorshipEvent;
  allEvents: WorshipEvent[];
  allUsers: User[];
  allSongs: Song[];
  onClose: () => void;
  onSaveEvent: (updatedEvent: WorshipEvent) => void;
  onPublishAndSendEmails: (event: WorshipEvent) => void;
  onPreviewEmail: (event: WorshipEvent) => void;
  onSimulateRsvp: (event: WorshipEvent, token: string) => void;
}

const AVAILABLE_INSTRUMENTS: InstrumentType[] = [
  'Vocal Líder',
  'Backing Vocal',
  'Violão',
  'Guitarra',
  'Teclado / Piano',
  'Baixo',
  'Bateria',
  'Percussão',
  'Saxofone',
  'Mesa de Som (Áudio)',
  'Transmissão / Live',
  'Projeção / Mídia'
];

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  event,
  allEvents,
  allUsers,
  allSongs,
  onClose,
  onSaveEvent,
  onPublishAndSendEmails,
  onPreviewEmail,
  onSimulateRsvp,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'setlist' | 'info'>('members');
  
  // Local state for event
  const [currentEvent, setCurrentEvent] = useState<WorshipEvent>(event);

  // New member form state
  const [selectedUserId, setSelectedUserId] = useState<string>(allUsers[0]?.id || '');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('Vocal Líder');

  // New song form state
  const [selectedSongId, setSelectedSongId] = useState<string>(allSongs[0]?.id || '');
  const [selectedSongKey, setSelectedSongKey] = useState<string>(allSongs[0]?.defaultKey || 'G');
  const [selectedSingerId, setSelectedSingerId] = useState<string>('');
  const [songCustomNote, setSongCustomNote] = useState<string>('');

  // Conflict Validator Helper
  const checkUserConflict = (userId: string, currentEventId: string, eventDate: string, eventTime: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return null;

    // 1. Check blocked dates
    if (user.blockedDates && user.blockedDates.includes(eventDate)) {
      return {
        type: 'BLOCKED_DATE',
        message: `${user.name} bloqueou esta data (${eventDate}) por motivo pessoal.`,
      };
    }

    // 2. Check overlapping events
    const overlapping = allEvents.find(e => 
      e.id !== currentEventId &&
      e.date === eventDate &&
      e.time === eventTime &&
      e.members.some(m => m.userId === userId)
    );

    if (overlapping) {
      return {
        type: 'DOUBLE_BOOKING',
        message: `${user.name} já está escalado(a) no evento "${overlapping.title}" no mesmo horário!`,
      };
    }

    // 3. Check weekly availability
    const dateObj = new Date(`${eventDate}T00:00:00`);
    const dayOfWeekIdx = dateObj.getDay();
    let weeklyKey = '';
    if (dayOfWeekIdx === 0) {
      weeklyKey = eventTime.startsWith('0') || parseInt(eventTime.split(':')[0]) < 13 
        ? 'DOMINGO_MANHA' 
        : 'DOMINGO_NOITE';
    } else if (dayOfWeekIdx === 3) weeklyKey = 'QUARTA';
    else if (dayOfWeekIdx === 6) weeklyKey = 'SABADO';

    const avail = user.weeklyAvailability?.find(a => a.day === weeklyKey);
    if (avail && avail.available === false) {
      return {
        type: 'UNAVAILABLE',
        message: `${user.name} declarou indisponibilidade semanal para este período (${avail.notes || 'Indisponível'}).`,
      };
    }

    return null;
  };

  const currentSelectionConflict = checkUserConflict(
    selectedUserId,
    currentEvent.id,
    currentEvent.date,
    currentEvent.time
  );

  // Add Member
  const handleAddMember = () => {
    const user = allUsers.find(u => u.id === selectedUserId);
    if (!user) return;

    const alreadyInScale = currentEvent.members.some(m => m.userId === user.id && m.instrument === selectedInstrument);
    if (alreadyInScale) {
      alert('Este músico já foi adicionado para esta mesma função.');
      return;
    }

    const newMember: ScheduleMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      user: user,
      instrument: selectedInstrument,
      status: 'PENDING',
      token: `tok_${user.id.substring(0, 5)}_${Math.random().toString(36).substring(2, 9)}`,
    };

    const updated = {
      ...currentEvent,
      members: [...currentEvent.members, newMember],
    };
    setCurrentEvent(updated);
    onSaveEvent(updated);
  };

  // Remove Member
  const handleRemoveMember = (memberId: string) => {
    const updated = {
      ...currentEvent,
      members: currentEvent.members.filter(m => m.id !== memberId),
    };
    setCurrentEvent(updated);
    onSaveEvent(updated);
  };

  // Change Member Status manually
  const handleChangeMemberStatus = (memberId: string, newStatus: AttendanceStatus) => {
    const updated = {
      ...currentEvent,
      members: currentEvent.members.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            status: newStatus,
            respondedAt: new Date().toISOString(),
          };
        }
        return m;
      }),
    };
    setCurrentEvent(updated);
    onSaveEvent(updated);
  };

  // Add Song to Setlist
  const handleAddSong = () => {
    const song = allSongs.find(s => s.id === selectedSongId);
    if (!song) return;

    const newSetlistSong: SetlistSong = {
      id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      songId: song.id,
      song: song,
      assignedKey: selectedSongKey || song.defaultKey,
      leadSingerId: selectedSingerId || undefined,
      order: currentEvent.setlist.length + 1,
      customNotes: songCustomNote || undefined,
    };

    const updated = {
      ...currentEvent,
      setlist: [...currentEvent.setlist, newSetlistSong],
    };
    setCurrentEvent(updated);
    onSaveEvent(updated);
    setSongCustomNote('');
  };

  // Remove Song
  const handleRemoveSong = (setlistId: string) => {
    const remaining = currentEvent.setlist.filter(s => s.id !== setlistId);
    const reordered = remaining.map((s, idx) => ({ ...s, order: idx + 1 }));
    const updated = {
      ...currentEvent,
      setlist: reordered,
    };
    setCurrentEvent(updated);
    onSaveEvent(updated);
  };

  // Move Song Up/Down
  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    const list = [...currentEvent.setlist];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((s, idx) => ({ ...s, order: idx + 1 }));
    const updated = {
      ...currentEvent,
      setlist: reordered,
    };
    setCurrentEvent(updated);
    onSaveEvent(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl overflow-hidden my-auto flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-50/80 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-start justify-between flex-shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                Gerenciador de Escala
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                currentEvent.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {currentEvent.status === 'PUBLISHED' ? 'Publicada' : 'Rascunho'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {currentEvent.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentEvent.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentEvent.time} {currentEvent.endTime ? `às ${currentEvent.endTime}` : ''}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentEvent.location}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 shadow-xs transition touch-manipulation active:scale-95 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Subnav Tabs & Quick Actions */}
        <div className="bg-white px-4 sm:px-6 py-2 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex space-x-1 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-manipulation ${
                activeTab === 'members'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Equipe ({currentEvent.members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('setlist')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-manipulation ${
                activeTab === 'setlist'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Repertório ({currentEvent.setlist.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-manipulation ${
                activeTab === 'info'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Informações</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={() => onPreviewEmail(currentEvent)}
              className="text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs font-semibold transition touch-manipulation"
            >
              Ver convite
            </button>
            <button
              onClick={() => onPublishAndSendEmails(currentEvent)}
              className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition touch-manipulation active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar e enviar</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: MEMBERS / SCALE ROSTER */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              
              {/* Add Member Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Escalar Voluntário / Músico</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  
                  {/* Select Musician */}
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Músico / Voluntário
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {allUsers.map(user => {
                        const conflict = checkUserConflict(user.id, currentEvent.id, currentEvent.date, currentEvent.time);
                        return (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.instruments.join(', ')}) {conflict ? '⚠️ [Indisponível/Conflito]' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Select Instrument/Role */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Função no Culto
                    </label>
                    <select
                      value={selectedInstrument}
                      onChange={(e) => setSelectedInstrument(e.target.value as InstrumentType)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {AVAILABLE_INSTRUMENTS.map(inst => (
                        <option key={inst} value={inst}>
                          {inst}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Add Button */}
                  <div className="sm:col-span-3">
                    <button
                      onClick={handleAddMember}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 shadow-xs touch-manipulation active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar à Escala</span>
                    </button>
                  </div>

                </div>

                {/* Real-time Conflict Alert Box if user has conflict */}
                {currentSelectionConflict && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Aviso de Indisponibilidade:</strong>
                      <p className="mt-0.5 text-slate-700">{currentSelectionConflict.message}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Scaled Members Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Equipe Escalada ({currentEvent.members.length})
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="p-3">Voluntário</th>
                        <th className="p-3">Função</th>
                        <th className="p-3">Status de Presença</th>
                        <th className="p-3">Contato</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {currentEvent.members.map((member) => {
                        const conflict = checkUserConflict(member.userId, currentEvent.id, currentEvent.date, currentEvent.time);
                        const cleanPhone = member.user.phone ? member.user.phone.replace(/\D/g, '') : '';

                        return (
                          <tr key={member.id} className="hover:bg-slate-50/80 transition">
                            
                            {/* Member Name */}
                            <td className="p-3 font-semibold text-slate-900">
                              <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                                  {member.user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{member.user.name}</div>
                                  <div className="text-[11px] text-slate-500">{member.user.email}</div>
                                </div>
                              </div>
                              {conflict && (
                                <span className="inline-block mt-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                  ⚠️ Conflito de agenda
                                </span>
                              )}
                            </td>

                            {/* Instrument */}
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-1 rounded-md text-xs border border-slate-200">
                                {member.instrument}
                              </span>
                            </td>

                            {/* Status Dropdown */}
                            <td className="p-3">
                              <select
                                value={member.status}
                                onChange={(e) => handleChangeMemberStatus(member.id, e.target.value as AttendanceStatus)}
                                className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                                  member.status === 'CONFIRMED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : member.status === 'DECLINED'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <option value="CONFIRMED">✅ Confirmado</option>
                                <option value="PENDING">⏳ Pendente</option>
                                <option value="DECLINED">❌ Não Pode Ir</option>
                              </select>
                            </td>

                            {/* WhatsApp link */}
                            <td className="p-3">
                              {cleanPhone ? (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-md text-xs border border-emerald-200"
                                >
                                  <span>WhatsApp</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => onSimulateRsvp(currentEvent, member.token)}
                                  className="bg-white hover:bg-slate-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 shadow-xs transition"
                                  title="Abrir o convite como este voluntário veria"
                                >
                                  Ver convite
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                                  title="Remover da escala"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SETLIST / REPERTOIRE BUILDER */}
          {activeTab === 'setlist' && (
            <div className="space-y-4">
              
              {/* Add Song to Setlist */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Adicionar Música ao Repertório</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  
                  {/* Select Song */}
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Música do Catálogo
                    </label>
                    <select
                      value={selectedSongId}
                      onChange={(e) => {
                        setSelectedSongId(e.target.value);
                        const song = allSongs.find(s => s.id === e.target.value);
                        if (song) setSelectedSongKey(song.defaultKey);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {allSongs.map(song => (
                        <option key={song.id} value={song.id}>
                          {song.title} - {song.artist} (Tom padrão: {song.defaultKey})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned Key */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tom no Culto
                    </label>
                    <select
                      value={selectedSongKey}
                      onChange={(e) => setSelectedSongKey(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-indigo-700"
                    >
                      {ALL_KEYS.map(k => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lead Singer */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Vocal Principal / Solo
                    </label>
                    <select
                      value={selectedSingerId}
                      onChange={(e) => setSelectedSingerId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">(Líder de Louvor)</option>
                      {currentEvent.members
                        .filter(m => m.instrument.toLowerCase().includes('vocal'))
                        .map(m => (
                          <option key={m.userId} value={m.userId}>
                            {m.user.name} ({m.instrument})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Add Button */}
                  <div className="sm:col-span-2">
                    <button
                      onClick={handleAddSong}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition shadow-xs touch-manipulation active:scale-95"
                    >
                      Adicionar
                    </button>
                  </div>

                </div>

                {/* Optional Note for this song */}
                <div>
                  <input
                    type="text"
                    placeholder="Instruções de dinâmica para a banda (ex: Entrar suave com violão e piano, ponte explosiva)..."
                    value={songCustomNote}
                    onChange={(e) => setSongCustomNote(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Setlist List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Músicas em Ordem de Execução ({currentEvent.setlist.length})
                </h4>

                {currentEvent.setlist.length === 0 && (
                  <p className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    Nenhuma música adicionada ao repertório deste culto ainda.
                  </p>
                )}

                {currentEvent.setlist.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-indigo-200 shadow-xs transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                        {item.order}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900">{item.song.title}</h5>
                          <span className="text-xs text-slate-500">&bull; {item.song.artist}</span>
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                            Tom: {item.assignedKey}
                          </span>
                        </div>
                        {item.customNotes && (
                          <p className="text-xs text-slate-500 mt-1 italic">
                            📝 {item.customNotes}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 text-xs mt-1">
                          {item.song.cifraClubUrl && (
                            <a
                              href={item.song.cifraClubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-700 font-semibold hover:underline flex items-center space-x-1"
                            >
                              <span>🎸 Cifra Club</span>
                            </a>
                          )}
                          {item.song.youtubeUrl && (
                            <a
                              href={item.song.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-rose-700 font-semibold hover:underline flex items-center space-x-1"
                            >
                              <span>▶ YouTube</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order & Remove Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveSong(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition"
                        title="Subir música"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSong(idx, 'down')}
                        disabled={idx === currentEvent.setlist.length - 1}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition"
                        title="Descer música"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveSong(item.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        title="Remover do repertório"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: GENERAL INFO & NOTES */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Evento</label>
                  <input
                    type="text"
                    value={currentEvent.title}
                    onChange={(e) => {
                      const upd = { ...currentEvent, title: e.target.value };
                      setCurrentEvent(upd);
                      onSaveEvent(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local</label>
                  <input
                    type="text"
                    value={currentEvent.location}
                    onChange={(e) => {
                      const upd = { ...currentEvent, location: e.target.value };
                      setCurrentEvent(upd);
                      onSaveEvent(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={currentEvent.date}
                    onChange={(e) => {
                      const upd = { ...currentEvent, date: e.target.value };
                      setCurrentEvent(upd);
                      onSaveEvent(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário de Início</label>
                  <input
                    type="time"
                    value={currentEvent.time}
                    onChange={(e) => {
                      const upd = { ...currentEvent, time: e.target.value };
                      setCurrentEvent(upd);
                      onSaveEvent(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Gerais da Equipe (Passagem de som, vestimenta, avisos)
                </label>
                <textarea
                  rows={4}
                  value={currentEvent.generalNotes || ''}
                  onChange={(e) => {
                    const upd = { ...currentEvent, generalNotes: e.target.value };
                    setCurrentEvent(upd);
                    onSaveEvent(upd);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  placeholder="Ex: Passagem de som às 17h30. Vestimenta: Preto ou azul escuro..."
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50/90 px-6 py-3 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            {currentEvent.members.length} voluntários escalados &bull; {currentEvent.setlist.length} músicas no repertório
          </span>

          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-sm touch-manipulation active:scale-95"
          >
            Concluir & Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
