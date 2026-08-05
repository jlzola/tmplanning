import { BANDS, MODES } from '../config/constants.js';
import {
  getSession,
  createSession,
  editSession,
  closeSession,
  reopenSession,
  removeSession
} from '../services/sessions.service.js';
import { listGrid, reserveBand, releaseBand } from '../services/bands.service.js';
import { slugify, operatorsToCsv } from '../utils/format.js';

function toArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function zipOperators(body) {
  const calls = toArray(body.operatorCall);
  const locators = toArray(body.operatorLocator);
  const departments = toArray(body.operatorDepartment);
  return calls.map((call, i) => ({
    call,
    locator: locators[i],
    department: departments[i]
  }));
}

function notFound(res) {
  return res.status(404).render('error', {
    title: 'Session introuvable',
    message: "Cette session TM Planning n'existe pas."
  });
}

export function showNewSessionForm(req, res) {
  res.render('sessions/new', { title: 'Nouvelle session' });
}

export async function create(req, res) {
  const { name, startDate, endDate } = req.body;
  const operators = zipOperators(req.body);

  try {
    const session = await createSession({ name, startDate, endDate, operators });
    res.redirect(`/sessions/${session.id}`);
  } catch (err) {
    res.status(400).render('sessions/new', {
      title: 'Nouvelle session',
      error: err.message,
      values: { name, startDate, endDate, operators }
    });
  }
}

export async function showSession(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);

    const grid = await listGrid(session.id);
    res.render('sessions/show', {
      title: session.name,
      session,
      grid,
      bands: BANDS,
      modes: MODES
    });
  } catch (err) {
    next(err);
  }
}

export async function showEditSessionForm(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);

    res.render('sessions/edit', {
      title: `Modifier ${session.name}`,
      session,
      values: session
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  const { name, startDate, endDate } = req.body;
  const operators = zipOperators(req.body);

  try {
    const session = await editSession(req.params.id, { name, startDate, endDate, operators });
    res.redirect(`/sessions/${session.id}`);
  } catch (err) {
    try {
      const session = await getSession(req.params.id);
      if (!session) return notFound(res);
      res.status(400).render('sessions/edit', {
        title: `Modifier ${session.name}`,
        session,
        error: err.message,
        values: { name, startDate, endDate, operators }
      });
    } catch (renderErr) {
      next(renderErr);
    }
  }
}

export async function close(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);
    await closeSession(req.params.id);
    res.redirect(`/sessions/${req.params.id}`);
  } catch (err) {
    next(err);
  }
}

export async function reopen(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);
    await reopenSession(req.params.id);
    res.redirect(`/sessions/${req.params.id}`);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);
    await removeSession(req.params.id);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
}

export async function exportJson(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);

    const payload = {
      name: session.name,
      startDate: session.startDate,
      endDate: session.endDate,
      operators: session.operators
    };

    res.setHeader('Content-Disposition', `attachment; filename="${slugify(session.name)}.json"`);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function exportOperatorsCsv(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);

    const csv = operatorsToCsv(session.operators);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${slugify(session.name)}-operateurs.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

export async function apiGrid(req, res, next) {
  try {
    const grid = await listGrid(req.params.id);
    res.json(grid);
  } catch (err) {
    next(err);
  }
}

export async function reserve(req, res, next) {
  try {
    const { band, mode, operatorCall, frequency } = req.body;
    await reserveBand(req.params.id, { band, mode, operatorCall, frequency });
    res.redirect(`/sessions/${req.params.id}`);
  } catch (err) {
    await renderSessionWithError(req, res, next, err);
  }
}

export async function release(req, res, next) {
  try {
    const { band, mode } = req.body;
    await releaseBand(req.params.id, { band, mode });
    res.redirect(`/sessions/${req.params.id}`);
  } catch (err) {
    await renderSessionWithError(req, res, next, err);
  }
}

async function renderSessionWithError(req, res, next, err) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);
    const grid = await listGrid(req.params.id);
    res.status(400).render('sessions/show', {
      title: session.name,
      session,
      grid,
      bands: BANDS,
      modes: MODES,
      error: err.message
    });
  } catch (renderErr) {
    next(renderErr);
  }
}
