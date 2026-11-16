import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichGamePgnWithHeaders, FEATURED_MASTER_GAMES } from './analytics';
import { extractGameSkeleton } from './engine';
import {
  appendRatingHistoryPoint,
  canonicalizeGmailAddress,
  computeLeagueInfo,
  countUnreadDirectMessages,
  isGoogleMxHost,
  mergeOpenChessAccountProgress,
  upsertDirectMessage,
  validateGoogleOrGmailEmail,
} from './onlineHelpers';

test('validateGoogleOrGmailEmail allows genuine Gmail addresses and rejects fakes/disposables', () => {
  const valid = validateGoogleOrGmailEmail('  Alex.Morgan2025+chess@Gmail.com  ');
  assert.equal(valid.valid, true);
  assert.equal(valid.isGmailConsumer, true);
  assert.equal(valid.requiresGoogleMxCheck, false);
  assert.equal(valid.canonicalEmail, 'alexmorgan2025@gmail.com');

  const tooShort = validateGoogleOrGmailEmail('a.b@gmail.com');
  assert.equal(tooShort.valid, false);
  assert.match(tooShort.error ?? '', /6 characters/i);

  const disposable = validateGoogleOrGmailEmail('chessplayer@mailinator.com');
  assert.equal(disposable.valid, false);
  assert.match(disposable.error ?? '', /Disposable/i);

  const nonGoogleConsumer = validateGoogleOrGmailEmail('chessplayer@yahoo.com');
  assert.equal(nonGoogleConsumer.valid, false);
  assert.match(nonGoogleConsumer.error ?? '', /Google/i);

  const workspaceCandidate = validateGoogleOrGmailEmail('player@customclub.org');
  assert.equal(workspaceCandidate.valid, true);
  assert.equal(workspaceCandidate.isGmailConsumer, false);
  assert.equal(workspaceCandidate.requiresGoogleMxCheck, true);
});

test('canonicalizeGmailAddress normalizes dot and plus aliases', () => {
  assert.equal(canonicalizeGmailAddress('j.d.o.e+promo@googlemail.com'), 'jdoe@gmail.com');
  assert.equal(canonicalizeGmailAddress('Alice.Smith@Workspace.com'), 'alice.smith@workspace.com');
});

test('isGoogleMxHost recognizes official Google mail exchangers only', () => {
  assert.equal(isGoogleMxHost('aspmx.l.google.com.'), true);
  assert.equal(isGoogleMxHost('alt2.gmail-smtp-in.l.google.com'), true);
  assert.equal(isGoogleMxHost('smtp.google.com'), true);
  assert.equal(isGoogleMxHost('mx1.mailinator.com'), false);
  assert.equal(isGoogleMxHost('fakegoogle.com'), false);
});

test('mergeOpenChessAccountProgress never overwrites local OpenChess ratings or profile', () => {
  const merged = mergeOpenChessAccountProgress({
    local: {
      isLocalOpenChessAccount: true,
      localProgressInitialized: true,
      perfs: {
        rapid: { rating: 1345, games: 9 },
        blitz: { rating: 1210, games: 4 },
      },
      count: { all: 13, win: 8, loss: 3, draw: 2, rated: 13 },
      profile: {
        bio: 'Club grinder on OpenChess',
        flag: 'IQ',
        country: 'IQ',
        avatarUrl: 'data:image/jpeg;base64,ABC',
      },
    },
    remote: {
      perfs: {
        rapid: { rating: 1500, games: 0 },
        blitz: { rating: 1500, games: 0 },
      },
      count: { all: 0, win: 0, loss: 0, draw: 0 },
      profile: {
        bio: 'External bio',
        flag: 'US',
        country: 'US',
      },
    },
  });

  assert.equal(merged.perfs?.rapid?.rating, 1345);
  assert.equal(merged.perfs?.rapid?.games, 9);
  assert.equal(merged.count?.win, 8);
  assert.equal(merged.profile.bio, 'Club grinder on OpenChess');
  assert.equal(merged.profile.flag, 'IQ');
  assert.equal(merged.profile.avatarUrl, 'data:image/jpeg;base64,ABC');
});

