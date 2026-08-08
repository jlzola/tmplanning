import { BANDS, MODES } from '../config/constants.js';
import { getSessionByShareToken } from '../services/sessions.service.js';
import { listGrid } from '../services/bands.service.js';
import { groupByBand } from '../utils/grid.js';

export async function showShare(req, res, next) {
  try {
    const session = await getSessionByShareToken(req.params.token);
    if (!session || !session.share) {
      return res.status(404).render('share/unavailable', {
        title: 'Lien de partage invalide',
        layout: 'share',
        reason: 'not-found'
      });
    }

    const { share } = session;

    if (!share.enabled) {
      return res.status(410).render('share/unavailable', {
        title: 'Partage désactivé',
        layout: 'share',
        reason: 'inactive'
      });
    }

    let bandRows = null;
    if (share.showStatus) {
      const grid = await listGrid(session.id);
      bandRows = groupByBand(grid.filter((cell) => share.bands.includes(cell.band)));
    }

    const chartUrl = share.bands.length < BANDS.length
      ? `/sessions/${session.id}/bands.svg?bands=${share.bands.map(encodeURIComponent).join(',')}`
      : `/sessions/${session.id}/bands.svg`;

    res.render('share/show', {
      title: session.name,
      layout: 'share',
      session,
      share,
      bandRows,
      modes: MODES,
      chartUrl,
      refreshUrl: `/share/${share.token}`
    });
  } catch (err) {
    next(err);
  }
}
