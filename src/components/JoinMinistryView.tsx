import React, { useEffect, useMemo, useState } from 'react';
import { Music2, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Organization, User } from '../types';
import {
  findMemberByEmail,
  findOrganizationByCode,
  formatInviteCode,
  normalizeInviteCode,
} from '../services/inviteCode';

export interface JoinPayload {
  org: Organization;
  existingUser?: User;
  newUser?: User;
}

interface JoinMinistryViewProps {
  organizations: Organization[];
  users: User[];
  initialCode?: string;
  onJoin: (payload: JoinPayload) => void;
}

export const JoinMinistryView: React.FC<JoinMinistryViewProps> = ({
  organizations,
  users,
  initialCode = '',
  onJoin,
}) => {
  const [step, setStep] = useState<'code' | 'profile'>('code');
  const [code, setCode] = useState(initialCode);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [matchedOrg, setMatchedOrg] = useState<Organization | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const returningMember = useMemo(
    () => (matchedOrg && email.trim() ? findMemberByEmail(users, matchedOrg.id, email) : undefined),
    [users, matchedOrg, email]
  );

  useEffect(() => {
    if (!initialCode) return;
    const org = findOrganizationByCode(organizations, initialCode);
    if (org) {
      setMatchedOrg(org);
      setCode(formatInviteCode(org.inviteCode));
      setStep('profile');
    }
  }, [initialCode, organizations]);

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const org = findOrganizationByCode(organizations, code);
    if (!org) {
      setCodeError('Código inválido. Peça o código atualizado ao líder ou administrador.');
      return;
    }
    setCodeError(null);
    setMatchedOrg(org);
    setStep('profile');
  };

  const submitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedOrg) return;

    if (!email.trim()) {
      setFormError('Informe seu e-mail.');
      return;
    }

    const existing = findMemberByEmail(users, matchedOrg.id, email);
    if (existing) {
      onJoin({ org: matchedOrg, existingUser: existing });
      return;
    }

    if (!name.trim()) {
      setFormError('Informe seu nome completo.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: 'MUSICIAN',
      organizationId: matchedOrg.id,
      instruments: [],
      weeklyAvailability: [
        { day: 'DOMINGO_MANHA', available: true },
        { day: 'DOMINGO_NOITE', available: true },
        { day: 'QUARTA', available: true },
        { day: 'SABADO', available: true },
      ],
      blockedDates: [],
      createdAt: new Date().toISOString(),
    };

    onJoin({ org: matchedOrg, newUser });
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
            <p className="text-xs text-white/45">Entrar no ministério de louvor</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {step === 'code' && (
            <form onSubmit={submitCode} className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">Qual é o código?</h1>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    O líder ou administrador envia um código único. Digite-o para entrar na equipe.
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
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {step === 'profile' && matchedOrg && (
            <form onSubmit={submitProfile} className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  setStep('code');
                  setFormError(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Trocar código
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300/90">Ministério encontrado</p>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight">{matchedOrg.name}</h1>
                <p className="text-sm text-white/50">{matchedOrg.churchName}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-white/70">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="seu.email@igreja.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                  />
                  {returningMember && (
                    <p className="mt-1.5 text-xs font-semibold text-emerald-300">
                      Cadastro encontrado: você vai entrar como {returningMember.name}.
                    </p>
                  )}
                </div>

                {!returningMember && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-white/70">Nome completo</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como a equipe te conhece"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-white/70">WhatsApp (opcional)</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+55 11 9...."
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-400 focus:outline-none"
                      />
                    </div>
                    <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-white/50">
                      O líder define seu instrumento e sua função depois que você entrar.
                    </p>
                  </>
                )}
              </div>

              {formError && <p className="text-xs font-semibold text-rose-300">{formError}</p>}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400"
              >
                {returningMember ? 'Entrar no ministério' : 'Entrar na equipe'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[11px] leading-relaxed text-white/35">
                Já faz parte? Use o mesmo e-mail do cadastro.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
