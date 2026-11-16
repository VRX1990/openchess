export interface EmailValidationResult {
  valid: boolean;
  normalizedEmail: string;
  canonicalEmail: string;
  domain: string;
  requiresGoogleMxCheck: boolean;
  isGmailConsumer: boolean;
  error?: string;
}

export interface RatingHistoryPoint {
  rating: number;
  ts: number;
}

export type RatingSpeed = 'rapid' | 'blitz' | 'bullet' | 'puzzle';

export type RatingHistoryMap = Record<RatingSpeed, RatingHistoryPoint[]>;

export type LeagueTier =
  | 'Wood'
  | 'Stone'
  | 'Bronze'
  | 'Silver'
  | 'Crystal'
  | 'Elite'
  | 'Champion'
  | 'Legend';

export interface LeagueStatus {
  tier: LeagueTier;
  points: number;
  nextTier: LeagueTier | null;
  nextThreshold: number | null;
  progressPct: number;
  badgeColor: string;
}

export interface DirectMessageItem {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  read?: boolean;
  fromAvatarUrl?: string;
  fromFlag?: string;
}

export interface DirectMessageThread {
  partnerUsername: string;
  partnerAvatarUrl?: string;
  partnerFlag?: string;
  partnerOnline?: boolean;
  partnerRating?: number;
  lastMessage: DirectMessageItem;
  unreadCount: number;
  messages: DirectMessageItem[];
}

export interface OpenChallengeItem {
  id: string;
  source: 'openchess' | 'network';
  username: string;
  rating?: number;
  avatarUrl?: string;
  flag?: string;
  title?: string;
  speed: 'bullet' | 'blitz' | 'rapid';
  clock: string;
  initialSeconds: number;
  incrementSeconds: number;
  rated: boolean;
  color: 'white' | 'black' | 'random';
  createdAt: number;
  hookId?: string;
}

export const STARTING_SKILL_TIERS: Array<{
  id: 'new' | 'beginner' | 'intermediate' | 'advanced';
  label: string;
  rating: number;
  description: string;
}> = [
  { id: 'new', label: 'New to Chess', rating: 400, description: 'Just learning rules & pieces' },
  { id: 'beginner', label: 'Beginner', rating: 800, description: 'Knows basic tactics & openings' },
  { id: 'intermediate', label: 'Intermediate', rating: 1200, description: 'Regular club & online player' },
  { id: 'advanced', label: 'Advanced', rating: 1500, description: 'Experienced tournament strength' },
];

export const COUNTRY_OPTIONS: Array<{ code: string; name: string; flag: string }> = [
  { code: 'INT', name: 'International', flag: '🌍' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
];

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.org',
  '10minutemail.com',
  '10minutemail.net',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'getnada.com',
  'maildrop.cc',
  'dispostable.com',
  'sharklasers.com',
  'mintemail.com',
  'mohmal.com',
  'emailondeck.com',
  'tempail.com',
  'discard.email',
  'burner.email',
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'fake.com',
  'localhost',
  'invalid',
]);

const NON_GOOGLE_CONSUMER_DOMAINS = new Set([
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'yandex.ru',
  'mail.ru',
  'gmx.com',
  'fastmail.com',
]);

