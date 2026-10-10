# Contributing to ApocalypseCalculus

Merci de contribuer. Objectif du projet : **modules autonomes, prêts à l’emploi, sécurisés, sans dépendance de compilation**, alignés sur les commentaires documentés.

## Principes

1. **DRY** — une seule source de vérité pour les drills (voir `data/challenges.json` et `src/Operations.php`).
2. **Sans build** — JS vanilla / PHP ; pas de bundler obligatoire.
3. **Ne pas casser le reste** — le frontend tombe en fallback local si le serveur est down.
4. **Sécurité** — valider JSON côté PHP ; ne jamais évaluer de code utilisateur.

## Structure utile

| Chemin | Rôle |
| --- | --- |
| `src/Operations.php` | Générateur serveur (niveaux, multiplications, intégrales, extrêmes) |
| `src/Storage.php` | Redis optionnel (likes) |
| `public/index.php` | API JSON + shell HTML |
| `public/assets/js/app.js` | UI principale |
| `public/assets/js/modules/MentalMath.js` | Module autonome mental math (aucune dépendance) |
| `data/challenges.json` | Données de session + méthodes (source documentaire) |
| `CHALLENGES.md` | Journal humain des sessions |
| `tests/` | PHPUnit + smoke API |

## Workflow

1. Fork / branche `feature/...`
2. Ajouter tests si logique pure (PHPUnit)
3. `php -S 0.0.0.0:8080 -t public` puis `bash tests/api_test.sh`
4. PR avec description courte

## Code style

- Commentaires en FR ou EN, **documentent le « pourquoi »**.
- Noms de méthodes explicites ; pas de magie globale nouvelle hors modules.
- Nouveaux drills : ajouter à `data/challenges.json` **et** au générateur (ou lire le JSON côté PHP si extension future).

## Licence

MIT — voir [LICENSE](LICENSE).
