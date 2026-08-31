import React, { useEffect, useState } from 'react';
import {
  Music2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  LogIn,
  UserPlus,
  PlusCircle,
  Users,
  ImagePlus,
} from 'lucide-react';
import { Organization, User } from '../types';
import {
  findOrganizationByCode,
  generateInviteCode,
  normalizeInviteCode,
} from '../services/inviteCode';
import { SessionStore } from '../services/sessionStore';
import { compressImageFile } from '../theme';

export const DEFAULT_AVAILABILITY: User['weeklyAvailability'] = [
  { day: 'DOMINGO_MANHA', available: true },
  { day: 'DOMINGO_NOITE', available: true },
  { day: 'QUARTA', available: true },
  { day: 'SABADO', available: true },
];

type Step = 'login' | 'choice' | 'create' | 'join';

interface AuthOnboardingProps {
  currentUser: User | null;
  users: User[];
  organizations: Organization[];
  initialCode?: string;
  onLogin: (user: User) => void;
  onCreateMinistry: (org: Organization, owner: User) => void;
  onJoinMinistry: (org: Organization, member: User) => void;
  onLogout: () => void;
}

export const AuthOnboarding: React.FC<AuthOnboardingProps> = ({
  currentUser,
  users,
  organizations,
  initialCode = '',
  onLogin,
  onCreateMinistry,
  onJoinMinistry,
  onLogout,
}) => {
  const [step, setStep] = useState<Step>(currentUser ? 'choice' : 'login');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [code, setCode] = useState(initialCode);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [ministryName, setMinistryName] = useState('');
  const [churchName, setChurchName] = useState('');
  const [city, setCity] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setStep(initialCode ? 'join' : 'choice');
    } else {
      setStep('login');
    }
  }, [currentUser, initialCode]);

  useEffect(() => {
    if (initialCode) setCode(normalizeInviteCode(initialCode));
  }, [initialCode]);

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const account = SessionStore.findAccount(email);
    if (!account || account.password !== password) {
      setAuthError('E-mail ou senha incorretos.');
      return;
    }
    const user = users.find((u) => u.id === account.userId)
      || users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setAuthError('Conta não encontrada. Crie uma conta nova.');
      return;
    }
    onLogin(user);
  };

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!name.trim() || !email.trim() || password.length < 4) {
      setAuthError('Preencha nome, e-mail e uma senha com pelo menos 4 caracteres.');
      return;
    }
    if (SessionStore.findAccount(email)) {
      setAuthError('Este e-mail já tem conta. Entre com a senha.');
      return;
    }

    const user: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: 'MUSICIAN',
      organizationId: null,
      instruments: [],
      weeklyAvailability: DEFAULT_AVAILABILITY,
      blockedDates: [],
      createdAt: new Date().toISOString(),
    };

    SessionStore.saveUser(user, { setSession: true });
    SessionStore.saveAccount({ email: user.email, password, userId: user.id });
    onLogin(user);
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!ministryName.trim() || !churchName.trim()) {
      setCreateError('Informe o nome do ministério e da igreja.');
      return;
    }

    const now = new Date().toISOString();
    const org: Organization = {
      id: `org_${Date.now()}`,
      name: ministryName.trim(),
      churchName: churchName.trim(),
      city: city.trim() || 'Não informado',
      logoUrl,
      leadersCount: 1,
      musiciansCount: 1,
      inviteCode: generateInviteCode(),
      inviteCodeUpdatedAt: now,
    };

    const owner: User = {
      ...currentUser,
      organizationId: org.id,
      role: 'ADMIN',
    };

    onCreateMinistry(org, owner);
  };

  const submitJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const org = findOrganizationByCode(organizations, code);
    if (!org) {
      setCodeError('Código inválido. Peça o código atualizado ao líder ou administrador.');
      return;
    }

    const member: User = {
      ...currentUser,
      organizationId: org.id,
      role: currentUser.organizationId === org.id ? currentUser.role : 'MUSICIAN',
      instruments: currentUser.organizationId === org.id ? currentUser.instruments : [],
    };

    onJoinMinistry(org, member);
  };

  return (
    <div className="min-h-screen bg-[#0c1222] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
            <Music2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-extrabold tracking-tight">4worship</p>
            <p className="text-xs text-white/45">Gestão de ministérios de louvor</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {step === 'login' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  {authMode === 'login' ? 'Entrar' : 'Criar conta'}
                </h1>
                <p className="mt-1 text-sm text-white/55">
                  {authMode === 'login'
                    ? 'Acesse com seu e-mail e senha para continuar.'
                    : 'Crie sua conta. Depois você escolhe criar um ministério ou entrar em um existente.'}
                </p>
              </div>

              <div className="grid grid-cols-2 rounded-xl bg-white/5 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`rounded-lg py-2 ${authMode === 'login' ? 'bg-indigo-500 text-white' : 'text-white/50'}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className={`rounded-lg py-2 ${authMode === 'register' ? 'bg-indigo-500 text-white' : 'text-white/50'}`}
                >
                  Criar conta
                </button>
              </div>

              <form onSubmit={authMode === 'login' ? submitLogin : submitRegister} className="space-y-3">
                {authMode === 'register' && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-white/70">Nome completo</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como você quer ser chamado"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-bold text-white/70">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@igreja.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                {authMode === 'register' && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-white/70">WhatsApp (opcional)</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+55 11 9...."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-bold text-white/70">Senha</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === 'register' ? 'Mínimo 4 caracteres' : 'Sua senha'}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                {authError && <p className="text-xs font-semibold text-rose-300">{authError}</p>}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400"
                >
                  {authMode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {authMode === 'login' ? 'Entrar' : 'Criar conta e continuar'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {step === 'choice' && currentUser && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300/90">Olá, {currentUser.name.split(' ')[0]}</p>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight">O que você deseja fazer?</h1>
                <p className="mt-1 text-sm text-white/55">
                  Crie um ministério novo ou entre em um grupo com o código do líder.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setCreateError(null); setStep('create'); }}
                className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-indigo-400/50 hover:bg-indigo-500/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Criar um ministério</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                    Você vira administrador e recebe um código para convidar a equipe.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setCodeError(null); setStep('join'); }}
                className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-amber-400/40 hover:bg-amber-400/5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Entrar em um existente</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                    Use o código único enviado pelo líder ou administrador.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="w-full text-center text-xs font-semibold text-white/35 hover:text-white/70"
              >
                Sair da conta
              </button>
            </div>
          )}

          {step === 'create' && (
            <form onSubmit={submitCreate} className="space-y-5">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Novo ministério</h1>
                <p className="mt-1 text-sm text-white/55">
                  Esses dados aparecem para a equipe e no convite de entrada.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-white/70">Nome do ministério</label>
                <input
                  value={ministryName}
                  onChange={(e) => setMinistryName(e.target.value)}
                  placeholder="Ex: Ministério de Louvor Shammah"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-white/70">Igreja / congregação</label>
                <input
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="Ex: Igreja Batista Central"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-white/70">Cidade (opcional)</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-white/70">Imagem do grupo (opcional)</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Music2 className="h-6 w-6 text-white/50" />
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {logoUrl ? 'Trocar imagem' : 'Enviar imagem'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        try {
                          setLogoUrl(await compressImageFile(file));
                          setLogoError(null);
                        } catch (err) {
                          setLogoError(err instanceof Error ? err.message : 'Não foi possível usar esta imagem.');
                        }
                      }}
                    />
                  </label>
                </div>
                {logoError && <p className="mt-1.5 text-xs font-semibold text-rose-300">{logoError}</p>}
              </div>
              {createError && <p className="text-xs font-semibold text-rose-300">{createError}</p>}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400"
              >
                Criar ministério
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {step === 'join' && (
            <form onSubmit={submitJoin} className="space-y-5">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">Código do grupo</h1>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    Digite o código que o líder enviou. A função na equipe é definida depois por ele.
                  </p>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/40">
                  Código do ministério
                </label>
                <input
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    setCode(normalizeInviteCode(e.target.value).slice(0, 12));
                    setCodeError(null);
                  }}
                  placeholder="ABC123"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-center font-mono text-2xl font-black tracking-[0.28em] text-white placeholder:text-white/20 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  autoComplete="off"
                  spellCheck={false}
                />
                {codeError && <p className="mt-2 text-xs font-semibold text-rose-300">{codeError}</p>}
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400"
              >
                Entrar no ministério
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
