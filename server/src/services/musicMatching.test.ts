import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AUTO_MATCH_THRESHOLD,
  isAutoMatch,
  matchScore,
  normalizeMusicText,
  scoreQueryAgainstTrack,
  textSimilarity,
  trackDedupeKey,
} from './musicMatching';

describe('normalizeMusicText', () => {
  it('remove acentos e ruído de vídeo oficial', () => {
    assert.equal(
      normalizeMusicText('Legião Urbana - Tempo Perdido (Official Music Video)'),
      'legiao urbana tempo perdido',
    );
  });

  it('remove feat, remastered, live e remix', () => {
    assert.equal(
      normalizeMusicText('Tempo Perdido (feat. Convidado) - Remastered Live Remix'),
      'tempo perdido',
    );
    assert.equal(
      normalizeMusicText('Tempo Perdido feat. Convidado Remastered'),
      'tempo perdido convidado',
    );
  });
});

describe('matchScore', () => {
  it('reconhece a mesma música entre Spotify, YouTube e Cifra Club', () => {
    const youtube = matchScore({
      songA: 'Tempo Perdido',
      artistA: 'Legião Urbana',
      songB: 'Legião Urbana - Tempo Perdido (Official Music Video)',
      artistB: 'Legião Urbana',
    });
    const cifra = matchScore({
      songA: 'Tempo Perdido',
      artistA: 'Legião Urbana',
      songB: 'Tempo Perdido - Legião Urbana',
      artistB: 'Legião Urbana',
    });

    assert.ok(youtube >= AUTO_MATCH_THRESHOLD, `youtube score ${youtube}`);
    assert.ok(cifra >= AUTO_MATCH_THRESHOLD, `cifra score ${cifra}`);
    assert.ok(isAutoMatch(youtube));
  });

  it('não associa músicas homônimas de artistas diferentes', () => {
    const score = matchScore({
      songA: 'Hello',
      artistA: 'Adele',
      songB: 'Hello',
      artistB: 'Lionel Richie',
    });
    assert.ok(score < AUTO_MATCH_THRESHOLD, `score ${score} should be below threshold`);
  });
});

describe('scoreQueryAgainstTrack', () => {
  it('prioriza correspondência do título da query', () => {
    const exact = scoreQueryAgainstTrack('Tempo Perdido', 'Tempo Perdido', 'Legião Urbana');
    const other = scoreQueryAgainstTrack('Tempo Perdido', 'Pais e Filhos', 'Legião Urbana');
    assert.ok(exact > other);
    assert.ok(exact >= 0.8);
  });
});

describe('trackDedupeKey', () => {
  it('trata versões ruidosas como o mesmo registro', () => {
    assert.equal(
      trackDedupeKey('Tempo Perdido (Official Audio)', 'Legião Urbana'),
      trackDedupeKey('Tempo Perdido', 'Legiao Urbana'),
    );
  });
});

describe('textSimilarity', () => {
  it('é 1 para textos iguais após normalização', () => {
    assert.equal(textSimilarity('A Ele a Glória', 'a ele a gloria'), 1);
  });
});
