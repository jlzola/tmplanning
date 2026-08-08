# TMPlanning

Application web pour les radioamateurs permettant de déclarer en direct
qu'un opérateur émet sur une bande et un mode donnés, le temps d'une
session TM (activité spéciale, contest, événement).

## Fonctionnalités

- Création de sessions TMPlanning (nom, dates, liste d'opérateurs)
- Vue de la grille bande × mode d'une session : qui occupe quoi, en temps réel
- Réservation d'une bande/mode libre, puis libération (QRT)
- Édition de la liste d'opérateurs, clôture/réouverture et suppression d'une session
- Export/import des opérateurs au format CSV
- Export/import d'une session au format JSON
- Bouton "Refresh" avec rafraîchissement automatique de la grille

## Stack

- Node.js (ESM), Express, express-handlebars
- Stockage en fichiers JSON (`src/data/`), aucune base de données requise

## Installation

```bash
npm install
cp .env.example .env
npm start
```

L'application est disponible sur `http://localhost:3000` (port configurable via `.env`).

Pour le développement (rechargement automatique) :

```bash
npm run dev
```

## Déploiement (production)

```bash
git clone https://github.com/jlzola/tmplanning.git
cd tmplanning
npm install --omit=dev
cp .env.example .env   # éditer PORT / APP_NAME si besoin

npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup            # exécuter la commande affichée pour le démarrage auto au boot
```

Reverse proxy + HTTPS : voir l'exemple de vhost nginx dans
[`deploy/nginx-tmplanning.conf`](deploy/nginx-tmplanning.conf), puis :

```bash
certbot --nginx -d tmplanning.jelobox.fr
```

Les données (`src/data/sessions.json`, `activity.json`) sont créées
automatiquement au premier lancement — pensez à les sauvegarder
régulièrement, il n'y a pas de base de données.

Mise à jour :

```bash
git pull
npm install --omit=dev
pm2 restart tmplanning
```

## Auteur

Jean-Louis Zola,  ([**F4IXH**](https://www.qrz.com/db/F4IXH))

Application gratuite pour la communauté des radioamateurs, sans contrôle ni
modération — c'est l'esprit radioamateur. Si elle te rend service, un petit
tip fait toujours plaisir : [☕ paypal.me/jlzola](https://www.paypal.me/jlzola/2EUR)

## Licence

MIT
