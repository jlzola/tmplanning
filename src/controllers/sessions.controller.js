import { BANDS, MODES } from '../config/constants.js';
import {
  getSession,
  createSession,
  editSession,
  closeSession,
  reopenSession,
  removeSession,
  verifySessionPassword,
  saveShareConfig
} from '../services/sessions.service.js';
import { listGrid, reserveBand, releaseBand } from '../services/bands.service.js';
import { slugify, operatorsToCsv } from '../utils/format.js';
import { renderBandChartSvg } from '../utils/bandChart.js';
import { getCookie } from '../utils/cookies.js';
import { unlockCookieName, createUnlockToken, isUnlockTokenValid, UNLOCK_MAX_AGE_MS } from '../utils/sessionUnlock.js';
import { groupByBand } from '../utils/grid.js';

function toArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function toBool(value) {
  return value === true || value === 'true';
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
    message: "Cette session TMPlanning n'existe pas."
  });
}

export function showNewSessionForm(req, res) {
  res.render('sessions/new', { title: 'Nouvelle session' });
}

export async function create(req, res) {
  const { name, startDate, endDate, creatorCall, creatorFirstName, password } = req.body;
  const operators = zipOperators(req.body);

  try {
    const session = await createSession({
      name, startDate, endDate, operators, creatorCall, creatorFirstName, password
    });
    res.redirect(`/sessions/${session.id}`);
  } catch (err) {
    res.status(400).render('sessions/new', {
      title: 'Nouvelle session',
      error: err.message,
      values: { name, startDate, endDate, operators, creator: { call: creatorCall, firstName: creatorFirstName } }
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
      bandRows: groupByBand(grid),
      bands: BANDS,
      modes: MODES
    });
  } catch (err) {
    next(err);
  }
}

export async function requireUnlocked(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);

    if (session.passwordHash) {
      const token = getCookie(req, unlockCookieName(session.id));
      if (!isUnlockTokenValid(session.id, session.passwordHash, token)) {
        return res.redirect(`/sessions/${session.id}?locked=1`);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

export async function verifyPassword(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return res.status(404).json({ ok: false, error: 'Session introuvable' });

    const ok = await verifySessionPassword(session.id, req.body?.password);
    if (!ok) return res.status(401).json({ ok: false, error: 'Mot de passe incorrect' });

    res.cookie(unlockCookieName(session.id), createUnlockToken(session.id, session.passwordHash), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: UNLOCK_MAX_AGE_MS,
      path: `/sessions/${session.id}`
    });
    res.json({ ok: true, redirect: `/sessions/${session.id}/edit` });
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
      values: session,
      bands: BANDS
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  const { name, startDate, endDate, creatorCall, creatorFirstName, password, removePassword } = req.body;
  const operators = zipOperators(req.body);

  try {
    const session = await editSession(req.params.id, {
      name, startDate, endDate, operators, creatorCall, creatorFirstName, password, removePassword
    });
    res.redirect(`/sessions/${session.id}`);
  } catch (err) {
    try {
      const session = await getSession(req.params.id);
      if (!session) return notFound(res);
      res.status(400).render('sessions/edit', {
        title: `Modifier ${session.name}`,
        session,
        error: err.message,
        values: { name, startDate, endDate, operators, creator: { call: creatorCall, firstName: creatorFirstName } },
        bands: BANDS
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
      creator: session.creator,
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

export async function bandChartSvg(req, res, next) {
  try {
    const session = await getSession(req.params.id);
    if (!session) return notFound(res);

    const grid = await listGrid(session.id);
    const requested = req.query.bands;
    const bands = requested === undefined
      ? BANDS
      : BANDS.filter((band) => requested.split(',').includes(band));
    const svg = renderBandChartSvg({ grid, bands, modes: MODES });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.send(svg);
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

export async function saveShare(req, res, next) {
  try {
    const bands = toArray(req.body.bands).filter((band) => BANDS.includes(band));
    const showUsage = toBool(req.body.showUsage);
    const showStatus = toBool(req.body.showStatus);
    const enabled = toBool(req.body.enabled);

    const share = await saveShareConfig(req.params.id, { bands, showUsage, showStatus, enabled });
    res.json({ ok: true, share, link: `${req.protocol}://${req.get('host')}/share/${share.token}` });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
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
      bandRows: groupByBand(grid),
      bands: BANDS,
      modes: MODES,
      error: err.message
    });
  } catch (renderErr) {
    next(renderErr);
  }
}
