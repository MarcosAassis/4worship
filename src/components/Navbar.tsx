import React, { useState } from 'react';
import { 
  CalendarDays, 
  Music, 
  Users, 
  Send, 
  FileCode2, 
  Settings, 
  UserCheck,
  ChevronDown,
  Building2,
  Sparkles
} from 'lucide-react';
import { Organization, UserRole, User } from '../types';

interface NavbarProps {
  currentTab: 'schedules' | 'songs' | 'musicians' | 'notifications' | 'architecture';
  setCurrentTab: (tab: 'schedules' | 'songs' | 'musicians' | 'notifications' | 'architecture') => void;
  organizations: Organization[];
  activeOrg: Organization;
  setActiveOrg: (org: Organization) => void;
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  onOpenSettings: () => void;
  onOpenRsvpSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  organizations,
  activeOrg,
  setActiveOrg,
  currentUser,
  onRoleChange,
  onOpenSettings,
  onOpenRsvpSimulator,
}) => {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const tabs = [
    { id: 'schedules', label: 'Escalas & Cultos', icon: CalendarDays },
    { id: 'songs', label: 'Repertório & Cifras', icon: Music },
    { id: 'musicians', label: 'Equipe & Músicos', icon: Users },
    { id: 'notifications', label: 'Disparos Resend', icon: Send },
    { id: 'architecture', label: 'Documentação', icon: FileCode2, badge: 'Docs' },
  ] as const;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Navbar Top Row */}
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Ministry Selector */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setCurrentTab('schedules')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200 flex-shrink-0">
                🎸
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">4worship</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[160px] sm:max-w-xs">
                  {activeOrg.churchName?.trim() || activeOrg.name}
                </p>
              </div>
            </div>

            {/* Ministry Dropdown (Desktop) */}
            <div className="hidden lg:flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-3 py-1.5 space-x-2 transition">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <div className="relative inline-block">
                <select
                  aria-label="Selecionar Organização ou Ministério de Louvor"
                  value={activeOrg.id}
                  onChange={(e) => {
                    const selected = organizations.find(o => o.id === e.target.value);
                    if (selected) setActiveOrg(selected);
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id} className="bg-white text-slate-800">
                      {org.churchName ? `${org.name} (${org.churchName})` : org.name}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {'badge' in tab && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: RSVP Simulator + Role Switcher + Settings */}
          <div className="flex items-center space-x-2">
            
            {/* Quick RSVP Portal preview button */}
            <button
              onClick={onOpenRsvpSimulator}
              className="flex items-center space-x-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg transition shadow-xs touch-manipulation active:scale-95"
              title="Testar como o voluntário visualiza e confirma o convite de e-mail sem login"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Simulador RSVP</span>
              <span className="sm:hidden">RSVP</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => onRoleChange('ADMIN')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Acesso total como Administrador"
              >
                Admin
              </button>
              <button
                onClick={() => onRoleChange('TEAM_LEADER')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  currentUser.role === 'TEAM_LEADER'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Acesso como Líder de Louvor"
              >
                Líder
              </button>
              <button
                onClick={() => onRoleChange('MUSICIAN')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  currentUser.role === 'MUSICIAN'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Acesso como Músico / Voluntário"
              >
                Músico
              </button>
            </div>

            {/* Mobile Ministry Selector Button */}
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition touch-manipulation"
              title="Trocar Igreja / Ministério"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-xs touch-manipulation active:scale-95"
              title="Configurações & Chave API Resend"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Mobile Organization Switcher Drawer */}
        {isOrgDropdownOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl px-3 mb-2 text-xs space-y-1.5">
            <div className="flex items-center justify-between px-1 text-slate-500 font-bold text-xs">
              <span>Selecione a Igreja / Congregação:</span>
              <button onClick={() => setIsOrgDropdownOpen(false)} className="text-indigo-600 font-semibold">Fechar</button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {organizations.map(org => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrg(org);
                    setIsOrgDropdownOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg font-medium text-xs flex items-center justify-between transition ${
                    activeOrg.id === org.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold">{org.name}</div>
                    {org.churchName?.trim() ? (
                    <div className={activeOrg.id === org.id ? 'text-indigo-100 text-[11px]' : 'text-slate-500 text-[11px]'}>
                      {org.churchName}
                    </div>
                    ) : null}
                  </div>
                  {activeOrg.id === org.id && <span className="font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