export function canonicalizeGmailAddress(rawEmail: string): string {
  const trimmed = rawEmail.trim().toLowerCase();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return trimmed;
  let local = trimmed.slice(0, atIndex);
  let domain = trimmed.slice(atIndex + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  if (domain === 'gmail.com') {
    const plusIdx = local.indexOf('+');
    if (plusIdx >= 0) local = local.slice(0, plusIdx);
    local = local.replace(/\./g, '');
  }
  return `${local}@${domain}`;
}

export function validateGoogleOrGmailEmail(rawEmail: string): EmailValidationResult {
  const normalized = rawEmail.trim().toLowerCase();
  const baseFail = (error: string): EmailValidationResult => ({
    valid: false,
    normalizedEmail: normalized,
    canonicalEmail: normalized,
    domain: '',
    requiresGoogleMxCheck: false,
    isGmailConsumer: false,
    error,
  });

  if (!normalized || normalized.length > 254) {
    return baseFail('Enter a valid email address.');
  }

  const atParts = normalized.split('@');
  if (atParts.length !== 2) {
    return baseFail('Enter a valid email address (e.g. name@gmail.com).');
  }

  const [localPart, domain] = atParts;
  if (!localPart || !domain || !domain.includes('.')) {
    return baseFail('Enter a valid email address.');
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return baseFail('Email username format is invalid.');
  }

  if (!/^[a-z0-9._+-]{1,64}$/.test(localPart)) {
    return baseFail('Email username contains invalid characters.');
  }

  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) || domain.includes('..')) {
    return baseFail('Email domain is invalid.');
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return baseFail('Disposable email domains are not supported.');
  }

  if (NON_GOOGLE_CONSUMER_DOMAINS.has(domain)) {
    return baseFail(
      `Please sign in with a Gmail or Google Workspace account ("${domain}" is not supported).`,
    );
  }

  const isGmailConsumer = domain === 'gmail.com' || domain === 'googlemail.com';
  if (isGmailConsumer) {
    const coreLocal = canonicalizeGmailAddress(normalized).split('@')[0] ?? '';
    // Google enforces minimum 6 characters for consumer Gmail addresses
    if (coreLocal.length < 6) {
      return baseFail('Gmail addresses must have at least 6 characters before @gmail.com.');
    }
    if (/^(test|fake|dummy|sample|none|null|asdfgh|qwerty|123456|abcdef)\d*$/i.test(coreLocal)) {
      return baseFail('Enter a valid Gmail address.');
    }
  }

  return {
    valid: true,
    normalizedEmail: normalized,
    canonicalEmail: canonicalizeGmailAddress(normalized),
    domain,
    requiresGoogleMxCheck: !isGmailConsumer,
    isGmailConsumer,
  };
}

export function isGoogleMxHost(exchange: string): boolean {
  const host = exchange.trim().toLowerCase().replace(/\.$/, '');
  if (!host) return false;
  return (
    host === 'smtp.google.com' ||
    host.endsWith('.google.com') ||
    host.endsWith('.googlemail.com') ||
    host === 'aspmx.l.google.com' ||
    host.endsWith('.aspmx.l.google.com')
  );
}

export function appendRatingHistoryPoint(
  history: Partial<RatingHistoryMap> | undefined,
  speed: RatingSpeed,
  rating: number,
  ts = Date.now(),
): RatingHistoryMap {
  const base: RatingHistoryMap = {
    rapid: Array.isArray(history?.rapid) ? [...history!.rapid!] : [],
    blitz: Array.isArray(history?.blitz) ? [...history!.blitz!] : [],
    bullet: Array.isArray(history?.bullet) ? [...history!.bullet!] : [],
    puzzle: Array.isArray(history?.puzzle) ? [...history!.puzzle!] : [],
  };
  const rounded = Math.round(rating);
  const current = base[speed];
  const last = current[current.length - 1];
  if (last && last.rating === rounded && Math.abs(ts - last.ts) < 1500) {
    return base;
  }
  base[speed] = [...current, { rating: rounded, ts }].slice(-50);
  return base;
}

export const LEAGUE_TIERS: Array<{
  tier: LeagueTier;
  minPoints: number;
  badgeColor: string;
  description: string;
}> = [
  { tier: 'Wood', minPoints: 0, badgeColor: '#9C7A54', description: 'Starting Division' },
  { tier: 'Stone', minPoints: 25, badgeColor: '#8E99A2', description: '25+ Trophies' },
  { tier: 'Bronze', minPoints: 65, badgeColor: '#CD7F32', description: '65+ Trophies' },
  { tier: 'Silver', minPoints: 140, badgeColor: '#C5CED6', description: '140+ Trophies' },
  { tier: 'Crystal', minPoints: 260, badgeColor: '#56C2F6', description: '260+ Trophies' },
  { tier: 'Elite', minPoints: 420, badgeColor: '#B57EDC', description: '420+ Trophies' },
  { tier: 'Champion', minPoints: 640, badgeColor: '#F5C451', description: '640+ Trophies' },
  { tier: 'Legend', minPoints: 950, badgeColor: '#81B64C', description: '950+ Trophies' },
];

