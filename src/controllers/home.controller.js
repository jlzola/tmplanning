import { listSessions } from '../services/sessions.service.js';

export async function showHome(req, res, next) {
  try {
    const sessions = await listSessions();
    res.render('home', { title: 'Accueil', sessions });
  } catch (err) {
    next(err);
  }
}
