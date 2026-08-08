import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import routes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';
import { APP_VERSION } from './src/config/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const STATUS_LABELS = { ongoing: 'En cours', upcoming: 'À venir', ended: 'Terminée' };
const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

app.engine('handlebars', engine({
  helpers: {
    eq: (a, b) => a === b,
    statusLabel: (status) => STATUS_LABELS[status] ?? status,
    formatDate: (dateStr) => (dateStr ? DATE_FORMATTER.format(new Date(dateStr)) : ''),
    formatDateTime,
    json: (value) => JSON.stringify(value ?? null)
  }
}));
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.appName = process.env.APP_NAME || 'TMPlanning';
  res.locals.appVersion = APP_VERSION;
  next();
});

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