export function computeLeagueInfo(rawPoints = 0): LeagueStatus {
  const points = Math.max(0, Math.round(rawPoints));
  let idx = 0;
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (points >= LEAGUE_TIERS[i].minPoints) {
      idx = i;
      break;
    }
  }
  const current = LEAGUE_TIERS[idx];
  const next = LEAGUE_TIERS[idx + 1] ?? null;
  if (!next) {
    return {
      tier: current.tier,
      points,
      nextTier: null,
      nextThreshold: null,
      progressPct: 100,
      badgeColor: current.badgeColor,
    };
  }
  const span = next.minPoints - current.minPoints;
  const pct = span > 0 ? Math.min(100, Math.max(0, Math.round(((points - current.minPoints) / span) * 100))) : 100;
  return {
    tier: current.tier,
    points,
    nextTier: next.tier,
    nextThreshold: next.minPoints,
    progressPct: pct,
    badgeColor: current.badgeColor,
  };
}

export interface ProgressAccountSnapshot {
  perfs?: {
    rapid?: { rating: number; games: number };
    blitz?: { rating: number; games: number };
    bullet?: { rating: number; games: number };
    puzzle?: { rating: number; games: number };
    classical?: { rating: number; games: number };
    correspondence?: { rating: number; games: number };
    storm?: { runs: number; score: number };
    streak?: { runs: number; score: number };
  };
  count?: { all: number; win: number; loss: number; draw: number; rated?: number };
  profile?: {
    country?: string;
    flag?: string;
    bio?: string;
    avatarUrl?: string;
  };
  isLocalOpenChessAccount?: boolean;
  localProgressInitialized?: boolean;
}

export function mergeOpenChessAccountProgress(params: {
  local: ProgressAccountSnapshot;
  remote?: ProgressAccountSnapshot | null;
  preferRemote?: boolean;
}) {
  const { local, remote, preferRemote = false } = params;
  const preserveLocal =
    !preferRemote && Boolean(local.isLocalOpenChessAccount || local.localProgressInitialized);

  const localProfile = local.profile ?? {};
  const remoteProfile = remote?.profile ?? {};

  const mergedProfile = {
    country:
      localProfile.country && localProfile.country !== 'INT'
        ? localProfile.country
        : remoteProfile.country || localProfile.country || 'INT',
    flag:
      localProfile.flag && localProfile.flag !== 'INT'
        ? localProfile.flag
        : remoteProfile.flag || localProfile.flag || localProfile.country || 'INT',
    bio:
      localProfile.bio && localProfile.bio.trim().length > 0
        ? localProfile.bio
        : remoteProfile.bio ?? localProfile.bio,
    avatarUrl: localProfile.avatarUrl || remoteProfile.avatarUrl,
  };

  if (preserveLocal || !remote) {
    return {
      perfs: local.perfs,
      count: local.count,
      profile: mergedProfile,
    };
  }

  if (preferRemote) {
    const bestStormScore = Math.max(
      local.perfs?.storm?.score ?? 0,
      remote.perfs?.storm?.score ?? 0,
    );
    const bestStreakScore = Math.max(
      local.perfs?.streak?.score ?? 0,
      remote.perfs?.streak?.score ?? 0,
    );
    return {
      perfs: {
        ...(local.perfs ?? {}),
        ...(remote.perfs ?? {}),
        ...(bestStormScore > 0
          ? {
              storm: {
                runs: Math.max(local.perfs?.storm?.runs ?? 0, remote.perfs?.storm?.runs ?? 0),
                score: bestStormScore,
              },
            }
          : {}),
        ...(bestStreakScore > 0
          ? {
              streak: {
                runs: Math.max(local.perfs?.streak?.runs ?? 0, remote.perfs?.streak?.runs ?? 0),
                score: bestStreakScore,
              },
            }
          : {}),
      },
      count: remote.count ?? local.count,
      profile: mergedProfile,
    };
  }

  return {
    perfs: {
      ...(remote.perfs ?? {}),
      ...(local.perfs ?? {}),
      rapid:
        (local.perfs?.rapid?.games ?? 0) > (remote.perfs?.rapid?.games ?? 0)
          ? local.perfs?.rapid
          : remote.perfs?.rapid ?? local.perfs?.rapid,
      blitz:
        (local.perfs?.blitz?.games ?? 0) > (remote.perfs?.blitz?.games ?? 0)
          ? local.perfs?.blitz
          : remote.perfs?.blitz ?? local.perfs?.blitz,
      bullet:
        (local.perfs?.bullet?.games ?? 0) > (remote.perfs?.bullet?.games ?? 0)
          ? local.perfs?.bullet
          : remote.perfs?.bullet ?? local.perfs?.bullet,
      puzzle:
        (local.perfs?.puzzle?.games ?? 0) > (remote.perfs?.puzzle?.games ?? 0)
          ? local.perfs?.puzzle
          : remote.perfs?.puzzle ?? local.perfs?.puzzle,
    },
    count:
      (local.count?.all ?? 0) >= (remote.count?.all ?? 0)
        ? local.count ?? remote.count
        : remote.count ?? local.count,
    profile: mergedProfile,
  };
}

