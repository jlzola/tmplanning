import { randomUUID } from 'node:crypto';
import {
  getAllSessions,
  getSessionById,
  addSession,
  updateSession,
  deleteSession
} from '../data/sessions.store.js';
import { deleteActivityForSession } from '../data/activity.store.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function computeStatus(session, now) {
  if (session.closedAt) return 'ended';
  if (now < session.startDate) return 'upcoming';
  if (now > session.endDate) return 'ended';
  return 'ongoing';
}

const STATUS_ORDER = { ongoing: 0, upcoming: 1, ended: 2 };

function normalizeOperators(operators) {
  return (operators ?? [])
    .filter((o) => o.call?.trim())
    .map((o) => ({
      call: o.call.trim().toUpperCase(),
      locator: o.locator?.trim() ?? '',
      department: o.department?.trim() ?? ''
    }));
}

function validateSessionInput({ name, startDate, endDate, operators }) {
  if (!name?.trim()) throw new Error('Le nom de la session est obligatoire');
  if (!startDate || !endDate) throw new Error('Les dates de début et de fin sont obligatoires');
  if (startDate > endDate) throw new Error('La date de fin doit être postérieure à la date de début');

  const cleanOperators = normalizeOperators(operators);
  if (cleanOperators.length === 0) throw new Error('Au moins un opérateur est requis');

  return cleanOperators;
}

export async function listSessions() {
  const sessions = await getAllSessions();
  const now = today();

  return sessions
    .map((s) => ({ ...s, status: computeStatus(s, now) }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.startDate.localeCompare(b.startDate));
}

export async function getSession(id) {
  const session = await getSessionById(id);
  if (!session) return null;
  return { ...session, status: computeStatus(session, today()) };
}

export async function createSession({ name, startDate, endDate, operators }) {
  const cleanOperators = validateSessionInput({ name, startDate, endDate, operators });

  const session = {
    id: randomUUID(),
    name: name.trim(),
    startDate,
    endDate,
    operators: cleanOperators,
    closedAt: null,
    createdAt: new Date().toISOString()
  };

  return addSession(session);
}

export async function editSession(id, { name, startDate, endDate, operators }) {
  const cleanOperators = validateSessionInput({ name, startDate, endDate, operators });

  const updated = await updateSession(id, {
    name: name.trim(),
    startDate,
    endDate,
    operators: cleanOperators
  });
  if (!updated) throw new Error('Session inconnue');

  return updated;
}

export async function closeSession(id) {
  const updated = await updateSession(id, { closedAt: new Date().toISOString() });
  if (!updated) throw new Error('Session inconnue');
  return updated;
}

export async function reopenSession(id) {
  const updated = await updateSession(id, { closedAt: null });
  if (!updated) throw new Error('Session inconnue');
  return updated;
}

export async function removeSession(id) {
  const deleted = await deleteSession(id);
  if (!deleted) throw new Error('Session inconnue');
  await deleteActivityForSession(id);
}
