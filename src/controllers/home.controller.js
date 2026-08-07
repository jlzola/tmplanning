import { listSessions } from '../services/sessions.service.js';
import { countOccupied, TOTAL_SLOTS } from '../services/bands.service.js';

export async function showHome(req, res, next) {
  try {
    const sessions = await listSessions();
    const withOccupancy = await Promise.all(
      sessions.map(async (session) => ({
        ...session,
        occupiedCount: await countOccupied(session.id),
        totalSlots: TOTAL_SLOTS,
        operatorsSearch: session.operators.map((o) => o.call).join(' ')
      }))
    );
    res.render('home', { title: 'Accueil', sessions: withOccupancy });
  } catch (err) {
    next(err);
  }
}
