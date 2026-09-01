import React, { useEffect, useState } from 'react';
import {
  Send,
  Mail,
  CheckCircle2,
  Eye,
  Settings,
} from 'lucide-react';
import { EmailNotificationLog, WorshipEvent, Organization } from '../types';
import { ResendEmailService } from '../services/resendService';
import { fetchApiHealth } from '../services/musicSearchApi';
import { MusicSearchHealth } from '../types/musicSearch';

interface ResendNotificationsViewProps {
  logs: EmailNotificationLog[];
  events: WorshipEvent[];
  activeOrg: Organization;
  onOpenSettings: () => void;
  onPreviewEmail: (event: WorshipEvent) => void;
}

export const ResendNotificationsView: React.FC<ResendNotificationsViewProps> = ({
  logs,
  events,
  activeOrg,
  onOpenSettings,
  onPreviewEmail,
}) => {
  const [testEmail, setTestEmail] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mailHealth, setMailHealth] = useState<MusicSearchHealth | null>(null);

  useEffect(() => {
    fetchApiHealth().then(setMailHealth);
  }, []);

  const mailConfigured = Boolean(mailHealth?.resend);

  const handleSendTestScale = async () => {
    if (!testEmail) {
      alert('Informe o e-mail de destino.');
      return;
    }
    const targetEvent = events.find((e) => e.id === selectedEventId) || events[0];
    if (!targetEvent) return;

    setIsSending(true);
    setFeedback(null);

    const html = ResendEmailService.generateScheduleInviteHtml({
      musicianName: 'Voluntário',
      instrument: 'Vocal líder',
      event: targetEvent,
      token: 'tok_preview',
      organizationName: activeOrg.name,
      churchName: activeOrg.churchName,
      appBaseUrl: window.location.origin,
    });

    const result = await ResendEmailService.sendEmail({
      to: testEmail,
      subject: `Convite de escala: ${targetEvent.title}`,
      html: html,
    });

    setIsSending(false);
    if (result.success) {
      setFeedback({
        type: 'success',
        message: `Convite enviado para ${testEmail}.`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: `Não foi possível enviar: ${result.error}`,
      });
    }
  };

  const typeLabel = (type: EmailNotificationLog['type']) => {
    if (type === 'SCHEDULE_INVITE') return 'Convite';
    if (type === 'SUBSTITUTION_ALERT') return 'Substituição';
    return 'Confirmação';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="md:hidden">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Convites</h2>
          <p className="text-slate-500 text-xs mt-0.5">Histórico de envios para a equipe</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto sm:ml-auto"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>{mailConfigured ? 'E-mail configurado' : 'E-mail no servidor'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Envio de convites
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                mailConfigured
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {mailConfigured ? 'Ativo' : 'Modo teste'}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Ao publicar uma escala, cada voluntário recebe um convite com o repertório e um link para confirmar presença.
          </p>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Remetente</p>
            <p className="mt-0.5 font-semibold text-slate-800">{mailHealth?.fromEmail || 'onboarding@resend.dev'}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            Enviar um convite de teste
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="voluntario@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Escala</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                const target = events.find((e) => e.id === selectedEventId) || events[0];
                if (target) onPreviewEmail(target);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              Prévia do convite
            </button>
            <button
              onClick={handleSendTestScale}
              disabled={isSending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Enviando...' : 'Enviar teste'}
            </button>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">Histórico ({logs.length})</h3>

        <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">Tipo</th>
                <th className="p-3">Destinatário</th>
                <th className="p-3">Assunto</th>
                <th className="p-3">Quando</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        log.type === 'SCHEDULE_INVITE'
                          ? 'bg-indigo-50 text-indigo-700'
                          : log.type === 'SUBSTITUTION_ALERT'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {typeLabel(log.type)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{log.recipientName}</div>
                    <div className="text-[11px] text-slate-500">{log.recipientEmail}</div>
                  </td>
                  <td className="p-3 text-slate-700 max-w-xs truncate">{log.subject}</td>
                  <td className="p-3 text-slate-500">{new Date(log.sentAt).toLocaleString('pt-BR')}</td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Enviado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-indigo-700">{typeLabel(log.type)}</span>
                <span className="text-[10px] font-bold text-emerald-700">Enviado</span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-900">{log.recipientName}</p>
              <p className="text-[11px] text-slate-500 truncate">{log.subject}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
