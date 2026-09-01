import { WorshipEvent, ScheduleMember, EmailNotificationLog } from '../types';
import { apiUrl } from './apiBase';

export interface ResendSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isSimulated?: boolean;
}

export class ResendEmailService {
  private static apiKey: string = '';
  private static fromEmail: string = 'escalas@4worship.com';

  public static setCredentials(key: string, from?: string) {
    this.apiKey = key;
    if (from) this.fromEmail = from;
  }

  public static getCredentials() {
    return {
      apiKey: this.apiKey,
      fromEmail: this.fromEmail,
      isConfigured: Boolean(this.apiKey && this.apiKey.startsWith('re_')),
    };
  }

  /**
   * Generates a modern, responsive HTML email template for Schedule Invitation
   */
  public static generateScheduleInviteHtml(params: {
    musicianName: string;
    instrument: string;
    event: WorshipEvent;
    token: string;
    organizationName: string;
    churchName: string;
    appBaseUrl: string;
  }): string {
    const { musicianName, instrument, event, token, organizationName, churchName, appBaseUrl } = params;
    
    // Format date in Portuguese (e.g. Domingo, 06 de Setembro de 2026)
    const [year, month, day] = event.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    const confirmUrl = `${appBaseUrl}?action=rsvp&token=${token}&status=CONFIRMED`;
    const declineUrl = `${appBaseUrl}?action=rsvp&token=${token}&status=DECLINED`;
    const portalUrl = `${appBaseUrl}?action=rsvp&token=${token}`;

    const setlistRowsHtml = event.setlist.length > 0 
      ? event.setlist.map((item, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-size: 14px; font-weight: 600; color: #1e293b;">${idx + 1}. ${item.song.title}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #64748b;">${item.song.artist}</td>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: bold; color: #4f46e5; text-align: center;">
            <span style="background-color: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px;">Tom: ${item.assignedKey || item.song.defaultKey}</span>
          </td>
          <td style="padding: 10px 12px; font-size: 13px; text-align: right;">
            ${item.song.cifraClubUrl ? `<a href="${item.song.cifraClubUrl}" target="_blank" style="color: #f97316; text-decoration: none; margin-right: 8px; font-weight: 500;">🎸 Cifra</a>` : ''}
            ${item.song.youtubeUrl ? `<a href="${item.song.youtubeUrl}" target="_blank" style="color: #ef4444; text-decoration: none; font-weight: 500;">▶ YouTube</a>` : ''}
          </td>
        </tr>
      `).join('')
      : `<tr><td colspan="4" style="padding: 14px; text-align: center; color: #94a3b8; font-style: italic;">Repertório ainda em definição pelo líder.</td></tr>`;

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Escala de Louvor: ${event.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #a5b4fc; margin-bottom: 6px;">${churchName}</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${organizationName}</h1>
              <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 4px 16px; font-size: 13px; font-weight: 500;">
                🎸 Notificação Oficial de Escala
              </div>
            </td>
          </tr>

          <!-- Welcome & Volunteer Intro -->
          <tr>
            <td style="padding: 28px 24px 16px 24px;">
              <p style="margin: 0 0 12px 0; font-size: 17px; line-height: 1.5; color: #0f172a;">
                Olá, <strong>${musicianName}</strong>! Graça e paz.
              </p>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Você foi escalado para servir ao Senhor no louvor no seguinte evento:
              </p>
            </td>
          </tr>

          <!-- Event Summary Card -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 10px; border-left: 4px solid #4f46e5; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px;">${event.title}</div>
                    
                    <div style="font-size: 14px; margin-bottom: 6px; color: #334155;">
                      📅 <strong>Data:</strong> ${formattedDate} (${event.date})
                    </div>
                    <div style="font-size: 14px; margin-bottom: 6px; color: #334155;">
                      ⏰ <strong>Horário:</strong> ${event.time} ${event.endTime ? `às ${event.endTime}` : ''}
                    </div>
                    <div style="font-size: 14px; margin-bottom: 6px; color: #334155;">
                      📍 <strong>Local:</strong> ${event.location}
                    </div>
                    <div style="font-size: 14px; margin-bottom: 6px; color: #334155;">
                      👑 <strong>Sua Função/Instrumento:</strong> <span style="background-color: #dbeafe; color: #1e40af; font-weight: 700; padding: 2px 8px; border-radius: 4px;">${instrument}</span>
                    </div>
                    <div style="font-size: 14px; color: #334155;">
                      👤 <strong>Líder Responsável:</strong> ${event.leaderName}
                    </div>
                    
                    ${event.generalNotes ? `
                      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #475569; font-style: italic;">
                        📝 <strong>Observações do Líder:</strong> "${event.generalNotes}"
                      </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Repertoire / Setlist Section -->
          <tr>
            <td style="padding: 10px 24px 20px 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1e293b; display: flex; align-items: center;">
                🎵 Repertório & Músicas Selecionadas (${event.setlist.length})
              </h3>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 8px 12px; font-size: 12px; text-align: left; color: #64748b; font-weight: 700; text-transform: uppercase;">Música</th>
                    <th style="padding: 8px 12px; font-size: 12px; text-align: left; color: #64748b; font-weight: 700; text-transform: uppercase;">Artista</th>
                    <th style="padding: 8px 12px; font-size: 12px; text-align: center; color: #64748b; font-weight: 700; text-transform: uppercase;">Tom</th>
                    <th style="padding: 8px 12px; font-size: 12px; text-align: right; color: #64748b; font-weight: 700; text-transform: uppercase;">Links</th>
                  </tr>
                </thead>
                <tbody>
                  ${setlistRowsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Action Buttons (1-Click RSVP via Token) -->
          <tr>
            <td style="padding: 20px 24px 32px 24px; text-align: center; background-color: #faf5ff; border-top: 1px solid #f3e8ff;">
              <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #4c1d95;">
                Por favor, confirme sua participação com 1 clique:
              </h4>
              
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="padding-right: 12px;">
                    <a href="${confirmUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 24px; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.35);">
                      ✅ Confirmar Presença
                    </a>
                  </td>
                  <td align="center">
                    <a href="${declineUrl}" target="_blank" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 20px; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);">
                      ❌ Não Posso ir
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 18px 0 0 0; font-size: 12px; color: #7c3aed;">
                Não é necessário fazer login! Ou acesse sua <a href="${portalUrl}" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">página detalhada da escala</a> para ver as cifras completas.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">${organizationName} &bull; 4worship</p>
              <p style="margin: 0;">Enviado com segurança via Resend API &bull; Você recebeu este e-mail por ser membro voluntário cadastrado.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generates a modern HTML email template for Leader Substitution Alert
   */
  public static generateSubstitutionAlertHtml(params: {
    leaderName: string;
    musicianName: string;
    instrument: string;
    event: WorshipEvent;
    declineReason?: string;
    appBaseUrl: string;
  }): string {
    const { leaderName, musicianName, instrument, event, declineReason, appBaseUrl } = params;
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Alerta de Substituição de Escala</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif; color: #334155;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #fee2e2; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          
          <tr>
            <td style="background-color: #dc2626; padding: 24px; text-align: center; color: #ffffff;">
              <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">⚠️ Alerta de Substituição Imediata</div>
              <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff;">Músico Recusou a Escala</h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 15px; margin: 0 0 16px 0;">Olá, Líder <strong>${leaderName}</strong>,</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #991b1b; font-weight: 700;">
                  ${musicianName} não poderá participar no culto:
                </p>
                <div style="font-size: 14px; color: #7f1d1d; margin-bottom: 4px;">
                  📌 <strong>Evento:</strong> ${event.title} (${event.date} às ${event.time})
                </div>
                <div style="font-size: 14px; color: #7f1d1d; margin-bottom: 4px;">
                  🎸 <strong>Instrumento Vago:</strong> ${instrument}
                </div>
                <div style="font-size: 14px; color: #7f1d1d;">
                  📝 <strong>Motivo informado:</strong> "${declineReason || 'Não informado pelo voluntário'}"
                </div>
              </div>

              <p style="font-size: 14px; line-height: 1.5; color: #475569;">
                Acesse o painel do 4worship agora para escalar outro músico substituto para a função de <strong>${instrument}</strong>.
              </p>

              <div style="text-align: center; margin: 24px 0 12px 0;">
                <a href="${appBaseUrl}?eventId=${event.id}" target="_blank" style="background-color: #1e1b4b; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block;">
                  🛠️ Abrir Escala e Escalar Substituto
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
              4worship Notificações Automáticas &bull; Powered by Resend
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Sends email through the backend (Resend key stays on the server).
   */
  public static async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<ResendSendResult> {
    try {
      const response = await fetch(apiUrl('/api/email/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = (await response.json().catch(() => ({}))) as ResendSendResult & { message?: string };
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Falha ao enviar e-mail.',
          isSimulated: false,
        };
      }
      return {
        success: Boolean(data.success),
        messageId: data.messageId,
        error: data.error,
        isSimulated: data.isSimulated,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de rede ao enviar e-mail.';
      return {
        success: false,
        error: message,
        isSimulated: false,
      };
    }
  }
}
