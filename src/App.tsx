/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_SONGS,
  INITIAL_EVENTS,
  INITIAL_EMAIL_LOGS,
} from './data/mockData';
import {
  Organization,
  User,
  Song,
  WorshipEvent,
  EmailNotificationLog,
  AttendanceStatus,
  AppTab,
} from './types';
import { AppShell } from './components/AppShell';
import { DashboardOverview } from './components/DashboardOverview';
import { SchedulesView } from './components/SchedulesView';
import { ScheduleDetailModal } from './components/ScheduleDetailModal';
import { SongsRepertoireView } from './components/SongsRepertoireView';
import { MusiciansView } from './components/MusiciansView';
import { ResendNotificationsView } from './components/ResendNotificationsView';
import { ResendEmailPreviewModal } from './components/ResendEmailPreviewModal';
import { RsvpTokenPortal } from './components/RsvpTokenPortal';
import { NewEventModal } from './components/NewEventModal';
import { NewSongModal } from './components/NewSongModal';
import { NewMusicianModal } from './components/NewMusicianModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthOnboarding } from './components/AuthOnboarding';
import { ResendEmailService } from './services/resendService';
import { SessionStore } from './services/sessionStore';
import { generateInviteCode } from './services/inviteCode';
import { AppTheme, applyTheme } from './theme';

