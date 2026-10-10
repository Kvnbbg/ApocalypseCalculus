# Modules autonomes

> « Je crée des modules autonomes, prêts à l’emploi, sécurisés et sans dépendance de compilation, alignés sur les commentaires documentés. »

## MentalMath (`public/assets/js/modules/MentalMath.js`)

- **Usage** : `type="module"` ou `window.MentalMath` si attaché au global.
- **Aucune dépendance** (pas de npm, pas de transpile).
- Fournit : `multiplyNearRound`, `drillFavorites`, `formatChallenge`, méthodes ×19 / ×27 documentées.
- Compatible avec le fallback local de `app.js` (détection `window.MentalMath`).

## PHP Operations

- Point d’entrée unique : `getRandomOperationForLevel($level, $seed = null)`.
- Case multiplication (type 7) : favorites alignées sur `data/challenges.json`.
- `checkAnswer` : numérique tolérant + texte normalisé ; **pas** d’`eval`.

## Données

- `data/challenges.json` = source documentaire + prochaines gains (ex. 48×19).
- `CHALLENGES.md` = journal lisible (symbiose data ↔ humain).
