import { Organization, User, Song, WorshipEvent, EmailNotificationLog } from '../types';

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_1',
    name: 'Ministério de Louvor Shammah',
    churchName: 'Igreja Batista Central - Sede',
    city: 'São Paulo, SP',
    leadersCount: 3,
    musiciansCount: 18,
    inviteCode: 'SHAMMAH',
    inviteCodeUpdatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'org_2',
    name: 'Worship Jovens & Teens',
    churchName: 'Comunidade da Fé - Campus Sul',
    city: 'Curitiba, PR',
    leadersCount: 2,
    musiciansCount: 12,
    inviteCode: 'JOVENS',
    inviteCodeUpdatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'org_3',
    name: 'Louvor & Adoração Aliança',
    churchName: 'Igreja Presbiteriana Renovada',
    city: 'Belo Horizonte, MG',
    leadersCount: 2,
    musiciansCount: 9,
    inviteCode: 'ALIANCA',
    inviteCodeUpdatedAt: '2026-03-01T10:00:00Z',
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Marcos Paulo (Você)',
    email: 'marcos.mpab@gmail.com',
    phone: '+55 11 98765-4321',
    role: 'ADMIN',
    organizationId: 'org_1',
    instruments: ['Vocal Líder', 'Violão', 'Guitarra'],
    weeklyAvailability: [
      { day: 'DOMINGO_MANHA', available: true, notes: 'Disponível sempre' },
      { day: 'DOMINGO_NOITE', available: true, notes: 'Disponível sempre' },
      { day: 'QUARTA', available: true, notes: 'Apenas após as 19:30' },
      { day: 'SABADO', available: true, notes: 'Ensaios à tarde' },
    ],
    blockedDates: [],
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'usr_2',
    name: 'Débora Silveira',
    email: 'debora.silveira@exemplo.com.br',
    phone: '+55 11 99123-8877',
    role: 'TEAM_LEADER',
    organizationId: 'org_1',
    instruments: ['Vocal Líder', 'Teclado / Piano'],
    weeklyAvailability: [
      { day: 'DOMINGO_MANHA', available: true },
      { day: 'DOMINGO_NOITE', available: true },
      { day: 'QUARTA', available: false, notes: 'Aula na faculdade' },
      { day: 'SABADO', available: true },
    ],
    blockedDates: ['2026-09-14'],
    createdAt: '2025-01-15T11:00:00Z',
  },
  {
    id: 'usr_3',
    name: 'Lucas Drummond',
    email: 'lucas.drummond@exemplo.com.br',
    phone: '+55 11 97654-3210',
    role: 'MUSICIAN',
    organizationId: 'org_1',
    instruments: ['Bateria', 'Percussão'],
    weeklyAvailability: [
      { day: 'DOMINGO_MANHA', available: true },
      { day: 'DOMINGO_NOITE', available: true },
      { day: 'QUARTA', available: true },
      { day: 'SABADO', available: true },
    ],
    blockedDates: [],
    createdAt: '2025-02-01T14:00:00Z',
  },
  {
    id: 'usr_4',
    name: 'Gabriel Martins',
    email: 'gabriel.bass@exemplo.com.br',
    phone: '+55 11 98877-6655',
    role: 'MUSICIAN',
    organizationId: 'org_1',
    instruments: ['Baixo'],
    weeklyAvailability: [
      { day: 'DOMINGO_MANHA', available: true },
      { day: 'DOMINGO_NOITE', available: true },
      { day: 'QUARTA', available: false, notes: 'Plantão no trabalho' },
      { day: 'SABADO', available: false },
    ],
    blockedDates: ['2026-09-07'],
    createdAt: '2025-02-10T16:00:00Z',
  },
  {
    id: 'usr_5',
    name: 'Camila Rocha',
    email: 'camila.vocal@exemplo.com.br',
    phone: '+55 11 99443-2211',
    role: 'MUSICIAN',
    organizationId: 'org_1',
    instruments: ['Backing Vocal', 'Vocal Líder'],
    weeklyAvailability: [
      { day: 'DOMINGO_MANHA', available: true },
      { day: 'DOMINGO_NOITE', available: true },
      { day: 'QUARTA', available: true },
      { day: 'SABADO', available: true },
    ],
    blockedDates: [],
    createdAt: '2025-03-01T09:00:00Z',
  },
  {
    id: 'usr_6',
    name: 'Felipe Santana',
    email: 'felipe.keys@exemplo.com.br',
    phone: '+55 11 98112-3344',
    role: 'MUSICIAN',
    organizationId: 'org_1',
    instruments: ['Teclado / Piano'],
    weeklyAvailability: [
      { day: 'DOMINGO_MANHA', available: false, notes: 'Escalado na igreja filial' },
      { day: 'DOMINGO_NOITE', available: true },
      { day: 'QUARTA', available: true },
      { day: 'SABADO', available: true },
    ],
    blockedDates: [],
    createdAt: '2025-03-12T13:00:00Z',
  },
  {
    id: 'usr_7',
    name: 'Samuel Guimarães',
    email: 'samuel.audio@exemplo.com.br',
    phone: '+55 11 99554-1122',
    role: 'MUSICIAN',
    organizationId: 'org_1',
    instruments: ['Mesa de Som (Áudio)', 'Transmissão / Live'],
    weeklyAvailability: [
      { day: 'DOMINGO_MANHA', available: true },
      { day: 'DOMINGO_NOITE', available: true },
      { day: 'QUARTA', available: true },
      { day: 'SABADO', available: true },
    ],
    blockedDates: [],
    createdAt: '2025-03-20T10:00:00Z',
  }
];

