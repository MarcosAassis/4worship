import { Resend } from 'resend';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isSimulated?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY || '';
  return key.startsWith('re_');
}

export function resendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || '4worship <onboarding@resend.dev>';
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = input.to.trim();
  const subject = input.subject.trim();
  const html = input.html.trim();

  if (!EMAIL_RE.test(to)) {
    return { success: false, error: 'E-mail de destino inválido.' };
  }
  if (!subject || subject.length > 200) {
    return { success: false, error: 'Assunto inválido.' };
  }
  if (!html || html.length > 400_000) {
    return { success: false, error: 'Conteúdo do e-mail inválido.' };
  }

  if (!isResendConfigured()) {
    return {
      success: true,
      messageId: `sim_${Date.now().toString(36)}`,
      isSimulated: true,
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: resendFromEmail(),
    to: [to],
    subject,
    html,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    messageId: data?.id,
    isSimulated: false,
  };
}
