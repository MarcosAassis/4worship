import express from 'express';
import dotenv from 'dotenv';
import { createMusicApiApp } from './src/api';
import { applyCors } from './src/cors';

dotenv.config({ path: '.env.local' });
dotenv.config();

const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const app = express();

app.disable('x-powered-by');
app.use(applyCors);
app.use('/api', createMusicApiApp());

app.get('/', (_req, res) => {
  res.json({ service: '4worship-api', health: '/api/health' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API 4worship em http://0.0.0.0:${port}/api/health`);
});
