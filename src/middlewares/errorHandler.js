export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).render('error', { title: 'Erreur', message: err.message });
}

export function notFoundHandler(req, res) {
  res.status(404).render('error', { title: 'Page introuvable', message: 'Page introuvable' });
}
