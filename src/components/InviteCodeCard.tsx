import React, { useState } from 'react';
import { Copy, Check, Share2, RefreshCw, KeyRound } from 'lucide-react';
import { Organization } from '../types';
import {
  formatInviteCode,
  buildInviteShareText,
  getInviteLink,
} from '../services/inviteCode';

interface InviteCodeCardProps {
  org: Organization;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
}

export const InviteCodeCard: React.FC<InviteCodeCardProps> = ({
  org,
  canRegenerate = false,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const formatted = formatInviteCode(org.inviteCode);
  const appBaseUrl = window.location.origin;

  const markCopied = (kind: 'code' | 'link') => {
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(formatted);
    markCopied('code');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getInviteLink(org, appBaseUrl));
    markCopied('link');
  };

  const shareWhatsApp = () => {
    const text = buildInviteShareText(org, appBaseUrl);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Código do ministério</p>
            <p className="mt-0.5 max-w-md text-xs leading-relaxed text-slate-500">
              Envie este código para a equipe. Quem tiver o código entra como músico, sem precisar ser cadastrado por você.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="rounded-xl border border-indigo-200 bg-white px-3 py-2 font-mono text-lg font-black tracking-[0.18em] text-indigo-800 shadow-xs hover:bg-indigo-50"
            title="Copiar código"
          >
            {formatted}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          {copied === 'code' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied === 'code' ? 'Código copiado' : 'Copiar código'}
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          {copied === 'link' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied === 'link' ? 'Link copiado' : 'Copiar link'}
        </button>
        <button
          type="button"
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <Share2 className="h-3.5 w-3.5" />
          Enviar no WhatsApp
        </button>
        {canRegenerate && onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white hover:text-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Gerar novo código
          </button>
        )}
      </div>
    </div>
  );
};