export function upsertDirectMessage(params: {
  threads: Record<string, DirectMessageItem[]>;
  partnerUsername: string;
  message: DirectMessageItem;
  maxPerThread?: number;
}): Record<string, DirectMessageItem[]> {
  const key = params.partnerUsername.trim().toLowerCase();
  const limit = params.maxPerThread ?? 100;
  const existing = params.threads[key] ?? [];
  if (existing.some((m) => m.id === params.message.id)) {
    return params.threads;
  }
  return {
    ...params.threads,
    [key]: [...existing, params.message].slice(-limit),
  };
}

export function countUnreadDirectMessages(
  threads: Record<string, DirectMessageItem[]>,
  currentUsername: string,
): number {
  const meLower = currentUsername.trim().toLowerCase();
  let count = 0;
  for (const msgs of Object.values(threads)) {
    for (const m of msgs) {
      if (m.to.toLowerCase() === meLower && m.from.toLowerCase() !== meLower && !m.read) {
        count += 1;
      }
    }
  }
  return count;
}

export function sanitizePublicAvatar(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('preset-') ||
    trimmed.startsWith('preset:') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }
  return undefined;
}

export const MAX_MATCHMAKING_ELO_GAP = 200;

export function getFairMatchmakingEloBand(
  playerElo: number,
  maxGap = MAX_MATCHMAKING_ELO_GAP,
): { minElo: number; maxElo: number } {
  const safeElo = Math.max(100, Math.min(3200, Math.round(Number(playerElo) || 1200)));
  return {
    minElo: Math.max(100, safeElo - maxGap),
    maxElo: Math.min(3300, safeElo + maxGap),
  };
}

export function isWithinFairEloBand(
  playerElo: number,
  opponentElo: number,
  maxGap = MAX_MATCHMAKING_ELO_GAP,
): boolean {
  return Math.abs(Math.round(playerElo) - Math.round(opponentElo)) <= maxGap;
}

export function clampOpponentEloToBand(
  targetElo: number,
  rawOpponentElo: number,
  seedStr = '',
  maxGap = MAX_MATCHMAKING_ELO_GAP,
): number {
  const { minElo, maxElo } = getFairMatchmakingEloBand(targetElo, maxGap);
  if (rawOpponentElo >= minElo && rawOpponentElo <= maxElo) {
    return Math.round(rawOpponentElo);
  }
  const safeTarget = Math.max(100, Math.min(3200, Math.round(targetElo)));
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) | 0;
  }
  const offset = (Math.abs(hash) % 291) - 145;
  return Math.max(minElo, Math.min(maxElo, safeTarget + offset));
}

export const PUBLIC_SHARE_APP_URL = 'https://openchess.bonto.page';

export function getShareableAppOrigin(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin;
    }
  }
  return PUBLIC_SHARE_APP_URL;
}