export const INITIAL_SONGS: Song[] = [
  {
    id: 'sng_1',
    title: 'Bondade de Deus (Goodness of God)',
    artist: 'Isaías Saad / Bethel Worship',
    defaultKey: 'G',
    bpm: 70,
    timeSignature: '4/4',
    cifraClubUrl: 'https://www.cifraclub.com.br/isaias-saad/bondade-de-deus/',
    youtubeUrl: 'https://www.youtube.com/watch?v=n0FBb654ItE',
    tags: ['Adoração', 'Gratidão', 'Congregacional'],
    technicalNotes: 'Começar com dedilhado suave no violão e piano. Bateria entra no refrão 1 marcando o bumbo. Dinâmica crescente até a ponte (Tua fidelidade...).',
    chords: `[Intro]
[G]  [C]  [G]  [C]

[Verso 1]
[G]             [C]            [G]
 Te amo, Deus, Tua graça nunca falha
[D/F#]   [Em]         [C]            [D]
 Todos os dias eu estou em Tuas mãos
                [Em]     [C]
Desde quando me levanto
               [G]    [D/F#]  [Em]
Até quando me deito
   [C]            [D]         [G]
Eu cantarei da bondade de Deus

[Refrão]
[C]                           [G]
 És fiel em todo o tempo
[C]                               [G]     [D]
 Em todo o tempo Tu és tão, tão bom
[C]                           [Em]     [D]    [C]
 Com todo o fôlego que tenho
                [D]         [G]
Eu cantarei da bondade de Deus`,
    organizationId: 'org_1',
    updatedAt: '2026-08-20T14:30:00Z',
  },
  {
    id: 'sng_2',
    title: 'A Ele a Glória',
    artist: 'Gabriela Rocha',
    defaultKey: 'C',
    bpm: 68,
    timeSignature: '4/4',
    cifraClubUrl: 'https://www.cifraclub.com.br/gabriela-rocha/a-ele-a-gloria/',
    youtubeUrl: 'https://www.youtube.com/watch?v=Fj2F5pTzQxI',
    tags: ['Exaltação', 'Clássico', 'Ceia'],
    technicalNotes: 'Orquestração de cordas no pad do teclado. Tom original em C, mas Débora canta em D. Guitarra faz ambiência com delay pontilhado.',
    chords: `[Verso]
[C]                     [G/B]
Porque Dele e por Ele
          [Am]       [Am/G]
Para Ele são todas as coisas
[F]                     [Dm]
Porque Dele e por Ele
          [G]
Para Ele são todas as coisas

[Refrão]
         [C]        [G/B]
A Ele a glória, a Ele a glória
         [Am]       [Am/G]
A Ele a glória
         [F]    [G]    [C]
Pra sempre, amém!`,
    organizationId: 'org_1',
    updatedAt: '2026-08-18T10:15:00Z',
  },
  {
    id: 'sng_3',
    title: 'Leão',
    artist: 'Gabriela Rocha & Morada',
    defaultKey: 'E',
    bpm: 74,
    timeSignature: '4/4',
    cifraClubUrl: 'https://www.cifraclub.com.br/gabriela-rocha/leao/',
    youtubeUrl: 'https://www.youtube.com/watch?v=s2_9w_01QxU',
    tags: ['Poder', 'Celebração', 'Guerra'],
    technicalNotes: 'Bateria com bumbo pesado no 1 e 3. Na ministração, manter apenas o baixo pedal em E e pad aberto.',
    chords: `[Intro]
[E]  [B]  [C#m]  [A]

[Refrão]
      [E]
O Leão da Tribo de Judá
      [B]
Rugiu, a terra estremeceu
      [C#m]
As correntes foram quebradas
      [A]
O meu Rei ressuscitou!`,
    organizationId: 'org_1',
    updatedAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'sng_4',
    title: 'Ousado Amor (Reckless Love)',
    artist: 'Isaías Saad',
    defaultKey: 'F#m',
    bpm: 66,
    timeSignature: '6/8',
    cifraClubUrl: 'https://www.cifraclub.com.br/isaias-saad/ousado-amor/',
    youtubeUrl: 'https://www.youtube.com/watch?v=O12k_QJ1Xy0',
    tags: ['Amor de Deus', 'Adoração'],
    technicalNotes: 'Ritmo em compasso 6/8. Cuidado com o tempo da virada na bateria antes do refrão.',
    chords: `[Verso 1]
[F#m]             [E]              [D]
Antes de eu falar, Tu cantavas sobre mim
[F#m]             [E]             [D]
Tu tens sido tão, tão bom pra mim

[Refrão]
[F#m]          [E]                [D]            [A]
Oh, impressionante, infinito e ousado amor de Deus
[F#m]          [E]                [D]            [A]
Oh, que deixa as noventa e nove só pra me encontrar`,
    organizationId: 'org_1',
    updatedAt: '2026-08-15T16:20:00Z',
  },
  {
    id: 'sng_5',
    title: 'Ruja o Leão / Que Se Abram os Céus',
    artist: 'Talita Catanzaro / Central 3',
    defaultKey: 'D',
    bpm: 72,
    timeSignature: '4/4',
    cifraClubUrl: 'https://www.cifraclub.com.br/central-3/ruja-o-leao/',
    youtubeUrl: 'https://www.youtube.com/watch?v=wX-yZ4k7l-g',
    tags: ['Avivamento', 'Celebração'],
    technicalNotes: 'Música de transição para o momento da mensagem pastoral.',
    chords: `[Refrão]
[D]                    [A]
Ruja o Leão, e que a terra trema
[Bm]                   [G]
Ruja o Leão, e que o inferno caia!`,
    organizationId: 'org_1',
    updatedAt: '2026-08-10T12:00:00Z',
  }
];

