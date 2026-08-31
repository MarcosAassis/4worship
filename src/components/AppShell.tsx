import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Music2,
  Users,
  Mail,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { AppTab, Organization, User, ROLE_LABELS } from '../types';
import { AppTheme } from '../theme';
import { MinistryLogo } from './MinistryLogo';

interface AppShellProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  activeOrg: Organization;
  currentUser: User;
  theme: AppTheme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onLeaveMinistry: () => void;
  onLogout: () => void;
  pendingCount?: number;
  children: React.ReactNode;
}

type NavItem = { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Ministério',
    items: [
      { id: 'home', label: 'Início', icon: LayoutDashboard },
      { id: 'schedules', label: 'Escalas', icon: CalendarDays },
      { id: 'songs', label: 'Repertório', icon: Music2 },
      { id: 'musicians', label: 'Equipe', icon: Users },
    ],
  },
  {
    group: 'Comunicação',
    items: [
      { id: 'notifications', label: 'Convites', icon: Mail },
    ],
  },
];

const PAGE_TITLES: Record<AppTab, { title: string; subtitle: string }> = {
  home: { title: 'Início', subtitle: 'Visão geral do ministério' },
  schedules: { title: 'Escalas', subtitle: 'Cultos, equipe e repertório' },
  songs: { title: 'Repertório', subtitle: 'Cifras, tons e referências' },
  musicians: { title: 'Equipe', subtitle: 'Músicos, funções e disponibilidade' },
  notifications: { title: 'Convites', subtitle: 'Envios e confirmações por e-mail' },
};

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  setCurrentTab,
  activeOrg,
  currentUser,
  theme,
  onToggleTheme,
  onOpenSettings,
  onLeaveMinistry,
  onLogout,
  pendingCount = 0,
  children,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const page = PAGE_TITLES[currentTab];
  const initials = currentUser.name
    .split(' ')
    .filter((n) => n && n !== '(Você)')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const visibleNav = NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.id === 'notifications' && currentUser.role === 'MUSICIAN') return false;
      return true;
    }),
  })).filter((section) => section.items.length > 0);

  const isDark = theme === 'dark';

  const NavButtons = ({ compact = false }: { compact?: boolean }) => (
    <>
      {visibleNav.map((section) => (
        <div key={section.group} className={compact ? '' : 'space-y-1'}>
          {!compact && (
            <p
              className={`px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                isDark ? 'text-white/35' : 'text-slate-400'
              }`}
            >
              {section.group}
            </p>
          )}
          {section.items.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setUserMenuOpen(false);
                }}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isDark
                    ? active
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    : active
                      ? 'bg-indigo-50 text-indigo-950'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {active && (
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full ${
                      isDark ? 'bg-amber-400' : 'bg-amber-500'
                    }`}
                  />
                )}
                <Icon
                  className={`h-4 w-4 ${
                    isDark
                      ? active
                        ? 'text-amber-300'
                        : 'text-white/45'
                      : active
                        ? 'text-indigo-600'
                        : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.id === 'schedules' && pendingCount > 0 && (
                  <span
                    className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isDark
                        ? 'bg-amber-400/20 text-amber-200'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#f6f5f2] text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:w-[248px] md:flex-col md:fixed md:inset-y-0 ${
          isDark
            ? 'bg-[#0c1222] text-white'
            : 'border-r border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div
          className={`flex items-center gap-3 px-5 py-5 border-b ${
            isDark ? 'border-white/8' : 'border-slate-100'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold tracking-tight text-[15px] leading-none">4worship</p>
            <p className={`mt-1 truncate text-[11px] ${isDark ? 'text-white/45' : 'text-slate-400'}`}>
              {activeOrg.churchName}
            </p>
          </div>
        </div>

        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-2">
          <NavButtons />
        </nav>

        <div className={`border-t p-3 space-y-2 ${isDark ? 'border-white/8' : 'border-slate-100'}`}>
          <div
            className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${
              isDark ? 'bg-white/5' : 'bg-slate-50'
            }`}
          >
            <MinistryLogo org={activeOrg} size="sm" className="rounded-xl" />
            <div className="min-w-0">
              <p className={`truncate text-xs font-medium ${isDark ? 'text-white/80' : 'text-slate-800'}`}>
                {activeOrg.name}
              </p>
              <p className={`truncate text-[10px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {activeOrg.churchName}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-2 transition ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold ${
                  isDark
                    ? 'bg-indigo-500/30 text-indigo-100'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className={`truncate text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentUser.name.replace(' (Você)', '')}
                </p>
                <p className={`truncate text-[10px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  {ROLE_LABELS[currentUser.role]}
                </p>
              </div>
            </button>
            {userMenuOpen && (
              <div
                className={`absolute bottom-full left-0 right-0 mb-1 rounded-xl border p-1.5 shadow-xl ${
                  isDark
                    ? 'border-white/10 bg-[#161d2e]'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  onClick={() => { onOpenSettings(); setUserMenuOpen(false); }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                    isDark
                      ? 'text-white/70 hover:bg-white/5 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Configurações
                </button>
                <button
                  onClick={() => { onLeaveMinistry(); setUserMenuOpen(false); }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                    isDark
                      ? 'text-white/70 hover:bg-white/5 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Trocar de ministério
                </button>
                <button
                  onClick={() => { onLogout(); setUserMenuOpen(false); }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                    isDark
                      ? 'text-rose-300 hover:bg-white/5'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-[248px]">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-[#f6f5f2]/90 px-4 py-3 backdrop-blur-md md:hidden">
          <button onClick={() => setCurrentTab('home')} className="flex items-center gap-2.5">
            <MinistryLogo org={activeOrg} size="sm" className="rounded-xl" />
            <div className="text-left">
              <p className="max-w-[180px] truncate text-sm font-extrabold leading-none">{activeOrg.name}</p>
              <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-500">{activeOrg.churchName}</p>
            </div>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-xs"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={onOpenSettings}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-xs"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Desktop page header */}
        <header className="sticky top-0 z-20 hidden border-b border-slate-200/70 bg-[#f6f5f2]/80 px-8 py-4 backdrop-blur-md md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900">{page.title}</h1>
            <p className="text-xs text-slate-500">{page.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-xs hover:bg-slate-50 transition"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50 transition"
            >
              <Settings className="h-3.5 w-3.5" />
              Configurações
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-7 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navegação principal"
        className="safe-area-pb md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-1 pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md"
      >
        <div className="flex items-stretch justify-around">
          {visibleNav.flatMap((s) => s.items).map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition ${
                  active ? 'text-indigo-700' : 'text-slate-400'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : ''}`} />
                  {item.id === 'schedules' && pendingCount > 0 && (
                    <span className="absolute -right-1.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </div>
                <span className={`text-[10px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
