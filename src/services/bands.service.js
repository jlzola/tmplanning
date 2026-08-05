import { BANDS, MODES } from '../config/constants.js';
import { getSession } from './sessions.service.js';
import { getActivityForSession, findActive, addEntry, releaseEntry } from '../data/activity.store.js';

export const TOTAL_SLOTS = BANDS.length * MODES.length;

export async function countOccupied(sessionId) {
  const activity = await getActivityForSession(sessionId);
  return activity.filter((e) => !e.qrt).length;
}

export async function listGrid(sessionId) {
  const activity = await getActivityForSession(sessionId);

  return BANDS.flatMap((band) =>
    MODES.map((mode) => {
      const entry = activity.find((e) => e.band === band && e.mode === mode && !e.qrt);
      return {
        band,
        mode,
        free: !entry,
        operator: entry?.operator ?? null,
        locator: entry?.locator ?? null,
        department: entry?.department ?? null,
        frequency: entry?.frequency ?? null,
        qrvSince: entry?.qrvSince ?? null
      };
    })
  );
}

export async function reserveBand(sessionId, { band, mode, operatorCall, frequency }) {
  if (!BANDS.includes(band)) throw new Error('Bande inconnue');
  if (!MODES.includes(mode)) throw new Error('Mode inconnu');

  const session = await getSession(sessionId);
  if (!session) throw new Error('Session inconnue');

  const operator = session.operators.find((o) => o.call === operatorCall);
  if (!operator) throw new Error('Opérateur inconnu pour cette session');

  const existing = await findActive(sessionId, band, mode);
  if (existing) throw new Error(`${band} / ${mode} déjà occupée par ${existing.operator}`);

  return addEntry({
    sessionId,
    band,
    mode,
    operator: operator.call,
    locator: operator.locator,
    department: operator.department,
    frequency: frequency ? Number(frequency) : null,
    qrvSince: new Date().toISOString(),
    qrt: null
  });
}

export async function releaseBand(sessionId, { band, mode }) {
  const entry = await releaseEntry(sessionId, band, mode);
  if (!entry) throw new Error(`Aucune activité en cours pour ${band} / ${mode}`);
  return entry;
}
