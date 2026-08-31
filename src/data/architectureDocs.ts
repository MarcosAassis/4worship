export const PRISMA_SCHEMA_CODE = `// prisma/schema.prisma
// Modelagem Completa para o SaaS LouveScale (Multi-tenant, Escalas, Repertório e Resend)

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN          // Acesso total à organização, configurações, cobrança e relatórios
  TEAM_LEADER    // Cria e gerencia eventos, escalas, repertório e disparo de e-mails
  MUSICIAN       // Voluntário/Músico: visualiza suas escalas, repertório e confirma presença
}

enum AttendanceStatus {
  PENDING        // Notificação enviada, aguardando resposta
  CONFIRMED      // Músico confirmou presença no culto
  DECLINED       // Músico recusou a escala (dispara alerta ao líder)
}

enum EventStatus {
  DRAFT          // Rascunho interno em planejamento
  PUBLISHED      // Escala publicada e disparada via Resend
  COMPLETED      // Evento finalizado
  CANCELLED      // Evento cancelado
}

// ----------------------------------------------------
// Multi-Tenancy / Organizações (Igrejas e Ministérios)
// ----------------------------------------------------
model Organization {
  id          String   @id @default(uuid())
  name        String   // Ex: Ministério de Louvor Shammah
  churchName  String   // Ex: Igreja Batista Central
  city        String?
  logoUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       UserOrganization[]
  songs       Song[]
  events      Event[]
  notifLogs   NotificationLog[]

  @@map("organizations")
}

// ----------------------------------------------------
// Usuários e Membros do Ministério
// ----------------------------------------------------
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  phone        String?  // WhatsApp para notificações rápidas
  avatarUrl    String?
  refreshToken String?  // Armazena hash do refresh token JWT
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  organizations   UserOrganization[]
  scheduleMembers ScheduleMember[]
  availabilities  UserAvailability[]
  blockedDates    UserBlockedDate[]
  ledEvents       Event[]            @relation("EventLeader")

  @@map("users")
}

// Tabela intermediária para vínculo e papel do usuário na organização (Multi-tenant)
model UserOrganization {
  id             String       @id @default(uuid())
  userId         String
  organizationId String
  role           Role         @default(MUSICIAN)
  instruments    String[]     // Ex: ["Vocal Líder", "Violão", "Bateria"]
  joinedAt       DateTime     @default(now())

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@map("user_organizations")
}

// Matriz de disponibilidade semanal do voluntário
model UserAvailability {
  id          String   @id @default(uuid())
  userId      String
  dayOfWeek   String   // DOMINGO_MANHA, DOMINGO_NOITE, QUARTA, SABADO, etc.
  available   Boolean  @default(true)
  notes       String?  // Ex: "Apenas a cada 15 dias"

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, dayOfWeek])
  @@map("user_availabilities")
}

// Datas específicas de bloqueio (ex: férias, viagens, trabalho)
model UserBlockedDate {
  id        String   @id @default(uuid())
  userId    String
  date      DateTime // Data do bloqueio
  reason    String?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_blocked_dates")
}

// ----------------------------------------------------
// Repertório & Músicas
// ----------------------------------------------------
model Song {
  id             String   @id @default(uuid())
  organizationId String
  title          String
  artist         String
  defaultKey     String   // Ex: "G", "C", "F#m"
  bpm            Int?
  timeSignature  String?  @default("4/4")
  cifraClubUrl   String?
  youtubeUrl     String?
  spotifyUrl     String?
  lyrics         String?  @db.Text
  chords         String?  @db.Text
  tags           String[] // Ex: ["Adoração", "Ceia", "Abertura"]
  technicalNotes String?  @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  setlists       SongSetlist[]

  @@map("songs")
}

// ----------------------------------------------------
// Eventos e Cultos
// ----------------------------------------------------
model Event {
  id             String       @id @default(uuid())
  organizationId String
  leaderId       String
  title          String       // Ex: "Culto de Celebração de Domingo"
  description    String?
  date           DateTime     // Data do evento
  time           String       // "19:00"
  endTime        String?      // "21:00"
  location       String       // "Nave Principal"
  status         EventStatus  @default(DRAFT)
  generalNotes   String?      @db.Text
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  leader         User             @relation("EventLeader", fields: [leaderId], references: [id])
  members        ScheduleMember[]
  setlist        SongSetlist[]
  notifLogs      NotificationLog[]

  @@map("events")
}

// Músicos e Funções na Escala do Evento
model ScheduleMember {
  id            String           @id @default(uuid())
  eventId       String
  userId        String
  instrument    String           // Instrumento/Função na escala (ex: "Bateria", "Vocal")
  status        AttendanceStatus @default(PENDING)
  token         String           @unique @default(uuid()) // Token de acesso seguro direto (sem senha) no e-mail do Resend
  declineReason String?          // Justificativa caso recuse
  notifiedAt    DateTime?        // Data de disparo do e-mail Resend
  respondedAt   DateTime?        // Data da confirmação/recusa

  event         Event            @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId, instrument])
  @@map("schedule_members")
}

// Músicas do Setlist do Evento
model SongSetlist {
  id           String   @id @default(uuid())
  eventId      String
  songId       String
  assignedKey  String   // Tom específico para o culto
  leadSingerId String?  // Cantor principal que vai solar a música
  order        Int      // Ordem no culto (1, 2, 3...)
  customNotes  String?

  event        Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  song         Song     @relation(fields: [songId], references: [id], onDelete: Cascade)

  @@unique([eventId, order])
  @@map("song_setlists")
}

// ----------------------------------------------------
// Logs de Auditoria de E-mails Enviados via Resend
// ----------------------------------------------------
model NotificationLog {
  id             String   @id @default(uuid())
  organizationId String
  eventId        String
  recipientEmail String
  recipientName  String
  type           String   // SCHEDULE_INVITE, SUBSTITUTION_ALERT, etc.
  status         String   // SENT, FAILED
  resendId       String?  // ID retornado pela API do Resend
  subject        String
  sentAt         DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  event          Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("notification_logs")
}
`;

