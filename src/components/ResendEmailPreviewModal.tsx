import React, { useState } from 'react';
import { X, Send, Mail, Check, Copy } from 'lucide-react';
import { WorshipEvent, ScheduleMember, Organization } from '../types';
import { ResendEmailService } from '../services/resendService';

interface ResendEmailPreviewModalProps {
  event: WorshipEvent;
  activeOrg: Organization;
  onClose: () => void;
  onSendRealEmail?: (to: string, subject: string, html: string) => Promise<void>;
}

export const ResendEmailPreviewModal: React.FC<ResendEmailPreviewModalProps> = ({
  event,
  activeOrg,
  onClose,
  onSendRealEmail,
}) => {
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [templateType, setTemplateType] = useState<'INVITE' | 'ALERT'>('INVITE');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const currentMember = event.members[selectedMemberIndex] || event.members[0];

  const appBaseUrl = window.location.origin;

  const inviteHtml = currentMember ? ResendEmailService.generateScheduleInviteHtml({
    musicianName: currentMember.user.name,
    instrument: currentMember.instrument,
    event: event,
    token: currentMember.token,
    organizationName: activeOrg.name,
    churchName: activeOrg.churchName,
    appBaseUrl: appBaseUrl,
  }) : '';

  const alertHtml = currentMember ? ResendEmailService.generateSubstitutionAlertHtml({
    leaderName: event.leaderName,
    musicianName: currentMember.user.name,
    instrument: currentMember.instrument,
    event: event,
    declineReason: currentMember.declineReason || 'Plantão emergencial / indisponibilidade de agenda.',
    appBaseUrl: appBaseUrl,
  }) : '';

  const currentHtml = templateType === 'INVITE' ? inviteHtml : alertHtml;
  const currentSubject = templateType === 'INVITE'
    ? `🎸 Nova Escala de Louvor: ${event.title} (${event.date})`
    : `⚠️ Alerta de Recusa de Escala: ${currentMember?.user.name} (${currentMember?.instrument})`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTest = async () => {
    if (!currentMember) return;
    setIsSending(true);
    setSendSuccess(null);

    const result = await ResendEmailService.sendEmail({
      to: currentMember.user.email,
      subject: currentSubject,
      html: currentHtml,
    });

    setIsSending(false);
    if (result.success) {
      setSendSuccess(result.isSimulated ? 'Prévia enviada em modo teste.' : 'E-mail enviado.');
    } else {
      setSendSuccess(`Erro: ${result.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-slate-50/90 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Prévia do convite</h3>
              <p className="text-xs text-slate-500">
                Como o voluntário verá o e-mail da escala.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 shadow-xs transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="bg-white px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Template Type Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-600 font-bold text-xs">Tipo:</span>
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-1 flex">
              <button
                onClick={() => setTemplateType('INVITE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  templateType === 'INVITE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Convite de Escala
              </button>
              <button
                onClick={() => setTemplateType('ALERT')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  templateType === 'ALERT'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alerta de Substituição
              </button>
            </div>
          </div>

          {/* Member Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-600 font-bold text-xs">Destinatário:</span>
            <select
              aria-label="Selecionar Destinatário do E-mail"
              value={selectedMemberIndex}
              onChange={(e) => setSelectedMemberIndex(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none"
            >
              {event.members.map((m, idx) => (
                <option key={m.id} value={idx}>
                  {m.user.name} ({m.instrument}) - {m.user.email}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode & Test Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendTest}
              disabled={isSending}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Enviando...' : 'Enviar teste'}</span>
            </button>
          </div>

        </div>

        {/* Subject Bar */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <div className="truncate text-xs">
            <strong className="text-slate-500">Assunto:</strong> <span className="text-slate-900 font-semibold">{currentSubject}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1 text-indigo-700 hover:text-indigo-900 ml-3 flex-shrink-0 font-bold text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {sendSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs text-emerald-800 font-bold flex items-center justify-between">
            <span>✅ {sendSuccess}</span>
            <button onClick={() => setSendSuccess(null)} className="text-emerald-700 hover:text-slate-900">✕</button>
          </div>
        )}

        {/* Modal Body Preview */}
        <div className="p-4 max-h-[60vh] overflow-y-auto bg-slate-100">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 shadow-sm max-w-2xl mx-auto text-slate-800">
            <div
              dangerouslySetInnerHTML={{ __html: currentHtml }}
              className="email-rendered-preview"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50/90 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            4worship · convite da escala
          </span>
          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
