import React from 'react';
import { MinistryLogo } from './MinistryLogo';
import {
  Calendar,
  Users,
  Music2,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { WorshipEvent, Song, User, Organization, AppTab } from '../types';

interface DashboardOverviewProps {
  events: WorshipEvent[];
  songs: Song[];
  musicians: User[];
  activeOrg: Organization;
  currentUserName: string;
  canManage: boolean;
  onOpenNewEvent: () => void;
  onOpenNewSong: () => void;
  onSelectEvent: (event: WorshipEvent) => void;
  onNavigateToTab: (tab: AppTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  events,
  songs,
  musicians,
  activeOrg,
  currentUserName,
  canManage,
  onOpenNewEvent,
  onOpenNewSong,
  onSelectEvent,
  onNavigateToTab,
}) => {
  let totalPositions = 0;
  let confirmedPositions = 0;
  let pendingPositions = 0;
  let declinedPositions = 0;

  events.forEach((evt) => {
    evt.members.forEach((mem) => {
      totalPositions++;
      if (mem.status === 'CONFIRMED') confirmedPositions++;
      else if (mem.status === 'PENDING') pendingPositions++;
      else if (mem.status === 'DECLINED') declinedPositions++;
    });
  });

  const confirmationRate =
    totalPositions > 0 ? Math.round((confirmedPositions / totalPositions) * 100) : 0;

  const upcoming = events
    .filter((e) => e.status !== 'COMPLETED')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const attentionEvents = events.filter((e) =>
    e.members.some((m) => m.status === 'DECLINED' || m.status === 'PENDING')
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = currentUserName.replace(' (Você)', '').split(' ')[0];

  const formatDay = (dateStr: string) => dateStr.split('-')[2];
  const formatMonth = (dateStr: string) => {
    const [, m] = dateStr.split('-');
    const date = new Date(2000, parseInt(m) - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-[#0c1222] px-6 py-7 text-white shadow-sm sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-xl items-start gap-4">
            <MinistryLogo
              org={activeOrg}
              size="lg"
              className="ring-1 ring-white/15 shadow-lg shadow-black/25"
            />
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/90">
                {greeting}, {firstName}
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{activeOrg.name}</h2>
              <p className="text-sm leading-relaxed text-white/60">
                {activeOrg.churchName} · acompanhe escalas, repertório e confirmações da equipe em um só lugar.
              </p>
            </div>
          </div>

          {canManage && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenNewEvent}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400"
            >
              <Plus className="h-4 w-4" />
              Nova escala
            </button>
            <button
              onClick={onOpenNewSong}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              <Music2 className="h-4 w-4 text-amber-300" />
              Nova música
            </button>
          </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          onClick={() => onNavigateToTab('schedules')}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition hover:border-indigo-200 hover:shadow-sm"
        >
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
            <Calendar className="h-3.5 w-3.5" /> Escalas
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight">{events.length}</p>
          <p className="mt-0.5 text-xs text-slate-500">cultos no calendário</p>
        </button>

        <button
          onClick={() => onNavigateToTab('schedules')}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition hover:border-emerald-200 hover:shadow-sm"
        >
          <p className="flex items-center justify-between text-[11px] font-semibold text-emerald-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirmações
            </span>
            <span>{confirmationRate}%</span>
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight">{confirmedPositions}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {pendingPositions} pendentes · {declinedPositions} recusas
          </p>
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="bg-emerald-500" style={{ width: `${confirmationRate}%` }} />
            <div
              className="bg-amber-400"
              style={{ width: `${totalPositions ? (pendingPositions / totalPositions) * 100 : 0}%` }}
            />
            <div
              className="bg-rose-400"
              style={{ width: `${totalPositions ? (declinedPositions / totalPositions) * 100 : 0}%` }}
            />
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab('songs')}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition hover:border-violet-200 hover:shadow-sm"
        >
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-600">
            <Music2 className="h-3.5 w-3.5" /> Repertório
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight">{songs.length}</p>
          <p className="mt-0.5 text-xs text-slate-500">músicas cadastradas</p>
        </button>

        <button
          onClick={() => onNavigateToTab('musicians')}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition hover:border-sky-200 hover:shadow-sm"
        >
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-600">
            <Users className="h-3.5 w-3.5" /> Equipe
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight">{musicians.length}</p>
          <p className="mt-0.5 text-xs text-slate-500">voluntários ativos</p>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Próximas escalas</h3>
            <button
              onClick={() => onNavigateToTab('schedules')}
              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcoming.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">Nenhum culto agendado.</p>
            )}
            {upcoming.map((evt) => {
              const confirmed = evt.members.filter((m) => m.status === 'CONFIRMED').length;
              return (
                <button
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 text-left transition hover:border-indigo-200 hover:bg-white"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-800">
                    <span className="text-[9px] font-bold uppercase">
                      {formatMonth(evt.date)}
                    </span>
                    <span className="text-lg font-black leading-none">{formatDay(evt.date)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{evt.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {evt.time}
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{evt.location}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        evt.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {evt.status === 'PUBLISHED' ? 'Publicada' : 'Rascunho'}
                    </span>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {confirmed}/{evt.members.length} ok
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Precisa de atenção</h3>
          </div>

          {attentionEvents.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Tudo em dia na equipe.</p>
          ) : (
            <div className="space-y-2.5">
              {attentionEvents.slice(0, 5).map((evt) => {
                const pending = evt.members.filter((m) => m.status === 'PENDING').length;
                const declined = evt.members.filter((m) => m.status === 'DECLINED').length;
                return (
                  <button
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="w-full rounded-xl border border-slate-100 px-3 py-2.5 text-left hover:border-amber-200 hover:bg-amber-50/40 transition"
                  >
                    <p className="truncate text-xs font-bold text-slate-800">{evt.title}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {pending > 0 && <span className="text-amber-700">{pending} aguardando</span>}
                      {pending > 0 && declined > 0 && ' · '}
                      {declined > 0 && <span className="text-rose-700">{declined} recusaram</span>}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