export const FOLDER_STRUCTURE_DOC = `# ESTRUTURA DE PASTAS RECOMENDADA (MONOREPO / SPLIT)

## 📁 1. Backend (Node.js + Express + Prisma no Render)
/backend
├── src/
│   ├── config/
│   │   ├── env.ts                # Validação de variáveis (.env) com Zod
│   │   └── resend.ts             # Instância configurada do cliente Resend
│   ├── controllers/
│   │   ├── auth.controller.ts     # Login, Register, Refresh Token, Me
│   │   ├── organization.controller.ts
│   │   ├── user.controller.ts     # CRUD de voluntários, disponibilidade
│   │   ├── song.controller.ts     # CRUD repertório, cifras e tags
│   │   ├── event.controller.ts    # CRUD eventos e setlists
│   │   └── schedule.controller.ts # Escalação, validação conflitos, RSVP público
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # Validação JWT Bearer Token
│   │   ├── role.middleware.ts     # RBAC (ADMIN, TEAM_LEADER, MUSICIAN)
│   │   └── error.middleware.ts    # Tratador global de exceções
│   ├── services/
│   │   ├── auth.service.ts        # Hash bcrypt, geração JWT/Refresh
│   │   ├── schedule.service.ts    # Lógica de negócio e checagem de conflitos
│   │   ├── conflict.service.ts    # Validador de sobreposição de horários
│   │   └── email.service.ts       # Disparo transacional via Resend & Templates
│   ├── templates/
│   │   ├── schedule-invite.html   # Template HTML convite de escala
│   │   └── substitution-alert.html# Template HTML alerta de substituição
│   ├── prisma/
│   │   ├── schema.prisma          # Definição das tabelas PostgreSQL
│   │   ├── migrations/            # Histórico de migrações Prisma
│   │   └── seed.ts                # Seed inicial de ministérios e repertório
│   ├── utils/
│   │   └── chordTransposer.ts     # Utilitário de transposição de tom
│   ├── app.ts                     # Configuração Express, Middlewares, CORS
│   └── server.ts                  # Entrypoint do servidor HTTP
├── .env.example
├── Dockerfile                     # Pronto para deploy no Render
├── package.json
└── tsconfig.json

---

## 📁 2. Frontend (React + Next.js / Vite + Tailwind na Vercel)
/frontend
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── OrgSwitcher.tsx
│   │   ├── schedules/
│   │   │   ├── ScheduleCalendar.tsx
│   │   │   ├── ScaleRosterBuilder.tsx
│   │   │   ├── ConflictWarningBadge.tsx
│   │   │   └── SetlistEditor.tsx
│   │   ├── songs/
│   │   │   ├── SongCard.tsx
│   │   │   ├── ChordViewer.tsx
│   │   │   └── ToneTransposer.tsx
│   │   ├── musicians/
│   │   │   ├── MusicianTable.tsx
│   │   │   └── AvailabilityMatrix.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSchedule.ts
│   │   └── useConflictDetector.ts
│   ├── pages/ (ou app/ no Next.js)
│   │   ├── dashboard/
│   │   ├── escalas/
│   │   ├── repertorio/
│   │   ├── musicos/
│   │   ├── configuracoes/
│   │   └── rsvp/ [token].tsx      # Página pública de RSVP direto do e-mail
│   ├── services/
│   │   └── api.ts                 # Axios / Fetch client com interceptor de token
│   ├── types/
│   │   └── index.ts               # Tipagens compartilhadas com backend
│   └── index.css                  # Tailwind CSS
├── .env.example
├── package.json
└── vite.config.ts (ou next.config.mjs)
`;