export const INITIAL_EVENTS: WorshipEvent[] = [
  {
    id: 'evt_1',
    organizationId: 'org_1',
    title: 'Culto de Celebração de Domingo - Noite',
    description: 'Culto principal com Santa Ceia e ministração especial de louvor.',
    date: '2026-09-06',
    time: '19:00',
    endTime: '21:00',
    location: 'Nave Principal - Altar Central',
    leaderId: 'usr_1',
    leaderName: 'Marcos Paulo',
    status: 'PUBLISHED',
    generalNotes: 'Passagem de som pontualmente às 17h30. Vestimenta da equipe: Preto e tons de azul marinho.',
    members: [
      {
        id: 'mem_1',
        userId: 'usr_1',
        user: INITIAL_USERS[0],
        instrument: 'Vocal Líder',
        status: 'CONFIRMED',
        token: 'tok_marcos_99812a',
        notifiedAt: '2026-08-30T10:00:00Z',
        respondedAt: '2026-08-30T10:05:00Z',
      },
      {
        id: 'mem_2',
        userId: 'usr_2',
        user: INITIAL_USERS[1],
        instrument: 'Backing Vocal',
        status: 'CONFIRMED',
        token: 'tok_debora_44821b',
        notifiedAt: '2026-08-30T10:00:00Z',
        respondedAt: '2026-08-30T11:20:00Z',
      },
      {
        id: 'mem_3',
        userId: 'usr_3',
        user: INITIAL_USERS[2],
        instrument: 'Bateria',
        status: 'CONFIRMED',
        token: 'tok_lucas_11902c',
        notifiedAt: '2026-08-30T10:00:00Z',
        respondedAt: '2026-08-30T10:45:00Z',
      },
      {
        id: 'mem_4',
        userId: 'usr_4',
        user: INITIAL_USERS[3],
        instrument: 'Baixo',
        status: 'DECLINED',
        declineReason: 'Ficarei de plantão emergencial no hospital no domingo à noite.',
        token: 'tok_gabriel_33918d',
        notifiedAt: '2026-08-30T10:00:00Z',
        respondedAt: '2026-08-30T12:15:00Z',
      },
      {
        id: 'mem_5',
        userId: 'usr_6',
        user: INITIAL_USERS[5],
        instrument: 'Teclado / Piano',
        status: 'PENDING',
        token: 'tok_felipe_77812e',
        notifiedAt: '2026-08-30T10:00:00Z',
      },
      {
        id: 'mem_6',
        userId: 'usr_7',
        user: INITIAL_USERS[6],
        instrument: 'Mesa de Som (Áudio)',
        status: 'CONFIRMED',
        token: 'tok_samuel_88190f',
        notifiedAt: '2026-08-30T10:00:00Z',
        respondedAt: '2026-08-30T10:12:00Z',
      }
    ],
    setlist: [
      {
        id: 'set_1',
        songId: 'sng_3',
        song: INITIAL_SONGS[2], // Leão
        assignedKey: 'E',
        leadSingerId: 'usr_1',
        order: 1,
        customNotes: 'Abertura vibrante com solo de guitarra na introdução.'
      },
      {
        id: 'set_2',
        songId: 'sng_1',
        song: INITIAL_SONGS[0], // Bondade de Deus
        assignedKey: 'G',
        leadSingerId: 'usr_1',
        order: 2,
        customNotes: 'Transição suave sem interrupção de bateria.'
      },
      {
        id: 'set_3',
        songId: 'sng_2',
        song: INITIAL_SONGS[1], // A Ele a Glória
        assignedKey: 'D', // Transposta para voz da Débora
        leadSingerId: 'usr_2',
        order: 3,
        customNotes: 'Momento de Santa Ceia. Débora assume o vocal principal.'
      }
    ],
    createdAt: '2026-08-29T14:00:00Z',
  },
  {
    id: 'evt_2',
    organizationId: 'org_1',
    title: 'Culto de Quarta-Feira - Noite de Oração',
    description: 'Culto de oração e estudo bíblico no templo.',
    date: '2026-09-09',
    time: '19:30',
    endTime: '21:00',
    location: 'Nave Principal',
    leaderId: 'usr_2',
    leaderName: 'Débora Silveira',
    status: 'DRAFT',
    generalNotes: 'Formato acústico simplificado (Voz, Violão, Teclado e Cajón).',
    members: [
      {
        id: 'mem_7',
        userId: 'usr_2',
        user: INITIAL_USERS[1],
        instrument: 'Vocal Líder',
        status: 'PENDING',
        token: 'tok_debora_q9120',
      },
      {
        id: 'mem_8',
        userId: 'usr_1',
        user: INITIAL_USERS[0],
        instrument: 'Violão',
        status: 'PENDING',
        token: 'tok_marcos_q1193',
      }
    ],
    setlist: [
      {
        id: 'set_4',
        songId: 'sng_4',
        song: INITIAL_SONGS[3],
        assignedKey: 'F#m',
        order: 1,
        customNotes: 'Acústico intimista'
      }
    ],
    createdAt: '2026-08-30T16:00:00Z',
  }
];

