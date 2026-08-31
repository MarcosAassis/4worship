import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Plus, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  Share2, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  Music,
  ChevronRight,
  Sparkles,
  Search,
  Users
} from 'lucide-react';
import { WorshipEvent } from '../types';

interface SchedulesViewProps {
  events: WorshipEvent[];
  onSelectEvent: (event: WorshipEvent) => void;
  onOpenNewEvent: () => void;
  onPublishAndSendEmails: (event: WorshipEvent) => void;
  onPreviewEmail: (event: WorshipEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  events,
  onSelectEvent,
  onOpenNewEvent,
  onPublishAndSendEmails,
  onPreviewEmail,
  onDeleteEvent,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEvents = events.filter(evt => {
    if (filter === 'PUBLISHED' && evt.status !== 'PUBLISHED') return false;
    if (filter === 'DRAFT' && evt.status !== 'DRAFT') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.date.includes(q) ||
        evt.leaderName.toLowerCase().includes(q) ||
        evt.members.some(m => m.user.name.toLowerCase().includes(q) || m.instrument.toLowerCase().includes(q))
      );
    }
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const handleShareWhatsApp = (evt: WorshipEvent) => {
    const text = `*🎸 ESCALA DE LOUVOR: ${evt.title}*\n📅 Data: ${evt.date} às ${evt.time}\n📍 Local: ${evt.location}\n👤 Líder: ${evt.leaderName}\n\n*👥 Equipe Escalada:*\n${evt.members.map(m => `• ${m.user.name} - ${m.instrument} [${m.status === 'CONFIRMED' ? '✅ Confirmado' : m.status === 'DECLINED' ? '❌ Recusou' : '⏳ Pendente'}]`).join('\n')}\n\n*🎵 Repertório:* ${evt.setlist.length} músicas selecionadas.`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(evt.id);
      setTimeout(() => setCopiedId(null), 2500);
    }

    // Direct WhatsApp share on mobile / web
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile 
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Helper to format date nicely
  const formatDateBadge = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const weekDay = date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
      return { weekDay, day, monthName };
    } catch {
      return { weekDay: 'CULTO', day: '00', monthName: 'DATA' };
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:hidden">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Escalas</h2>
          <p className="text-slate-500 text-xs mt-0.5">{filteredEvents.length} cultos no calendário</p>
        </div>
        <button
          onClick={onOpenNewEvent}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nova escala</span>
        </button>
      </div>
      <div className="hidden md:flex justify-end">
        <button
          onClick={onOpenNewEvent}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nova escala</span>
        </button>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Filter Segmented Control */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({events.length})
          </button>
          <button
            onClick={() => setFilter('PUBLISHED')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'PUBLISHED'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Publicadas ({events.filter(e => e.status === 'PUBLISHED').length})
          </button>
          <button
            onClick={() => setFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'DRAFT'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rascunhos ({events.filter(e => e.status === 'DRAFT').length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por culto, músico, data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

      </div>

      {/* Events List Cards */}
      <div className="space-y-3.5">
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
              📅
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhuma escala encontrada</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nenhuma escala coincide com os filtros atuais. Crie uma nova escala ou ajuste os termos de busca.
            </p>
            <button
              onClick={onOpenNewEvent}
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Nova Escala</span>
            </button>
          </div>
        ) : (
          filteredEvents.map(evt => {
            const dateBadge = formatDateBadge(evt.date);
            
            const confirmedCount = evt.members.filter(m => m.status === 'CONFIRMED').length;
            const pendingCount = evt.members.filter(m => m.status === 'PENDING').length;
            const declinedCount = evt.members.filter(m => m.status === 'DECLINED').length;
            const isAllConfirmed = evt.members.length > 0 && confirmedCount === evt.members.length;

            return (
              <div
                key={evt.id}
                className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group relative flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                
                {/* Left side: Date Badge + Info + Team + Songs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                  
                  {/* Date Tile */}
                  <div className="flex sm:flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-center min-w-[76px] flex-shrink-0">
                    <span className="text-[10px] font-black text-indigo-600 tracking-wider">
                      {dateBadge.weekDay}
                    </span>
                    <span className="text-2xl font-black text-indigo-950 leading-none my-0.5 px-2 sm:px-0">
                      {dateBadge.day}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700">
                      {dateBadge.monthName}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    
                    {/* Header line: Title & Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 
                        onClick={() => onSelectEvent(evt)}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer"
                      >
                        {evt.title}
                      </h3>
                      
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        evt.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {evt.status === 'PUBLISHED' ? 'Publicada' : 'Rascunho'}
                      </span>

                      {isAllConfirmed ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>100% Confirmada</span>
                        </span>
                      ) : pendingCount > 0 ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <Clock3 className="w-3 h-3 text-amber-600" />
                          <span>{pendingCount} Pendentes</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Metadata line: Time, Location, Leader */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.time} {evt.endTime ? `às ${evt.endTime}` : ''}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.location}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-medium text-slate-700">
                        <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Líder: {evt.leaderName}</span>
                      </span>
                    </div>

                    {/* Team Preview Roster Chips */}
                    <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1 mr-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Equipe ({evt.members.length}):</span>
                      </span>
                      {evt.members.map((mem) => {
                        const statusDotColor = 
                          mem.status === 'CONFIRMED' ? 'bg-emerald-500' :
                          mem.status === 'DECLINED' ? 'bg-rose-500' : 'bg-amber-400';
                        
                        return (
                          <div 
                            key={mem.id}
                            className="inline-flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] text-slate-700"
                            title={`${mem.user.name} - ${mem.instrument} (${mem.status === 'CONFIRMED' ? 'Confirmado' : mem.status === 'DECLINED' ? 'Recusou' : 'Pendente'})`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
                            <span className="font-semibold">{mem.user.name.split(' ')[0]}</span>
                            <span className="text-slate-400 font-normal">({mem.instrument.split(' ')[0]})</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Setlist Song Badges */}
                    {evt.setlist.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-slate-400 flex items-center space-x-1 mr-1">
                          <Music className="w-3 h-3 text-indigo-500" />
                          <span>Repertório ({evt.setlist.length}):</span>
                        </span>
                        {evt.setlist.slice(0, 4).map((item) => (
                          <span 
                            key={item.id}
                            className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-md px-1.5 py-0.5 font-medium"
                          >
                            <span>{item.song.title}</span>
                            <span className="font-bold text-indigo-600 text-[10px]">[{item.assignedKey}]</span>
                          </span>
                        ))}
                        {evt.setlist.length > 4 && (
                          <span className="text-slate-400 font-semibold text-[10px]">
                            +{evt.setlist.length - 4} mais
                          </span>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Right side: Primary Action & Quick Tools */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-shrink-0">
                  
                  {/* Big Primary Button */}
                  <button
                    onClick={() => onSelectEvent(evt)}
                    className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition touch-manipulation active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Gerenciar Escala</span>
                  </button>

                  {/* Secondary Tools Row */}
                  <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
                    
                    <button
                      onClick={() => onPublishAndSendEmails(evt)}
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition touch-manipulation"
                      title="Enviar convites por e-mail para a equipe"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Convites</span>
                    </button>

                    {/* Ver E-mail Preview */}
                    <button
                      onClick={() => onPreviewEmail(evt)}
                      className="flex items-center justify-center space-x-1 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 transition shadow-xs touch-manipulation"
                      title="Visualizar o template do e-mail"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Share WhatsApp */}
                    <button
                      onClick={() => handleShareWhatsApp(evt)}
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 bg-emerald-600 text-white hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs touch-manipulation active:scale-95"
                      title="Copiar e abrir mensagem formatada para o grupo do WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedId === evt.id ? 'Copiado!' : 'WhatsApp'}</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Excluir evento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