export const RESEND_SERVICE_TS_CODE = `// src/services/email.service.ts
// Módulo de integração completa com o Resend para Notificação de Escalas e Alertas

import { Resend } from 'resend';
import { prisma } from '../config/database'; // Sua instância Prisma

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'escalas@louvescale.com.br';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sua-app.vercel.app';

interface SendScheduleInviteParams {
  memberId: string;
  recipientEmail: string;
  recipientName: string;
  instrument: string;
  token: string;
  event: {
    id: string;
    title: string;
    date: Date;
    time: string;
    location: string;
    leaderName: string;
    generalNotes?: string | null;
  };
  setlist: Array<{
    title: string;
    artist: string;
    key: string;
    cifraClubUrl?: string | null;
    youtubeUrl?: string | null;
  }>;
  organizationName: string;
  churchName: string;
}

export class EmailService {
  /**
   * Envia o e-mail de convite para a escala com botões interativos de 1-clique (Token RSVP)
   */
  static async sendScheduleInvite(params: SendScheduleInviteParams) {
    const {
      memberId,
      recipientEmail,
      recipientName,
      instrument,
      token,
      event,
      setlist,
      organizationName,
      churchName,
    } = params;

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
    }).format(new Date(event.date));

    const confirmUrl = \`\${FRONTEND_URL}/rsvp?token=\${token}&status=CONFIRMED\`;
    const declineUrl = \`\${FRONTEND_URL}/rsvp?token=\${token}&status=DECLINED\`;
    const detailsUrl = \`\${FRONTEND_URL}/rsvp?token=\${token}\`;

    const setlistRows = setlist.length > 0
      ? setlist
          .map(
            (song, index) => \`
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: 600; color: #1e293b;">\${index + 1}. \${song.title}</td>
            <td style="padding: 10px; color: #64748b;">\${song.artist}</td>
            <td style="padding: 10px; text-align: center; color: #4f46e5; font-weight: bold;">\${song.key}</td>
            <td style="padding: 10px; text-align: right;">
              \${song.cifraClubUrl ? \`<a href="\${song.cifraClubUrl}" target="_blank" style="color: #f97316; text-decoration: none; margin-right: 6px;">🎸 Cifra</a>\` : ''}
              \${song.youtubeUrl ? \`<a href="\${song.youtubeUrl}" target="_blank" style="color: #ef4444; text-decoration: none;">▶ YouTube</a>\` : ''}
            </td>
          </tr>
        \`
          )
          .join('')
      : '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #94a3b8;">Repertório em definição.</td></tr>';

    const htmlContent = \`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #334155; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: #312e81; color: #ffffff; padding: 28px; text-align: center; }
          .body { padding: 24px; }
          .badge { background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
          .actions { background: #faf5ff; padding: 24px; text-align: center; border-radius: 8px; margin-top: 20px; }
          .btn-confirm { background: #10b981; color: white; padding: 12px 22px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 8px; display: inline-block; }
          .btn-decline { background: #ef4444; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <p style="margin: 0; font-size: 13px; color: #a5b4fc; text-transform: uppercase;">\${churchName}</p>
            <h1 style="margin: 6px 0 0 0; font-size: 22px;">\${organizationName}</h1>
          </div>
          <div class="body">
            <p>Olá, <strong>\${recipientName}</strong>!</p>
            <p>Você foi escalado para servir ao Senhor no louvor:</p>
            
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0; color: #1e1b4b;">\${event.title}</h3>
              <p style="margin: 4px 0;">📅 <strong>Data:</strong> \${formattedDate}</p>
              <p style="margin: 4px 0;">⏰ <strong>Horário:</strong> \${event.time}</p>
              <p style="margin: 4px 0;">📍 <strong>Local:</strong> \${event.location}</p>
              <p style="margin: 4px 0;">🎸 <strong>Função:</strong> <span class="badge">\${instrument}</span></p>
              <p style="margin: 4px 0;">👤 <strong>Líder:</strong> \${event.leaderName}</p>
              \${event.generalNotes ? \`<p style="margin: 8px 0 0 0; font-style: italic; color: #475569;">📝 "\${event.generalNotes}"</p>\` : ''}
            </div>

            <h4 style="margin: 20px 0 8px 0;">🎵 Repertório da Escala:</h4>
            <table width="100%" style="border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                  <th style="padding: 8px;">Música</th>
                  <th style="padding: 8px;">Artista</th>
                  <th style="padding: 8px; text-align: center;">Tom</th>
                  <th style="padding: 8px; text-align: right;">Links</th>
                </tr>
              </thead>
              <tbody>
                \${setlistRows}
              </tbody>
            </table>

            <div class="actions">
              <h4 style="margin: 0 0 14px 0; color: #4c1d95;">Confirme sua presença com 1 clique (sem senha):</h4>
              <a href="\${confirmUrl}" class="btn-confirm">✅ Confirmar Presença</a>
              <a href="\${declineUrl}" class="btn-decline">❌ Não Posso Ir</a>
              <p style="margin: 14px 0 0 0; font-size: 12px; color: #6b21a8;">
                Ou veja o repertório completo com cifras em <a href="\${detailsUrl}">sua página de escala</a>.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    \`;

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipientEmail],
        subject: \`🎸 Nova Escala de Louvor: \${event.title} (\${event.time})\`,
        html: htmlContent,
      });

      if (error) {
        console.error('Erro Resend:', error);
        throw new Error(error.message);
      }

      // Atualiza data de notificação e registra log no banco
      await prisma.scheduleMember.update({
        where: { id: memberId },
        data: { notifiedAt: new Date() },
      });

      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error('Falha ao enviar e-mail via Resend:', err);
      throw err;
    }
  }

  /**
   * Alerta o líder imediatamente quando um voluntário recusa a escala
   */
  static async sendSubstitutionAlert(params: {
    leaderEmail: string;
    leaderName: string;
    musicianName: string;
    instrument: string;
    eventTitle: string;
    eventDate: string;
    declineReason?: string;
    eventId: string;
  }) {
    const { leaderEmail, leaderName, musicianName, instrument, eventTitle, eventDate, declineReason, eventId } = params;

    const htmlContent = \`
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; background: #ffffff;">
        <h2 style="color: #dc2626; margin-top: 0;">⚠️ Alerta de Recusa de Escala</h2>
        <p>Olá, Líder <strong>\${leaderName}</strong>,</p>
        <p>O músico <strong>\${musicianName}</strong> acabou de recusar a escala para <strong>\${instrument}</strong> no evento:</p>
        <div style="background: #fef2f2; padding: 12px; border-left: 4px solid #ef4444; border-radius: 4px; margin: 12px 0;">
          <strong>Evento:</strong> \${eventTitle} (\${eventDate})<br/>
          <strong>Função Vaga:</strong> \${instrument}<br/>
          <strong>Justificativa:</strong> "\${declineReason || 'Sem justificativa informada'}"
        </div>
        <p>Acesse o LouveScale para escalar um substituto imediatamente:</p>
        <a href="\${FRONTEND_URL}/escalas/\${eventId}" style="background: #1e1b4b; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Escalar Substituto</a>
      </div>
    \`;

    return resend.emails.send({
      from: FROM_EMAIL,
      to: [leaderEmail],
      subject: \`⚠️ [LouveScale] Recusa de Escala: \${musicianName} (\${instrument})\`,
      html: htmlContent,
    });
  }
}
`;

