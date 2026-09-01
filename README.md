# 4worship

App de escalas, repertório e busca de músicas para ministério de louvor.

## Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

A API (`/api/...`) sobe junto com o Vite. Não defina `VITE_API_URL` no local.

## Produção (Vercel + Render + Resend)

### 1. Render — API

1. New → Web Service → repositório `MarcosAassis/4worship`.
2. Runtime Node, build `npm install`, start `npm run start`.
3. Health check: `/api/health`.
4. Variáveis:

```
NODE_ENV=production
FRONTEND_URL=https://SEU-APP.vercel.app
ALLOW_VERCEL_PREVIEWS=true
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=4worship <escalas@seu-dominio.com>
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
YOUTUBE_API_KEY=...
```

A URL gerada (ex.: `https://4worship-api.onrender.com`) é a API.

Também dá para usar o blueprint `render.yaml`.

### 2. Vercel — frontend

1. New Project → o mesmo repositório.
2. Framework: Vite. Build: `npm run build`. Output: `dist`.
3. Variável de ambiente (necessária **no build**):

```
VITE_API_URL=https://4worship-api.onrender.com
```

4. Deploy. Copie a URL da Vercel e confirme `FRONTEND_URL` no Render.

### 3. Resend

1. Verifique o domínio em [resend.com/domains](https://resend.com/domains).
2. Crie uma API key e coloque só no Render (`RESEND_API_KEY`).
3. `RESEND_FROM_EMAIL` deve usar o domínio verificado.

Sem chave, os convites entram em modo de teste (não saem de verdade).

### 4. Spotify

No [Dashboard](https://developer.spotify.com/dashboard), adicione a URL da Vercel em Redirect URIs.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Frontend + API local |
| `npm run build` | Build estático (Vercel) |
| `npm start` | Só a API (Render) |
| `npm test` | Testes da busca de músicas |
