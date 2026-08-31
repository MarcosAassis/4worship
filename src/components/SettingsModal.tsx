import React, { useState } from 'react';
import { X, Mail, Check, LogOut, Sun, Moon, ImagePlus, Trash2 } from 'lucide-react';
import { Organization } from '../types';
import { ResendEmailService } from '../services/resendService';
import { InviteCodeCard } from './InviteCodeCard';
import { MinistryLogo } from './MinistryLogo';
import { AppTheme, compressImageFile } from '../theme';

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
  const currentCreds = ResendEmailService.getCredentials();
  const [apiKey, setApiKey] = useState(currentCreds.apiKey);
  const [fromEmail, setFromEmail] = useState(currentCreds.fromEmail);
  const [saved, setSaved] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    ResendEmailService.setCredentials(apiKey, fromEmail);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
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
                A imagem aparece ao lado do nome do grupo na barra lateral e na tela inicial.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <MinistryLogo org={activeOrg} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{activeOrg.name}</p>
                <p className="truncate text-xs text-slate-500">{activeOrg.churchName}</p>
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
                  <p className="mt-1 text-[11px] text-slate-400">Somente o líder pode alterar a imagem.</p>
                )}
              </div>
            </div>
            {logoError && <p className="text-xs font-semibold text-rose-600">{logoError}</p>}
          </section>

          {canManageInvite && (
            <InviteCodeCard
              org={activeOrg}
              canRegenerate
              onRegenerate={onRegenerateInvite}
            />
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">E-mail de convites de escala</p>
                <p className="mt-0.5 text-slate-500 leading-relaxed">
                  Usado para avisar a equipe quando uma escala é publicada. Sem chave, os envios ficam em modo de teste.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chave de envio</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole a chave do serviço de e-mail"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Remetente</label>
              <input
                type="text"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="escalas@suaigreja.com.br"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {saved && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                Configurações salvas.
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={onLeaveMinistry}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Trocar de ministério
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair da conta
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
