import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const PASSWORD_PATTERN = /^[A-Za-z0-9]+$/;

export function isValidSessionPassword(password) {
  return typeof password === 'string' && password.length >= 8 && PASSWORD_PATTERN.test(password);
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function checkPassword(password, hash) {
  if (!password || !hash) return false;
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;

  const derived = scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(key, 'hex');
  if (derived.length !== stored.length) return false;

  return timingSafeEqual(derived, stored);
}
