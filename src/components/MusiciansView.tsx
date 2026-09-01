import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Check,
  X,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { User, InstrumentType, WorshipEvent, DayOfWeek, Organization } from '../types';
import { InviteCodeCard } from './InviteCodeCard';
import { UnavailabilityEditor } from './UnavailabilityEditor';

interface MusiciansViewProps {
  musicians: User[];
  events: WorshipEvent[];
  activeOrg: Organization;
  canManage: boolean;
  currentUserId: string;
  onOpenNewMusician: () => void;
  onDeleteMusician: (id: string) => void;
  onUpdateMusician: (user: User) => void;
  onRegenerateInvite: () => void;
}

const ALL_FUNCTIONS: InstrumentType[] = [
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
  'Projeção / Mídia',
];

export const MusiciansView: React.FC<MusiciansViewProps> = ({
  musicians,
  events,
  activeOrg,
  canManage,
  currentUserId,
  onOpenNewMusician,
  onDeleteMusician,
  onUpdateMusician,
  onRegenerateInvite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('ALL');

  const filteredMusicians = musicians.filter(m => {
    if (instrumentFilter === 'UNASSIGNED' && m.instruments.length > 0) {
      return false;
    }
    if (instrumentFilter !== 'ALL' && instrumentFilter !== 'UNASSIGNED' && !m.instruments.includes(instrumentFilter as InstrumentType)) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q)) ||
        m.instruments.some(inst => inst.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getMusicianScaleCount = (userId: string) => {
    return events.filter(e => e.members.some(m => m.userId === userId)).length;
  };

  const formatDayLabel = (day: DayOfWeek) => {
    switch (day) {
      case 'DOMINGO_MANHA': return 'Dom Manhã';
      case 'DOMINGO_NOITE': return 'Dom Noite';
      case 'QUARTA': return 'Quarta';
      case 'SABADO': return 'Sábado';
      case 'TERCA': return 'Terça';
      case 'QUINTA': return 'Quinta';
      case 'SEXTA': return 'Sexta';
      default: return day;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="md:hidden">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Equipe</h2>
          <p className="text-slate-500 text-xs mt-0.5">{musicians.length} voluntários</p>
        </div>

        {canManage && (
          <button
            onClick={onOpenNewMusician}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition self-start sm:self-auto sm:ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo voluntário</span>
          </button>
        )}
      </div>

      {canManage && (
        <InviteCodeCard
          org={activeOrg}
          canRegenerate
          onRegenerate={onRegenerateInvite}
        />
      )}

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail, telefone ou instrumento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <select
            aria-label="Filtrar por Instrumento ou Função"
            value={instrumentFilter}
            onChange={(e) => setInstrumentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Todos os instrumentos</option>
            <option value="UNASSIGNED">Sem função definida</option>
            {ALL_FUNCTIONS.map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Musician Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMusicians.map(musician => {
          const scalesCount = getMusicianScaleCount(musician.id);
          const cleanPhone = musician.phone ? musician.phone.replace(/\D/g, '') : null;
          const canEditAvailability = canManage || musician.id === currentUserId;

          return (
            <div
              key={musician.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4.5 hover:border-indigo-300 transition shadow-xs space-y-3.5 relative flex flex-col justify-between"
            >
              <div>
                
                {/* User Top Row: Name & Role Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      {musician.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{musician.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5 ${
                        musician.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : musician.role === 'TEAM_LEADER'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {musician.role === 'ADMIN' ? 'Administrador' : musician.role === 'TEAM_LEADER' ? 'Líder de louvor' : 'Músico'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-bold">
                    {scalesCount} {scalesCount === 1 ? 'escala' : 'escalas'}
                  </span>
                </div>

                {/* Contact: Email & WhatsApp & Phone */}
                <div className="space-y-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate max-w-[70%]">
                      <Mail className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span className="truncate text-slate-700">{musician.email}</span>
                    </div>
                    <a
                      href={`mailto:${musician.email}`}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-lg border border-slate-200 transition touch-manipulation"
                    >
                      E-mail
                    </a>
                  </div>

                  {musician.phone && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-slate-700">{musician.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 transition flex items-center space-x-1 touch-manipulation"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <span className="text-xs font-bold text-slate-500 block mb-1.5">
                    {canManage ? 'Definir função' : 'Instrumentos e funções'}
                  </span>
                  {canManage ? (
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_FUNCTIONS.map((inst) => {
                        const selected = musician.instruments.includes(inst);
                        return (
                          <button
                            key={inst}
                            type="button"
                            onClick={() => {
                              const next = selected
                                ? musician.instruments.filter((i) => i !== inst)
                                : [...musician.instruments, inst];
                              onUpdateMusician({ ...musician, instruments: next });
                            }}
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold transition ${
                              selected
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                            }`}
                          >
                            {inst}
                          </button>
                        );
                      })}
                    </div>
                  ) : musician.instruments.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {musician.instruments.map((inst) => (
                        <span
                          key={inst}
                          className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs px-2 py-0.5 rounded-md font-semibold"
                        >
                          {inst}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                      Função ainda não definida pelo líder.
                    </p>
                  )}
                </div>

                {/* Weekly Availability Matrix */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 block mb-2">
                    Disponibilidade semanal
                    {canEditAvailability ? (
                      <span className="ml-1 font-medium text-slate-400">(toque para alterar)</span>
                    ) : null}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {musician.weeklyAvailability.map(avail => {
                      const cellClass = `p-1.5 rounded-lg flex items-center justify-between border ${
                        avail.available
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-medium'
                          : 'bg-rose-50/80 border-rose-200 text-rose-900 font-medium'
                      }`;
                      const content = (
                        <>
                          <span>{formatDayLabel(avail.day)}</span>
                          {avail.available ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-rose-600" />
                          )}
                        </>
                      );
                      if (!canEditAvailability) {
                        return (
                          <div
                            key={avail.day}
                            className={cellClass}
                            title={avail.notes || (avail.available ? 'Disponível' : 'Indisponível')}
                          >
                            {content}
                          </div>
                        );
                      }
                      return (
                        <button
                          key={avail.day}
                          type="button"
                          onClick={() => {
                            onUpdateMusician({
                              ...musician,
                              weeklyAvailability: musician.weeklyAvailability.map((slot) =>
                                slot.day === avail.day
                                  ? { ...slot, available: !slot.available }
                                  : slot
                              ),
                            });
                          }}
                          className={`${cellClass} w-full text-left transition hover:opacity-90`}
                          title={avail.available ? 'Marcar como indisponível' : 'Marcar como disponível'}
                        >
                          {content}
                        </button>
                      );
                    })}
                  </div>

                  {canEditAvailability ? (
                    <UnavailabilityEditor user={musician} onUpdate={onUpdateMusician} />
                  ) : musician.blockedDates && musician.blockedDates.length > 0 ? (
                    <div className="mt-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                      Datas bloqueadas:{' '}
                      {musician.blockedDates
                        .slice()
                        .sort()
                        .map((iso) => {
                          const [y, m, d] = iso.split('-');
                          return `${d}/${m}/${y}`;
                        })
                        .join(', ')}
                    </div>
                  ) : null}
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Desde {new Date(musician.createdAt).toLocaleDateString('pt-BR')}
                </span>
                {canManage && (
                  <button
                    onClick={() => onDeleteMusician(musician.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    title="Remover músico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
