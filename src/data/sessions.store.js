import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'sessions.json');

async function readAll() {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(sessions) {
  await writeFile(DATA_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

export async function getAllSessions() {
  return readAll();
}

export async function getSessionById(id) {
  const sessions = await readAll();
  return sessions.find((s) => s.id === id) ?? null;
}

export async function addSession(session) {
  const sessions = await readAll();
  sessions.push(session);
  await writeAll(sessions);
  return session;
}

export async function updateSession(id, updates) {
  const sessions = await readAll();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;
  sessions[index] = { ...sessions[index], ...updates };
  await writeAll(sessions);
  return sessions[index];
}

export async function deleteSession(id) {
  const sessions = await readAll();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return false;
  sessions.splice(index, 1);
  await writeAll(sessions);
  return true;
}
