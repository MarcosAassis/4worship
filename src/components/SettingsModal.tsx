import React, { useEffect, useState } from 'react';
import { X, Mail, LogOut, Sun, Moon, ImagePlus, Trash2, Check } from 'lucide-react';
import { Organization } from '../types';
import { InviteCodeCard } from './InviteCodeCard';
import { MinistryLogo } from './MinistryLogo';
import { AppTheme, compressImageFile } from '../theme';
import { fetchApiHealth } from '../services/musicSearchApi';
import { MusicSearchHealth } from '../types/musicSearch';

interface SettingsModalProps {
  onClose: () => void;
  activeOrg: Organization;
  canManageInvite: boolean;
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  onUpdateOrg: (org: Organization) => void;
  onRegenerateInvite: () => void;
  onLeaveMinistry: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  activeOrg,
  canManageInvite,
  theme,
  onChangeTheme,
  onUpdateOrg,
  onRegenerateInvite,
  onLeaveMinistry,
  onLogout,
}) => {
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [mailHealth, setMailHealth] = useState<MusicSearchHealth | null>(null);
  const [orgName, setOrgName] = useState(activeOrg.name);
  const [churchName, setChurchName] = useState(activeOrg.churchName || '');
  const [city, setCity] = useState(activeOrg.city === 'Não informado' ? '' : activeOrg.city || '');
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgSaved, setOrgSaved] = useState(false);

  useEffect(() => {
    fetchApiHealth().then(setMailHealth);
  }, []);

  useEffect(() => {
    setOrgName(activeOrg.name);
    setChurchName(activeOrg.churchName || '');
    setCity(activeOrg.city === 'Não informado' ? '' : activeOrg.city || '');
  }, [activeOrg.id, activeOrg.name, activeOrg.churchName, activeOrg.city]);

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    const name = orgName.trim();
    if (!name) {
      setOrgError('Informe o nome do ministério.');
      return;
    }
    setOrgError(null);
    onUpdateOrg({
      ...activeOrg,
      name,
      churchName: churchName.trim() || undefined,
      city: city.trim() || '',
    });
    setOrgSaved(true);
    setTimeout(() => setOrgSaved(false), 1600);
  };

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLogoBusy(true);
    setLogoError(null);
    try {
      const logoUrl = await compressImageFile(file);
      onUpdateOrg({ ...activeOrg, logoUrl });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Não foi possível usar esta imagem.');
    } finally {
      setLogoBusy(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoError(null);
    const { logoUrl: _removed, ...rest } = activeOrg;
    onUpdateOrg({ ...rest, logoUrl: undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Configurações</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          <section className="space-y-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Aparência</p>
              <p className="mt-0.5 text-xs text-slate-500">Escolha o tema da interface. A preferência fica salva neste dispositivo.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeTheme('light')}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${theme === 'light' ? 'text-indigo-900' : 'text-slate-700'}`}>
                  Claro
                </span>
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme('dark')}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-indigo-900' : 'text-slate-700'}`}>
                  Escuro
                </span>
              </button>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-5">
            <div>
              <p className="text-sm font-bold text-slate-900">Identidade do ministério</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Nome, igreja (opcional) e imagem. Aparecem na barra lateral e na tela inicial.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <MinistryLogo org={activeOrg} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{activeOrg.name}</p>
                {activeOrg.churchName?.trim() ? (
                  <p className="truncate text-xs text-slate-500">{activeOrg.churchName}</p>
                ) : (
                  <p className="truncate text-xs text-slate-400">Igreja não informada</p>
                )}
                {canManageInvite ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-xs ring-1 ring-slate-200 hover:bg-slate-50 ${logoBusy ? 'opacity-60 pointer-events-none' : ''}`}>
                      <ImagePlus className="h-3.5 w-3.5" />
                      {logoBusy ? 'Enviando…' : activeOrg.logoUrl ? 'Trocar imagem' : 'Enviar imagem'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFile}
                        disabled={logoBusy}
                      />
                    </label>
                    {activeOrg.logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">Somente o líder pode alterar estes dados.</p>
                )}
              </div>
            </div>
            {logoError && <p className="text-xs font-semibold text-rose-600">{logoError}</p>}

            {canManageInvite && (
              <form onSubmit={handleSaveOrg} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Nome do ministério *</label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Ex: Ministério de Louvor Shammah"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Igreja / congregação (opcional)</label>
                  <input
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    placeholder="Deixe em branco se não quiser exibir"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Cidade (opcional)</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                {orgError && <p className="text-xs font-semibold text-rose-600">{orgError}</p>}
                {orgSaved && (
                  <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                    Dados do ministério salvos.
                  </p>
                )}
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
                >
                  Salvar dados do ministério
                </button>
              </form>
            )}
          </section>

          {canManageInvite && (
            <InviteCodeCard
              org={activeOrg}
              canRegenerate
              onRegenerate={onRegenerateInvite}
            />
          )}

          <section className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">E-mail de convites (Resend)</p>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                  A chave fica no servidor (Render). Sem <code>RESEND_API_KEY</code>, os envios ficam em modo de teste.
                </p>
                <p className={`mt-2 text-xs font-bold ${mailHealth?.resend ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {mailHealth?.resend ? `Ativo · ${mailHealth.fromEmail}` : 'Modo teste — configure RESEND_API_KEY no Render.'}
                </p>
              </div>
            </div>
          </section>

          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={onLeaveMinistry}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition text-xs"
              >
                Trocar de ministério
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 transition text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair da conta
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
