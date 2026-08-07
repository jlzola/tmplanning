import { randomUUID } from 'node:crypto';
import {
  getAllSessions,
  getSessionById,
  addSession,
  updateSession,
  deleteSession
} from '../data/sessions.store.js';
import { deleteActivityForSession } from '../data/activity.store.js';
import { isValidSessionPassword, hashPassword, checkPassword } from '../utils/password.js';
import { MASTER_PASSWORD_HASH } from '../config/masterPassword.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function computeStatus(session, now) {
  if (session.closedAt) return 'ended';
  if (now < session.startDate) return 'upcoming';
  if (now > session.endDate) return 'ended';
  return 'ongoing';
}

const ONE_DAY = 24 * 60 * 60 * 1000;

function daysBetween(fromDateStr, toDateStr) {
  return Math.round((new Date(toDateStr) - new Date(fromDateStr)) / ONE_DAY);
}

function describeDates(session, now, status) {
  if (session.closedAt) {
    return session.closedAt.slice(0, 10) === now ? 'Clôturée aujourd’hui' : 'Clôturée manuellement';
  }

  if (status === 'upcoming') {
    const days = daysBetween(now, session.startDate);
    return days <= 1 ? 'Débute demain' : `Débute dans ${days} jours`;
  }

  if (status === 'ended') {
    const days = daysBetween(session.endDate, now);
    return days <= 1 ? 'Terminée hier' : `Terminée depuis ${days} jours`;
  }

  const daysLeft = daysBetween(now, session.endDate);
  if (daysLeft <= 0) return 'Dernier jour';
  if (daysLeft === 1) return 'Se termine demain';
  return `${daysLeft} jours restants`;
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

function validateSessionInput({ name, startDate, endDate, operators, creatorCall, creatorFirstName }) {
  if (!name?.trim()) throw new Error('Le nom de la session est obligatoire');
  if (!startDate || !endDate) throw new Error('Les dates de début et de fin sont obligatoires');
  if (startDate > endDate) throw new Error('La date de fin doit être postérieure à la date de début');
  if (!creatorCall?.trim() || !creatorFirstName?.trim()) {
    throw new Error("L'indicatif et le prénom du créateur de la session sont obligatoires");
  }

  const cleanOperators = normalizeOperators(operators);
  if (cleanOperators.length === 0) throw new Error('Au moins un opérateur est requis');

  return {
    operators: cleanOperators,
    creator: {
      call: creatorCall.trim().toUpperCase(),
      firstName: creatorFirstName.trim()
    }
  };
}

function validateSessionPassword(password) {
  if (!password) return undefined;
  if (!isValidSessionPassword(password)) {
    throw new Error(
      'Le mot de passe de gestion doit contenir au moins 8 caractères, uniquement des lettres et des chiffres (pas de caractères spéciaux)'
    );
  }
  return password;
}

export async function listSessions() {
  const sessions = await getAllSessions();
  const now = today();

  return sessions
    .map((s) => {
      const status = computeStatus(s, now);
      return { ...s, status, dateInfo: describeDates(s, now, status) };
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.startDate.localeCompare(b.startDate));
}

export async function getSession(id) {
  const session = await getSessionById(id);
  if (!session) return null;
  const now = today();
  const status = computeStatus(session, now);
  return { ...session, status, dateInfo: describeDates(session, now, status) };
}

export async function createSession({
  name, startDate, endDate, operators, creatorCall, creatorFirstName, password
}) {
  const { operators: cleanOperators, creator } = validateSessionInput({
    name, startDate, endDate, operators, creatorCall, creatorFirstName
  });
  const cleanPassword = validateSessionPassword(password);

  const session = {
    id: randomUUID(),
    name: name.trim(),
    startDate,
    endDate,
    creator,
    operators: cleanOperators,
    passwordHash: cleanPassword ? hashPassword(cleanPassword) : null,
    closedAt: null,
    createdAt: new Date().toISOString()
  };

  return addSession(session);
}

export async function editSession(id, {
  name, startDate, endDate, operators, creatorCall, creatorFirstName, password, removePassword
}) {
  const { operators: cleanOperators, creator } = validateSessionInput({
    name, startDate, endDate, operators, creatorCall, creatorFirstName
  });

  const updates = {
    name: name.trim(),
    startDate,
    endDate,
    creator,
    operators: cleanOperators
  };

  if (removePassword) {
    updates.passwordHash = null;
  } else {
    const cleanPassword = validateSessionPassword(password);
    if (cleanPassword) updates.passwordHash = hashPassword(cleanPassword);
  }

  const updated = await updateSession(id, updates);
  if (!updated) throw new Error('Session inconnue');

  return updated;
}

export async function verifySessionPassword(id, password) {
  const session = await getSessionById(id);
  if (!session) throw new Error('Session inconnue');
  if (checkPassword(password ?? '', MASTER_PASSWORD_HASH)) return true;
  if (!session.passwordHash) return true;
  return checkPassword(password ?? '', session.passwordHash);
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
