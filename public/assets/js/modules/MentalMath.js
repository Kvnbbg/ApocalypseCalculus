/**
 * MentalMath — module autonome, prêt à l’emploi, sans dépendance de compilation.
 *
 * Aligné sur data/challenges.json et les commentaires de src/Operations.php.
 * Usage navigateur :
 *   <script type="module">
 *     import { MentalMath } from './modules/MentalMath.js';
 *   </script>
 * Ou global (si chargé en script classique via attach) : window.MentalMath
 *
 * Sécurité : pure fonctions ; aucun eval ; entrées numériques bornées.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.MentalMath = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** Favorites synchronisés avec data/challenges.json (DRY). */
  const FAVORITES = [
    [17, 77],
    [23, 45],
    [36, 27],
    [48, 19],
    [17, 17]
  ];

  /**
   * × (n*10 - 1) : ex. ×19 = ×20 - ×1
   * @param {number} a
   * @param {number} nearRound ex. 20 pour 19
   * @returns {{ product: number, steps: string[] }}
   */
  function multiplyNearRound(a, nearRound) {
    const n = Number(a);
    const r = Number(nearRound);
    if (!Number.isFinite(n) || !Number.isFinite(r)) {
      throw new TypeError('MentalMath: numeric inputs required');
    }
    const factor = r - 1;
    const high = n * r;
    const product = high - n;
    return {
      product,
      steps: [
        n + ' × ' + factor + ' = ' + n + ' × ' + r + ' - ' + n,
        n + ' × ' + r + ' = ' + high,
        high + ' - ' + n + ' = ' + product
      ]
    };
  }

  /** 48 × 19 documenté (session challenge). */
  function fortyEightTimesNineteen() {
    return multiplyNearRound(48, 20);
  }

  /**
   * Génère un challenge multiplication (favorites ou aléatoire borné).
   * @param {{ level?: number, useFavorite?: boolean }} opts
   */
  function randomMultiply(opts) {
    opts = opts || {};
    const level = Math.max(1, Number(opts.level) || 1);
    let p, q;
    if (opts.useFavorite !== false && Math.random() < 0.5) {
      const pair = FAVORITES[Math.floor(Math.random() * FAVORITES.length)];
      p = pair[0];
      q = pair[1];
    } else {
      p = 11 + Math.floor(Math.random() * (6 * level + 6));
      q = 11 + Math.floor(Math.random() * (6 * level + 6));
    }
    const product = p * q;
    return {
      expr: p + ' * ' + q,
      tex: p + ' \\times ' + q,
      result: String(product),
      resultTex: String(product),
      author: 'MentalMath module',
      hint: q === 19 || q % 10 === 9
        ? 'Astuce : ×' + q + ' = ×' + (q + 1) + ' puis soustraire le premier facteur'
        : 'Décompose : a×(b+c) = a×b + a×c'
    };
  }

  function formatChallenge(challenge) {
    if (!challenge || typeof challenge !== 'object') return '';
    return 'Solve: ' + (challenge.tex || challenge.expr || '');
  }

  return {
    FAVORITES: FAVORITES.slice(),
    multiplyNearRound: multiplyNearRound,
    fortyEightTimesNineteen: fortyEightTimesNineteen,
    randomMultiply: randomMultiply,
    formatChallenge: formatChallenge,
    version: '1.0.0'
  };
});
