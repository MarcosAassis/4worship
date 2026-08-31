import express from 'express';
import dotenv from 'dotenv';
import { createMusicApiApp } from './src/api';

dotenv.config({ path: '.env.local' });
dotenv.config();

const port = Number(process.env.API_PORT || 3001);
const app = express();
app.use('/api', createMusicApiApp());

app.listen(port, () => {
  console.log(`API 4worship em http://localhost:${port}/api/music/search`);
});
