import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'activity.json');

async function readAll() {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(entries) {
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function getActivityForSession(sessionId) {
  const entries = await readAll();
  return entries.filter((e) => e.sessionId === sessionId);
}

export async function findActive(sessionId, band, mode) {
  const entries = await readAll();
  return entries.find((e) => e.sessionId === sessionId && e.band === band && e.mode === mode && !e.qrt) ?? null;
}

export async function addEntry(entry) {
  const entries = await readAll();
  entries.push(entry);
  await writeAll(entries);
  return entry;
}

export async function releaseEntry(sessionId, band, mode) {
  const entries = await readAll();
  const entry = entries.find((e) => e.sessionId === sessionId && e.band === band && e.mode === mode && !e.qrt);
  if (!entry) return null;
  entry.qrt = new Date().toISOString();
  await writeAll(entries);
  return entry;
}

export async function releaseAllForSession(sessionId) {
  const entries = await readAll();
  const now = new Date().toISOString();
  const released = [];
  entries.forEach((e) => {
    if (e.sessionId === sessionId && !e.qrt) {
      e.qrt = now;
      released.push(e);
    }
  });
  if (released.length > 0) await writeAll(entries);
  return released;
}

export async function deleteActivityForSession(sessionId) {
  const entries = await readAll();
  const remaining = entries.filter((e) => e.sessionId !== sessionId);
  await writeAll(remaining);
}
