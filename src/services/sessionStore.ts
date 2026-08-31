import { Organization, User } from '../types';

const STORAGE_KEY = 'louvescale_state_v2';

export interface Account {
  email: string;
  password: string;
  userId: string;
}

interface PersistedState {
  sessionUserId: string | null;
  extraUsers: User[];
  extraOrgs: Organization[];
  accounts: Account[];
  orgCodes: Record<string, { inviteCode: string; inviteCodeUpdatedAt: string }>;
  theme: 'light' | 'dark';
}

function emptyState(): PersistedState {
  return {
    sessionUserId: null,
    extraUsers: [],
    extraOrgs: [],
    accounts: [],
    orgCodes: {},
    theme: 'light',
  };
}

function read(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      sessionUserId: parsed.sessionUserId ?? null,
      extraUsers: parsed.extraUsers ?? [],
      extraOrgs: parsed.extraOrgs ?? [],
      accounts: parsed.accounts ?? [],
      orgCodes: parsed.orgCodes ?? {},
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return emptyState();
  }
}

function write(next: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export const SessionStore = {
  load: read,

  setSessionUserId(userId: string | null) {
    write({ ...read(), sessionUserId: userId });
  },

  saveUser(user: User, options?: { setSession?: boolean }) {
    const state = read();
    const extraUsers = [
      ...state.extraUsers.filter((u) => u.id !== user.id && u.email.toLowerCase() !== user.email.toLowerCase()),
      user,
    ];
    write({
      ...state,
      extraUsers,
      sessionUserId: options?.setSession ? user.id : state.sessionUserId,
    });
  },

  saveExtraUser(user: User) {
    this.saveUser(user, { setSession: true });
  },

  saveAccount(account: Account) {
    const state = read();
    const accounts = [
      ...state.accounts.filter((a) => a.email !== account.email.toLowerCase() && a.userId !== account.userId),
      { ...account, email: account.email.toLowerCase() },
    ];
    write({ ...state, accounts });
  },

  findAccount(email: string): Account | undefined {
    return read().accounts.find((a) => a.email === email.trim().toLowerCase());
  },

  saveOrganization(org: Organization) {
    const state = read();
    const extraOrgs = [...state.extraOrgs.filter((o) => o.id !== org.id), org];
    write({
      ...state,
      extraOrgs,
      orgCodes: {
        ...state.orgCodes,
        [org.id]: { inviteCode: org.inviteCode, inviteCodeUpdatedAt: org.inviteCodeUpdatedAt },
      },
    });
  },

  saveOrgCode(orgId: string, inviteCode: string, inviteCodeUpdatedAt: string) {
    const state = read();
    write({
      ...state,
      extraOrgs: state.extraOrgs.map((o) =>
        o.id === orgId ? { ...o, inviteCode, inviteCodeUpdatedAt } : o
      ),
      orgCodes: {
        ...state.orgCodes,
        [orgId]: { inviteCode, inviteCodeUpdatedAt },
      },
    });
  },

  mergeOrganizations(initial: Organization[]): Organization[] {
    const state = read();
    const overlay = new Map(state.extraOrgs.map((o) => [o.id, o]));
    const seen = new Set<string>();
    const merged: Organization[] = [];

    for (const org of initial) {
      merged.push(overlay.get(org.id) ?? org);
      seen.add(org.id);
    }
    for (const extra of state.extraOrgs) {
      if (!seen.has(extra.id)) {
        merged.push(extra);
        seen.add(extra.id);
      }
    }
    return merged.map((org) => (state.orgCodes[org.id] ? { ...org, ...state.orgCodes[org.id] } : org));
  },

  applyOrgCodes(organizations: Organization[]): Organization[] {
    return this.mergeOrganizations(organizations);
  },

  mergeUsers(initial: User[]): User[] {
    const { extraUsers } = read();
    const overlay = new Map(extraUsers.map((u) => [u.email.toLowerCase(), u]));
    const seen = new Set<string>();
    const merged: User[] = [];

    for (const user of initial) {
      const key = user.email.toLowerCase();
      merged.push(overlay.get(key) ?? user);
      seen.add(key);
    }
    for (const extra of extraUsers) {
      const key = extra.email.toLowerCase();
      if (!seen.has(key)) {
        merged.push(extra);
        seen.add(key);
      }
    }
    return merged;
  },

  seedDemoAccounts(initialUsers: User[]) {
    const state = read();
    if (state.accounts.length > 0) return;
    write({
      ...state,
      accounts: initialUsers.map((u) => ({
        email: u.email.toLowerCase(),
        password: 'louvor',
        userId: u.id,
      })),
    });
  },

  getTheme(): 'light' | 'dark' {
    return read().theme;
  },

  setTheme(theme: 'light' | 'dark') {
    write({ ...read(), theme });
  },

  clearSession() {
    write({ ...read(), sessionUserId: null });
  },
};