test('mergeOpenChessAccountProgress syncs remote Lichess perfs and puzzles when preferRemote is true', () => {
  const merged = mergeOpenChessAccountProgress({
    preferRemote: true,
    local: {
      isLocalOpenChessAccount: true,
      localProgressInitialized: true,
      perfs: {
        rapid: { rating: 800, games: 0 },
        blitz: { rating: 800, games: 0 },
        puzzle: { rating: 800, games: 0 },
        storm: { runs: 1, score: 12 },
      },
      count: { all: 0, win: 0, loss: 0, draw: 0, rated: 0 },
      profile: {
        country: 'INT',
        flag: 'INT',
        avatarUrl: 'https://lh3.googleusercontent.com/photo.jpg',
      },
    },
    remote: {
      perfs: {
        rapid: { rating: 1742, games: 84 },
        blitz: { rating: 1690, games: 120 },
        puzzle: { rating: 2015, games: 310 },
        storm: { runs: 4, score: 29 },
      },
      count: { all: 210, win: 112, loss: 86, draw: 12, rated: 204 },
      profile: {
        country: 'NO',
        flag: 'NO',
        bio: 'Synced from Lichess',
      },
    },
  });

  assert.equal(merged.perfs?.rapid?.rating, 1742);
  assert.equal(merged.perfs?.puzzle?.rating, 2015);
  assert.equal(merged.perfs?.storm?.score, 29);
  assert.equal(merged.count?.all, 210);
  assert.equal(merged.profile.country, 'NO');
  assert.equal(merged.profile.bio, 'Synced from Lichess');
  assert.equal(merged.profile.avatarUrl, 'https://lh3.googleusercontent.com/photo.jpg');
});

test('appendRatingHistoryPoint and computeLeagueInfo track real progression', () => {
  let hist = appendRatingHistoryPoint(undefined, 'rapid', 800, 1000);
  hist = appendRatingHistoryPoint(hist, 'rapid', 816, 4000);
  assert.equal(hist.rapid.length, 2);
  assert.equal(hist.rapid[1].rating, 816);

  const stone = computeLeagueInfo(45);
  assert.equal(stone.tier, 'Stone');
  assert.equal(stone.nextTier, 'Bronze');

  const silver = computeLeagueInfo(200);
  assert.equal(silver.tier, 'Silver');
  assert.equal(silver.nextTier, 'Crystal');
  assert.equal(silver.progressPct, 50);

  const champion = computeLeagueInfo(750);
  assert.equal(champion.tier, 'Champion');
  assert.equal(champion.nextTier, 'Legend');

  const legend = computeLeagueInfo(1050);
  assert.equal(legend.tier, 'Legend');
  assert.equal(legend.nextTier, null);
  assert.equal(legend.progressPct, 100);
});

test('upsertDirectMessage & countUnreadDirectMessages manage 1-on-1 threads cleanly', () => {
  let threads = upsertDirectMessage({
    threads: {},
    partnerUsername: 'BobPlayer',
    message: {
      id: 'm1',
      from: 'BobPlayer',
      to: 'AlicePlayer',
      text: 'Want a rematch?',
      timestamp: 1000,
      read: false,
    },
  });
  threads = upsertDirectMessage({
    threads,
    partnerUsername: 'bobplayer',
    message: {
      id: 'm2',
      from: 'AlicePlayer',
      to: 'BobPlayer',
      text: 'Yes!',
      timestamp: 2000,
      read: true,
    },
  });

  assert.equal(threads['bobplayer'].length, 2);
  assert.equal(countUnreadDirectMessages(threads, 'AlicePlayer'), 1);
  assert.equal(countUnreadDirectMessages(threads, 'BobPlayer'), 0);
});

test('enrichGamePgnWithHeaders injects full player, rating, opening, and speed headers for Game Viewer', () => {
  const sampleGame = FEATURED_MASTER_GAMES[0];
  assert.ok(sampleGame, 'FEATURED_MASTER_GAMES should have at least 1 game');
  const enriched = enrichGamePgnWithHeaders({
    ...sampleGame,
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6',
  });
  assert.match(enriched, /\[White "DrNykterstein"\]/);
  assert.match(enriched, /\[Black "Hikaru"\]/);
  assert.match(enriched, /\[WhiteElo "3294"\]/);
  assert.match(enriched, /\[BlackElo "3268"\]/);
  assert.match(enriched, /\[Opening "Ruy Lopez: Berlin Defense/);
  assert.match(enriched, /\[Speed "blitz"\]/);

  for (const fg of FEATURED_MASTER_GAMES) {
    const skel = extractGameSkeleton(enrichGamePgnWithHeaders(fg));
    assert.ok(skel.length > 10, `Featured master game ${fg.id} should parse cleanly with >10 plies`);
  }
});

