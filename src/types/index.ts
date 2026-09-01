export type UserRole = 'ADMIN' | 'TEAM_LEADER' | 'MUSICIAN';

export type AppTab = 'home' | 'schedules' | 'songs' | 'musicians' | 'notifications';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  TEAM_LEADER: 'Líder de louvor',
  MUSICIAN: 'Músico',
};

export type InstrumentType = 
  | 'Vocal Líder'
  | 'Backing Vocal'
  | 'Violão'
  | 'Guitarra'
  | 'Teclado / Piano'
  | 'Baixo'
  | 'Bateria'
  | 'Percussão'
  | 'Saxofone'
  | 'Mesa de Som (Áudio)'
  | 'Transmissão / Live'
  | 'Projeção / Mídia';

export type AttendanceStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED';

export type DayOfWeek = 'DOMINGO_MANHA' | 'DOMINGO_NOITE' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO';

export interface AvailabilitySchedule {
  day: DayOfWeek;
  available: boolean;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId: string | null;
  instruments: InstrumentType[];
  weeklyAvailability: AvailabilitySchedule[];
  blockedDates: string[]; // ISO date strings YYYY-MM-DD
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  churchName?: string;
  city: string;
  logoUrl?: string;
  leadersCount: number;
  musiciansCount: number;
  /** Código único que o líder envia para a equipe entrar no ministério. */
  inviteCode: string;
  inviteCodeUpdatedAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  defaultKey: string;
  bpm?: number;
  timeSignature?: string;
  cifraClubUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  lyrics?: string;
  chords?: string;
  tags: string[];
  technicalNotes?: string;
  organizationId: string;
  updatedAt: string;
}

export interface SetlistSong {
  id: string;
  songId: string;
  song: Song;
  assignedKey: string;
  leadSingerId?: string;
  order: number;
  customNotes?: string;
}

export interface ScheduleMember {
  id: string;
  userId: string;
  user: User;
  instrument: InstrumentType;
  status: AttendanceStatus;
  declineReason?: string;
  token: string; // Token único para RSVP direto sem login via e-mail Resend
  notifiedAt?: string;
  respondedAt?: string;
}

export interface WorshipEvent {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime?: string;
  location: string;
  leaderId: string;
  leaderName: string;
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';
  members: ScheduleMember[];
  setlist: SetlistSong[];
  generalNotes?: string;
  createdAt: string;
}

export interface EmailNotificationLog {
  id: string;
  eventId: string;
  eventTitle: string;
  recipientEmail: string;
  recipientName: string;
  type: 'SCHEDULE_INVITE' | 'SUBSTITUTION_ALERT' | 'CONFIRMATION_RECEIPT';
  status: 'SENT' | 'FAILED' | 'QUEUED';
  sentAt: string;
  resendId?: string;
  subject: string;
  htmlPreview: string;
}
