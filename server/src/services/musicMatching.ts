/** Threshold for treating two titles/artists as the same recording. */
export const AUTO_MATCH_THRESHOLD = 0.72;

const NOISE_PHRASES = [
  'official music video',
  'official lyric video',
  'official audio',
  'official video',
  'lyric video',
  'music video',
  'visualizer',
  'radio edit',
  'extended mix',
  'deluxe edition',
  'deluxe version',
  'remastered',
  'remaster',
  'ao vivo',
  'live version',
  'acoustic version',
  'acustico',
  'featuring',
  'version',
  'versao',
  'karaoke',
  'cover',
  'topic',
  'vevo',
  'audio',
  'lyrics',
  'remix',
  'live',
  'hd',
  '4k',
  'hq',
];

const NOISE_TOKENS = new Set([
  'feat',
  'ft',
  'featuring',
  'with',
  'official',
  'video',
  'audio',
  'lyrics',
  'lyric',
  'remastered',
  'remaster',
  'live',
  'remix',
  'version',
  'versao',
  'deluxe',
  'extended',
  'acoustic',
  'acustico',
  'karaoke',
  'cover',
  'hd',
  'vevo',
  'topic',
]);

export function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '');
}

export function normalizeMusicText(value: string): string {
  let text = stripDiacritics(value || '').toLowerCase();
  text = text.replace(/[&]/g, ' e ');
  text = text.replace(/[\[\(\{].*?[\]\)\}]/g, ' ');
  for (const phrase of NOISE_PHRASES) {
    text = text.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ' ');
  }
  text = text.replace(/[-_–—|/\\,.:;!?+"'`~]/g, ' ');
  text = text.replace(/[^a-z0-9\s]/g, ' ');
  const tokens = text
    .split(/\s+/)
    .filter((token) => token && !NOISE_TOKENS.has(token));
  return tokens.join(' ').trim();
}

function bigrams(value: string): string[] {
  const padded = ` ${value} `;
  const grams: string[] = [];
  for (let i = 0; i < padded.length - 1; i++) {
    grams.push(padded.slice(i, i + 2));
  }
  return grams;
}

export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const aGrams = bigrams(a);
  const bGrams = bigrams(b);
  if (aGrams.length === 0 || bGrams.length === 0) return 0;
  const bCounts = new Map<string, number>();
  for (const gram of bGrams) {
    bCounts.set(gram, (bCounts.get(gram) ?? 0) + 1);
  }
  let overlap = 0;
  for (const gram of aGrams) {
    const count = bCounts.get(gram) ?? 0;
    if (count > 0) {
      overlap += 1;
      bCounts.set(gram, count - 1);
    }
  }
  return (2 * overlap) / (aGrams.length + bGrams.length);
}

export function tokenJaccard(a: string, b: string): number {
  const aSet = new Set(a.split(/\s+/).filter(Boolean));
  const bSet = new Set(b.split(/\s+/).filter(Boolean));
  if (aSet.size === 0 && bSet.size === 0) return 1;
  if (aSet.size === 0 || bSet.size === 0) return 0;
  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }
  return intersection / new Set([...aSet, ...bSet]).size;
}

export function textSimilarity(left: string, right: string): number {
  const a = normalizeMusicText(left);
  const b = normalizeMusicText(right);
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  if (a === b) return 1;
  const contained = a.includes(b) || b.includes(a);
  const dice = diceCoefficient(a, b);
  const jaccard = tokenJaccard(a, b);
  const base = Math.max(dice, jaccard);
  return contained ? Math.max(base, 0.9) : base;
}

export function matchScore(params: {
  songA: string;
  artistA: string;
  songB: string;
  artistB: string;
}): number {
  const artistSimilarity = textSimilarity(params.artistA, params.artistB);
  const songSimilarity = textSimilarity(params.songA, params.songB);
  return Number((artistSimilarity * 0.5 + songSimilarity * 0.5).toFixed(4));
}

export function isAutoMatch(score: number): boolean {
  return score >= AUTO_MATCH_THRESHOLD;
}

export function parseArtistTitleQuery(query: string): { artist?: string; title?: string } {
  const trimmed = query.trim();
  const parts = trimmed.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    return { artist: parts[0], title: parts.slice(1).join(' - ') };
  }
  return {};
}

export function scoreQueryAgainstTrack(query: string, title: string, artist: string): number {
  const parsed = parseArtistTitleQuery(query);
  if (parsed.artist && parsed.title) {
    return matchScore({
      songA: parsed.title,
      artistA: parsed.artist,
      songB: title,
      artistB: artist,
    });
  }

  const combined = `${artist} ${title}`;
  const vsCombined = textSimilarity(query, combined);
  const vsTitle = textSimilarity(query, title);
  const vsArtist = textSimilarity(query, artist);
  const exactTitle = normalizeMusicText(query) === normalizeMusicText(title) ? 1 : vsTitle;
  return Number(Math.max(vsCombined, exactTitle * 0.85 + vsArtist * 0.15).toFixed(4));
}

export function trackDedupeKey(title: string, artist: string): string {
  return `${normalizeMusicText(artist)}::${normalizeMusicText(title)}`;
}

export function youtubeBoost(videoTitle: string, channelTitle: string, artist: string): number {
  const title = videoTitle.toLowerCase();
  let boost = 0;
  if (/official\s+(music\s+)?video/.test(title) || /clipe oficial/.test(title)) boost += 0.08;
  if (/official\s+audio/.test(title) || /audio oficial/.test(title)) boost += 0.06;
  if (textSimilarity(channelTitle, artist) >= 0.8) boost += 0.1;
  if (/\btopic\b/i.test(channelTitle)) boost += 0.04;
  if (/\bkaraoke\b|\bcover\b|\breaction\b|\blyric\b/i.test(title) && !/official/.test(title)) {
    boost -= 0.12;
  }
  return boost;
}
