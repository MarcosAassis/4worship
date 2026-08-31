const SEMITONES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SEMITONES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const ALL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

export function normalizeKey(key: string): string {
  const clean = key.trim();
  if (clean === 'Db') return 'C#';
  if (clean === 'Eb') return 'D#';
  if (clean === 'Gb') return 'F#';
  if (clean === 'Ab') return 'G#';
  if (clean === 'Bb') return 'A#';
  return clean;
}

export function getSemitoneDistance(fromKey: string, toKey: string): number {
  const normFrom = normalizeKey(fromKey);
  const normTo = normalizeKey(toKey);

  const idxFrom = SEMITONES.indexOf(normFrom);
  const idxTo = SEMITONES.indexOf(normTo);

  if (idxFrom === -1 || idxTo === -1) return 0;
  return (idxTo - idxFrom + 12) % 12;
}

export function transposeChord(chord: string, semitones: number): string {
  if (!chord || semitones === 0) return chord;

  const chordRegex = /^([A-G][#b]?)(.*)$/;
  const match = chord.match(chordRegex);
  if (!match) return chord;

  const [, root, suffix] = match;
  let rootNorm = normalizeKey(root);
  let idx = SEMITONES.indexOf(rootNorm);

  if (idx === -1) {
    idx = FLAT_SEMITONES.indexOf(root);
  }

  if (idx === -1) return chord;

  const newIdx = (idx + semitones + 12) % 12;
  return SEMITONES[newIdx] + suffix;
}

export function transposeTextWithChords(text: string, semitones: number): string {
  if (!text || semitones === 0) return text;

  // Simple parser to identify chords in brackets or chords on standalone chord lines
  return text.split('\n').map(line => {
    // If line has brackets like [G] [D/F#] [Em] [C]
    if (line.includes('[') && line.includes(']')) {
      return line.replace(/\[([A-Ga-g][#b]?[^\]]*)\]/g, (_, chord) => {
        // Handle slash chords like D/F#
        if (chord.includes('/')) {
          const parts = chord.split('/');
          const transposedMain = transposeChord(parts[0], semitones);
          const transposedBass = transposeChord(parts[1], semitones);
          return `[${transposedMain}/${transposedBass}]`;
        }
        return `[${transposeChord(chord, semitones)}]`;
      });
    }

    return line;
  }).join('\n');
}