export const DEPLOY_GUIDE_MD = `# GUIA COMPLETO DE DEPLOY (RENDER + VERCEL)

Este guia cobre o passo a passo para colocar o **LouveScale** em produção com alta performance, banco PostgreSQL, CORS configurado e e-mails transacionais Resend.

---

## 🚀 PARTE 1: Banco de Dados PostgreSQL & Backend no Render

### 1. Criar Banco PostgreSQL no Render
1. Acesse seu painel no [Render](https://dashboard.render.com/).
2. Clique em **New +** > **PostgreSQL**.
3. Defina:
   - **Name:** \`louvescale-postgres\`
   - **Database:** \`louvescale_db\`
   - **User:** \`louvescale_user\`
   - **Region:** Ohio (ou a mais próxima do Brasil / seu público)
   - **Plan:** Free ou Starter.
4. Após criado, copie a **Internal Database URL** (se backend rodar no Render) ou **External Database URL**.

---

### 2. Configurar o Web Service do Backend no Render
1. Clique em **New +** > **Web Service**.
2. Conecte o repositório do seu backend (ex: \`github.com/seu-usuario/louvescale-backend\`).
3. Configure os campos de Build & Start:
   - **Runtime:** \`Node\`
   - **Build Command:** \`npm install && npx prisma generate && npx prisma migrate deploy && npm run build\`
   - **Start Command:** \`npm run start\`
4. Adicione as **Variáveis de Ambiente (Environment Variables)** no Render:
   \`\`\`env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://louvescale_user:SUA_SENHA@dpg-xxxx.render.com/louvescale_db
   JWT_SECRET=crie-um-hash-seguro-jwt-256-bits
   JWT_REFRESH_SECRET=outro-hash-seguro-refresh-token
   RESEND_API_KEY=re_123456789_abcdef
   RESEND_FROM_EMAIL=escalas@seu-dominio-verificado.com.br
   FRONTEND_URL=https://louvescale.vercel.app
   \`\`\`

---

### 3. Dockerfile para o Backend (Opcional - caso prefira Docker no Render)
\`\`\`dockerfile
# /backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "dist/server.js"]
\`\`\`

---

## ⚡ PARTE 2: Frontend na Vercel

### 1. Configurar o Projeto na Vercel
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard) e clique em **Add New...** > **Project**.
2. Importe o repositório do frontend (ex: \`louvescale-frontend\`).
3. Framework Preset: **Next.js** ou **Vite**.
4. Configure as Variáveis de Ambiente na Vercel:
   \`\`\`env
   VITE_API_URL=https://louvescale-backend.onrender.com
   # ou NEXT_PUBLIC_API_URL se usar Next.js
   NEXT_PUBLIC_API_URL=https://louvescale-backend.onrender.com
   \`\`\`
5. Clique em **Deploy**. A Vercel gerará sua URL pública (ex: \`https://louvescale.vercel.app\`).

---

## ✉️ PARTE 3: Configuração do Domínio no Resend

1. Acesse o painel do [Resend](https://resend.com/domains).
2. Clique em **Add Domain** e insira o domínio da sua igreja ou ministério (ex: \`louvescale.com.br\`).
3. Adicione os registros DNS (DKIM, SPF e MX de retorno) no seu provedor de DNS (Cloudflare, GoDaddy, Hostgator, Registro.br).
4. Após status **Verified**, crie uma chave em **API Keys** com permissão de envio.
5. Coloque a chave \`re_xxxx\` no Render sob \`RESEND_API_KEY\`.

---

## 🔒 PARTE 4: CORS Seguro no Express

\`\`\`typescript
// backend/src/app.ts
import cors from 'cors';
import express from 'express';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL || 'https://louvescale.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem bloqueada pelas políticas de CORS do LouveScale'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
\`\`\`
`;