export const INITIAL_EMAIL_LOGS: EmailNotificationLog[] = [
  {
    id: 'log_1',
    eventId: 'evt_1',
    eventTitle: 'Culto de Celebração de Domingo - Noite',
    recipientEmail: 'marcos.mpab@gmail.com',
    recipientName: 'Marcos Paulo',
    type: 'SCHEDULE_INVITE',
    status: 'SENT',
    sentAt: '2026-08-30T10:00:15Z',
    resendId: 'msg_resend_98a71b22',
    subject: '🎸 Nova Escala de Louvor: Culto de Celebração de Domingo - Noite (06/09)',
    htmlPreview: 'Convite para escala de louvor com botões de confirmação e setlist completo.',
  },
  {
    id: 'log_2',
    eventId: 'evt_1',
    eventTitle: 'Culto de Celebração de Domingo - Noite',
    recipientEmail: 'gabriel.bass@exemplo.com.br',
    recipientName: 'Gabriel Martins',
    type: 'SCHEDULE_INVITE',
    status: 'SENT',
    sentAt: '2026-08-30T10:00:20Z',
    resendId: 'msg_resend_11c34f90',
    subject: '🎸 Nova Escala de Louvor: Culto de Celebração de Domingo - Noite (06/09)',
    htmlPreview: 'Convite para escala de louvor.',
  },
  {
    id: 'log_3',
    eventId: 'evt_1',
    eventTitle: 'Culto de Celebração de Domingo - Noite',
    recipientEmail: 'marcos.mpab@gmail.com',
    recipientName: 'Marcos Paulo (Líder)',
    type: 'SUBSTITUTION_ALERT',
    status: 'SENT',
    sentAt: '2026-08-30T12:15:30Z',
    resendId: 'msg_resend_alert_33918d',
    subject: '⚠️ Alerta de Recusa de Escala: Gabriel Martins (Baixo) não poderá comparecer',
    htmlPreview: 'Gabriel Martins recusou a escala de 06/09 com a justificativa: Plantão emergencial.',
  }
];
