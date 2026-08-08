import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Regenerated on each process start: an unlock granted before a restart simply
// expires, the user re-enters the session password. No persistence needed.
const SECRET = process.env.SESSION_UNLOCK_SECRET || randomBytes(32).toString('hex');
const UNLOCK_MAX_AGE_MS = 2 * 60 * 60 * 1000;

// The current passwordHash is folded into the signature so that changing or
// removing a session's password invalidates every unlock token issued for it.
function sign(sessionId, expiry, passwordHash) {
  return createHmac('sha256', SECRET).update(`${sessionId}.${expiry}.${passwordHash ?? ''}`).digest('hex');
}

export function unlockCookieName(sessionId) {
  return `su_${sessionId}`;
}

// Mot de passe d'utilisation : verrou distinct du mot de passe de gestion,
// avec une durée de vie longue pour ne (quasi) jamais redemander la saisie.
const USAGE_UNLOCK_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export function usageUnlockCookieName(sessionId) {
  return `su_use_${sessionId}`;
}

export function createUnlockToken(sessionId, passwordHash, ttlMs = UNLOCK_MAX_AGE_MS) {
  const expiry = Date.now() + ttlMs;
  return `${expiry}.${sign(sessionId, expiry, passwordHash)}`;
}

export function isUnlockTokenValid(sessionId, passwordHash, token) {
  if (!token) return false;
  const [expiryStr, signature] = token.split('.');
  const expiry = Number(expiryStr);
  if (!expiry || !signature || Date.now() > expiry) return false;

  const expected = Buffer.from(sign(sessionId, expiry, passwordHash), 'hex');
  const actual = Buffer.from(signature, 'hex');
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

export { UNLOCK_MAX_AGE_MS, USAGE_UNLOCK_MAX_AGE_MS };
