import { Organization, User } from '../types';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function normalizeInviteCode(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function generateInviteCode(): string {
  let raw = '';
  for (let i = 0; i < 6; i += 1) {
    raw += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

export function formatInviteCode(code: string): string {
  const normalized = normalizeInviteCode(code);
  if (normalized.length === 6) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  }
  return normalized;
}

export function findOrganizationByCode(
  organizations: Organization[],
  code: string
): Organization | undefined {
  const needle = normalizeInviteCode(code);
  if (!needle) return undefined;
  return organizations.find((org) => normalizeInviteCode(org.inviteCode) === needle);
}

export function findMemberByEmail(users: User[], organizationId: string, email: string): User | undefined {
  const needle = email.trim().toLowerCase();
  return users.find(
    (u) => u.organizationId === organizationId && u.email.trim().toLowerCase() === needle
  );
}

export function buildInviteShareText(org: Organization, appBaseUrl: string): string {
  const link = `${appBaseUrl.replace(/\/$/, '')}/?codigo=${encodeURIComponent(normalizeInviteCode(org.inviteCode))}`;
  return [
    `Você foi convidado para o ${org.name}.`,
    `${org.churchName}`,
    '',
    `Código de entrada: ${formatInviteCode(org.inviteCode)}`,
    '',
    `Entre por este link: ${link}`,
  ].join('\n');
}

export function getInviteLink(org: Organization, appBaseUrl: string): string {
  return `${appBaseUrl.replace(/\/$/, '')}/?codigo=${encodeURIComponent(normalizeInviteCode(org.inviteCode))}`;
}
