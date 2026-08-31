import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Music, 
  ExternalLink, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft,
  Youtube
} from 'lucide-react';
import { WorshipEvent, ScheduleMember, AttendanceStatus, Organization } from '../types';

interface RsvpTokenPortalProps {
  event: WorshipEvent;
  member: ScheduleMember;
  activeOrg: Organization;
  onUpdateStatus: (eventId: string, memberId: string, status: AttendanceStatus, reason?: string) => void;
  onClose: () => void;
  allMembers: ScheduleMember[];
  onSwitchMember: (token: string) => void;
}

export const RsvpTokenPortal: React.FC<RsvpTokenPortalProps> = ({
  event,
  member,
  activeOrg,
  onUpdateStatus,
  onClose,
  allMembers,
  onSwitchMember,
}) => {
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [statusUpdated, setStatusUpdated] = useState<AttendanceStatus | null>(null);

  const handleConfirm = () => {
    onUpdateStatus(event.id, member.id, 'CONFIRMED');
    setStatusUpdated('CONFIRMED');
    
    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDecline = () => {
    if (!declineReason.trim()) {
      alert('Por favor, informe uma breve justificativa para que o líder possa organizar a substituição.');
      return;
    }
    onUpdateStatus(event.id, member.id, 'DECLINED', declineReason);
    setStatusUpdated('DECLINED');
    setShowDeclineForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-600">Prévia do convite</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Ver como</span>
            <select
              aria-label="Selecionar voluntário"
              value={member.token}
              onChange={(e) => onSwitchMember(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 font-semibold text-xs rounded-lg px-2.5 py-1 focus:outline-none"
            >
              {allMembers.map((m) => (
                <option key={m.id} value={m.token}>
                  {m.user.name} · {m.instrument}
                </option>
              ))}
            </select>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-900 font-bold">
              Fechar
            </button>
          </div>
        </div>

        {/* Portal Header */}
        <div className="bg-slate-50/80 p-6 text-center border-b border-slate-200 relative overflow-hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white mx-auto mb-2.5 shadow-sm">
            <Music className="h-5 w-5" />
          </div>
          <span className="text-xs uppercase tracking-wider text-indigo-600 font-extrabold">
            {activeOrg.churchName}
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Convite de Escala: {event.title}
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Olá, <strong className="text-slate-900">{member.user.name}</strong>! Confirme sua participação no louvor.
          </p>
        </div>

        {/* Status Confirmation Feedback */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Current Status Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            member.status === 'CONFIRMED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : member.status === 'DECLINED'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center space-x-3">
              {member.status === 'CONFIRMED' && <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />}
              {member.status === 'DECLINED' && <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />}
              {member.status === 'PENDING' && <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0" />}
              <div>
                <h4 className="font-bold text-sm">
                  {member.status === 'CONFIRMED' 
                    ? 'Presença Confirmada com Sucesso! 🎉' 
                    : member.status === 'DECLINED' 
                    ? 'Você Informou que Não Pode Comparecer' 
                    : 'Aguardando sua Confirmação'}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  Função designada: <strong>{member.instrument}</strong>
                </p>
              </div>
            </div>

            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
              member.status === 'CONFIRMED'
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : member.status === 'DECLINED'
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-amber-100 border-amber-300 text-amber-800'
            }`}>
              {member.status === 'CONFIRMED' ? 'Confirmado' : member.status === 'DECLINED' ? 'Recusado' : 'Pendente'}
            </span>
          </div>

          {/* Event Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Detalhes do Culto
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Data: <strong className="text-slate-900">{event.date}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Horário: <strong className="text-slate-900">{event.time} {event.endTime ? `às ${event.endTime}` : ''}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Local: <strong className="text-slate-900">{event.location}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <UserCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Líder: <strong className="text-slate-900">{event.leaderName}</strong></span>
              </div>
            </div>

            {event.generalNotes && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200 text-xs text-slate-600">
                📝 <strong>Avisos do Líder:</strong> "{event.generalNotes}"
              </div>
            )}
          </div>

          {/* Repertoire / Setlist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-2">
              <Music className="w-4 h-4 text-indigo-600" />
              <span>Repertório & Cifras ({event.setlist.length})</span>
            </h4>

            <div className="space-y-2">
              {event.setlist.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{item.song.title}</span>
                        <span className="text-xs text-slate-500">&bull; {item.song.artist}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs mt-0.5">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-indigo-200 text-[10px]">
                          Tom: {item.assignedKey}
                        </span>
                        {item.customNotes && (
                          <span className="text-slate-500 italic text-xs">&bull; {item.customNotes}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.song.cifraClubUrl && (
                      <a
                        href={item.song.cifraClubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-700 hover:text-amber-800 font-bold px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg"
                      >
                        🎸 Cifra
                      </a>
                    )}
                    {item.song.youtubeUrl && (
                      <a
                        href={item.song.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-rose-700 hover:text-rose-800 font-bold px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-1"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        <span>Vídeo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action RSVP Buttons */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-3.5">
            <h3 className="text-sm font-bold text-slate-800">
              Deseja confirmar ou atualizar sua resposta?
            </h3>

            {!showDeclineForm ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleConfirm}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 text-xs touch-manipulation"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Presença no Culto</span>
                </button>

                <button
                  onClick={() => setShowDeclineForm(true)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold px-5 py-2.5 rounded-xl transition text-xs shadow-xs touch-manipulation active:scale-95"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Não Poderei Comparecer</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-w-md mx-auto text-left bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
                <label className="block text-xs font-bold text-rose-800">
                  Justificativa para o líder de louvor:
                </label>
                <textarea
                  rows={2}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Ex: Plantão no trabalho, compromisso familiar..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setShowDeclineForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDecline}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition shadow-xs"
                  >
                    Confirmar Recusa
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Confirme direto por este link, sem precisar entrar no sistema.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50/90 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            4worship &bull; Gestão de Escalas de Louvor
          </span>
          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
          >
            Voltar ao Painel
          </button>
        </div>

      </div>
    </div>
  );
};
