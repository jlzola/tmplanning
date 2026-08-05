import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import routes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const STATUS_LABELS = { ongoing: 'En cours', upcoming: 'À venir', ended: 'Terminée' };

app.engine('handlebars', engine({
  helpers: {
    eq: (a, b) => a === b,
    statusLabel: (status) => STATUS_LABELS[status] ?? status
  }
}));
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.appName = process.env.APP_NAME || 'TM Planning';
  next();
});

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