export default function App() {
  const persisted = SessionStore.load();
  const [organizations, setOrganizations] = useState<Organization[]>(
    () => SessionStore.mergeOrganizations(INITIAL_ORGANIZATIONS)
  );
  const [users, setUsers] = useState<User[]>(() => {
    SessionStore.seedDemoAccounts(INITIAL_USERS);
    return SessionStore.mergeUsers(INITIAL_USERS);
  });

  const restoredUser = persisted.sessionUserId
    ? SessionStore.mergeUsers(INITIAL_USERS).find((u) => u.id === persisted.sessionUserId) ?? null
    : null;
  const restoredOrg = restoredUser?.organizationId
    ? SessionStore.mergeOrganizations(INITIAL_ORGANIZATIONS).find((o) => o.id === restoredUser.organizationId) ?? null
    : null;

  const [activeOrg, setActiveOrg] = useState<Organization | null>(restoredOrg);
  const [currentUser, setCurrentUser] = useState<User | null>(restoredUser);

  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [events, setEvents] = useState<WorshipEvent[]>(INITIAL_EVENTS);
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(INITIAL_EMAIL_LOGS);

  const [currentTab, setCurrentTab] = useState<AppTab>('home');

  const [selectedDetailEvent, setSelectedDetailEvent] = useState<WorshipEvent | null>(null);
  const [previewEmailEvent, setPreviewEmailEvent] = useState<WorshipEvent | null>(null);
  const [simulatedRsvp, setSimulatedRsvp] = useState<{ event: WorshipEvent; token: string } | null>(null);

  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isNewSongOpen, setIsNewSongOpen] = useState(false);
  const [isNewMusicianOpen, setIsNewMusicianOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(() => SessionStore.getTheme());

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleChangeTheme = (next: AppTheme) => {
    setTheme(next);
    SessionStore.setTheme(next);
    applyTheme(next);
  };

  const handleUpdateOrg = (updated: Organization) => {
    setActiveOrg(updated);
    setOrganizations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    SessionStore.saveOrganization(updated);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const urlCode = new URLSearchParams(window.location.search).get('codigo') || '';

  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'TEAM_LEADER';

  const handleLogin = (user: User) => {
    setUsers((prev) => (prev.some((u) => u.id === user.id) ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user]));
    setCurrentUser(user);
    SessionStore.setSessionUserId(user.id);
    if (user.organizationId) {
      const org = organizations.find((o) => o.id === user.organizationId) ?? null;
      setActiveOrg(org);
    } else {
      setActiveOrg(null);
    }
    showToast(`Olá, ${user.name.replace(' (Você)', '').split(' ')[0]}.`);
  };

  const handleCreateMinistry = (org: Organization, owner: User) => {
    setOrganizations((prev) => [...prev, org]);
    SessionStore.saveOrganization(org);
    setUsers((prev) => prev.map((u) => (u.id === owner.id ? owner : u)));
    setCurrentUser(owner);
    setActiveOrg(org);
    SessionStore.saveUser(owner, { setSession: true });
    setCurrentTab('home');
    showToast(`${org.name} criado. Compartilhe o código com a equipe.`);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleJoinMinistry = (org: Organization, member: User) => {
    setUsers((prev) => prev.map((u) => (u.id === member.id ? member : u)));
    setCurrentUser(member);
    setActiveOrg(org);
    SessionStore.saveUser(member, { setSession: true });
    setCurrentTab('home');
    setIsSettingsOpen(false);
    showToast(`Você entrou em ${org.name}.`);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleLeaveMinistry = () => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, organizationId: null };
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setCurrentUser(updated);
    setActiveOrg(null);
    SessionStore.saveUser(updated, { setSession: true });
    setIsSettingsOpen(false);
    setCurrentTab('home');
    showToast('Você saiu do ministério.');
  };

  const handleLogout = () => {
    SessionStore.clearSession();
    setCurrentUser(null);
    setActiveOrg(null);
    setIsSettingsOpen(false);
    setCurrentTab('home');
  };

  const handleRegenerateInvite = () => {
    if (!activeOrg || !canManage) return;
    if (!confirm('O código atual deixa de funcionar. Gerar um novo?')) return;
    const nextCode = generateInviteCode();
    const updatedAt = new Date().toISOString();
    const updated = { ...activeOrg, inviteCode: nextCode, inviteCodeUpdatedAt: updatedAt };
    setActiveOrg(updated);
    setOrganizations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    SessionStore.saveOrgCode(updated.id, nextCode, updatedAt);
    showToast('Novo código gerado. Envie para a equipe.');
  };

  const handleSaveEvent = (updatedEvent: WorshipEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    if (selectedDetailEvent?.id === updatedEvent.id) {
      setSelectedDetailEvent(updatedEvent);
    }
  };

  const handleCreateEvent = (newEvent: WorshipEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    showToast(`Escala "${newEvent.title}" criada.`);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Deseja realmente excluir esta escala?')) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      showToast('Escala removida.');
    }
  };

  const handlePublishAndSendEmails = async (event: WorshipEvent) => {
    const updatedMembers = event.members.map((m) => ({
      ...m,
      notifiedAt: new Date().toISOString(),
    }));

    const publishedEvent: WorshipEvent = {
      ...event,
      status: 'PUBLISHED',
      members: updatedMembers,
    };

    handleSaveEvent(publishedEvent);

    const newLogs: EmailNotificationLog[] = [];

    for (const member of event.members) {
      const html = ResendEmailService.generateScheduleInviteHtml({
        musicianName: member.user.name,
        instrument: member.instrument,
        event: publishedEvent,
        token: member.token,
        organizationName: activeOrg.name,
        churchName: activeOrg.churchName,
        appBaseUrl: window.location.origin,
      });

      const res = await ResendEmailService.sendEmail({
        to: member.user.email,
        subject: `Nova escala: ${publishedEvent.title} (${publishedEvent.date})`,
        html: html,
      });

      newLogs.push({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        eventId: publishedEvent.id,
        eventTitle: publishedEvent.title,
        recipientEmail: member.user.email,
        recipientName: member.user.name,
        type: 'SCHEDULE_INVITE',
        status: res.success ? 'SENT' : 'FAILED',
        sentAt: new Date().toISOString(),
        resendId: res.messageId,
        subject: `Nova escala: ${publishedEvent.title} (${publishedEvent.date})`,
        htmlPreview: 'Convite com setlist e confirmação.',
      });
    }

    setEmailLogs((prev) => [...newLogs, ...prev]);
    showToast(`Escala publicada. ${event.members.length} convites enviados.`);
  };

  const handleUpdateRsvpStatus = async (
    eventId: string,
    memberId: string,
    status: AttendanceStatus,
    reason?: string
  ) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const targetMember = targetEvent.members.find((m) => m.id === memberId);
    if (!targetMember) return;

    const updatedMembers = targetEvent.members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          status,
          declineReason: reason || m.declineReason,
          respondedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    const updatedEvent: WorshipEvent = {
      ...targetEvent,
      members: updatedMembers,
    };

    handleSaveEvent(updatedEvent);

    if (status === 'DECLINED') {
      const leader = users.find((u) => u.id === targetEvent.leaderId) || users[0];
      const alertHtml = ResendEmailService.generateSubstitutionAlertHtml({
        leaderName: leader.name,
        musicianName: targetMember.user.name,
        instrument: targetMember.instrument,
        event: targetEvent,
        declineReason: reason,
        appBaseUrl: window.location.origin,
      });

      const res = await ResendEmailService.sendEmail({
        to: leader.email,
        subject: `Recusa na escala: ${targetMember.user.name} (${targetMember.instrument})`,
        html: alertHtml,
      });

      const newAlertLog: EmailNotificationLog = {
        id: `log_alert_${Date.now()}`,
        eventId: targetEvent.id,
        eventTitle: targetEvent.title,
        recipientEmail: leader.email,
        recipientName: `${leader.name} (Líder)`,
        type: 'SUBSTITUTION_ALERT',
        status: res.success ? 'SENT' : 'FAILED',
        sentAt: new Date().toISOString(),
        resendId: res.messageId,
        subject: `Recusa na escala: ${targetMember.user.name} (${targetMember.instrument})`,
        htmlPreview: `Voluntário recusou: "${reason || 'Sem justificativa'}"`,
      };

      setEmailLogs((prev) => [newAlertLog, ...prev]);
      showToast('Recusa registrada. O líder foi avisado.');
    } else {
      showToast('Presença confirmada.');
    }
  };

  const handleSaveSong = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
    showToast(`"${newSong.title}" adicionada ao repertório.`);
  };

  const handleDeleteSong = (id: string) => {
    if (confirm('Deseja excluir esta música do repertório?')) {
      setSongs((prev) => prev.filter((s) => s.id !== id));
      showToast('Música removida.');
    }
  };

  const handleSaveMusician = (newMusician: User) => {
    setUsers((prev) => [newMusician, ...prev]);
    SessionStore.saveUser(newMusician);
    showToast(`${newMusician.name} cadastrado na equipe.`);
  };

  const handleUpdateMusician = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    SessionStore.saveUser(updated);
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const handleDeleteMusician = (id: string) => {
    if (confirm('Deseja remover este voluntário?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('Voluntário removido.');
    }
  };

  const handleOpenRsvp = (event?: WorshipEvent, token?: string) => {
    const targetEvent = event || events[0];
    const targetToken = token || targetEvent.members[0]?.token || '';
    setSimulatedRsvp({ event: targetEvent, token: targetToken });
  };

  const orgUsers = activeOrg ? users.filter((u) => u.organizationId === activeOrg.id) : users;
  const orgEvents = activeOrg ? events.filter((e) => e.organizationId === activeOrg.id) : events;
  const orgSongs = activeOrg ? songs.filter((s) => s.organizationId === activeOrg.id) : songs;

  const pendingCount = orgEvents.reduce(
    (acc, evt) => acc + evt.members.filter((m) => m.status === 'PENDING').length,
    0
  );

  if (!currentUser || !activeOrg) {
    return (
      <>
        {toastMessage && (
          <div className="animate-fade-in fixed bottom-6 left-3 right-3 z-50 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/95 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl sm:left-auto sm:right-6 sm:max-w-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}
        <AuthOnboarding
          currentUser={currentUser}
          users={users}
          organizations={organizations}
          initialCode={urlCode}
          onLogin={handleLogin}
          onCreateMinistry={handleCreateMinistry}
          onJoinMinistry={handleJoinMinistry}
          onLogout={handleLogout}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white">
      {toastMessage && (
        <div className="animate-fade-in fixed bottom-20 left-3 right-3 z-50 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/95 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-xs sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      <AppShell
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeOrg={activeOrg}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={() => handleChangeTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLeaveMinistry={handleLeaveMinistry}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      >
        {currentTab === 'home' && (
          <DashboardOverview
            events={orgEvents}
            songs={orgSongs}
            musicians={orgUsers}
            activeOrg={activeOrg}
            currentUserName={currentUser.name}
            canManage={canManage}
            onOpenNewEvent={() => setIsNewEventOpen(true)}
            onOpenNewSong={() => setIsNewSongOpen(true)}
            onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'schedules' && (
          <SchedulesView
            events={orgEvents}
            onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
            onOpenNewEvent={() => setIsNewEventOpen(true)}
            onPublishAndSendEmails={handlePublishAndSendEmails}
            onPreviewEmail={(evt) => setPreviewEmailEvent(evt)}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {currentTab === 'songs' && (
          <SongsRepertoireView
            songs={orgSongs}
            organizationId={activeOrg.id}
            onOpenNewSong={() => setIsNewSongOpen(true)}
            onSaveSong={handleSaveSong}
            onDeleteSong={handleDeleteSong}
          />
        )}

        {currentTab === 'musicians' && (
          <MusiciansView
            musicians={orgUsers}
            events={orgEvents}
            activeOrg={activeOrg}
            canManage={canManage}
            onOpenNewMusician={() => setIsNewMusicianOpen(true)}
            onDeleteMusician={handleDeleteMusician}
            onUpdateMusician={handleUpdateMusician}
            onRegenerateInvite={handleRegenerateInvite}
          />
        )}

        {currentTab === 'notifications' && canManage && (
          <ResendNotificationsView
            logs={emailLogs}
            events={orgEvents}
            activeOrg={activeOrg}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onPreviewEmail={(evt) => setPreviewEmailEvent(evt)}
          />
        )}
      </AppShell>

      {selectedDetailEvent && (
        <ScheduleDetailModal
          event={selectedDetailEvent}
          allEvents={orgEvents}
          allUsers={orgUsers}
          allSongs={orgSongs}
          onClose={() => setSelectedDetailEvent(null)}
          onSaveEvent={handleSaveEvent}
          onPublishAndSendEmails={handlePublishAndSendEmails}
          onPreviewEmail={(evt) => setPreviewEmailEvent(evt)}
          onSimulateRsvp={(evt, token) => handleOpenRsvp(evt, token)}
        />
      )}

      {previewEmailEvent && (
        <ResendEmailPreviewModal
          event={previewEmailEvent}
          activeOrg={activeOrg}
          onClose={() => setPreviewEmailEvent(null)}
        />
      )}

      {simulatedRsvp && (
        <RsvpTokenPortal
          event={simulatedRsvp.event}
          member={
            simulatedRsvp.event.members.find((m) => m.token === simulatedRsvp.token) ||
            simulatedRsvp.event.members[0]
          }
          activeOrg={activeOrg}
          allMembers={simulatedRsvp.event.members}
          onUpdateStatus={handleUpdateRsvpStatus}
          onClose={() => setSimulatedRsvp(null)}
          onSwitchMember={(token) => {
            setSimulatedRsvp((prev) => (prev ? { ...prev, token } : null));
          }}
        />
      )}

      {isNewEventOpen && (
        <NewEventModal
          onClose={() => setIsNewEventOpen(false)}
          onSave={handleCreateEvent}
          currentUser={currentUser}
          allUsers={orgUsers}
          organizationId={activeOrg.id}
        />
      )}

      {isNewSongOpen && (
        <NewSongModal
          onClose={() => setIsNewSongOpen(false)}
          onSave={handleSaveSong}
          organizationId={activeOrg.id}
        />
      )}

      {isNewMusicianOpen && (
        <NewMusicianModal
          onClose={() => setIsNewMusicianOpen(false)}
          onSave={handleSaveMusician}
          organizationId={activeOrg.id}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          activeOrg={activeOrg}
          canManageInvite={canManage}
          theme={theme}
          onChangeTheme={handleChangeTheme}
          onUpdateOrg={handleUpdateOrg}
          onRegenerateInvite={handleRegenerateInvite}
          onLeaveMinistry={handleLeaveMinistry}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
