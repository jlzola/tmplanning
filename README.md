# TM Planning

Application web pour les radioamateurs permettant de déclarer en direct
qu'un opérateur émet sur une bande et un mode donnés, le temps d'une
session TM (activité spéciale, contest, événement).

Inspirée de [TM47CDXC Operation Planning](https://tm47cdxc.jelobox.fr/).

## Fonctionnalités

- Création de sessions TM Planning (nom, dates, liste d'opérateurs)
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

## Auteur

Jean-Louis Zola, **F4IXH** ([fiche QRZ](https://www.qrz.com/db/F4IXH))

Application gratuite pour la communauté des radioamateurs, sans contrôle ni
modération — c'est l'esprit radioamateur. Si elle te rend service, un petit
tip fait toujours plaisir : [☕ paypal.me/F4IXH](https://www.paypal.me/F4IXH/2EUR)

## Licence

MIT
