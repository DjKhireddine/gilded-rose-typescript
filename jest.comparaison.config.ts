import config from './jest.config';

// Comparaison avec le code d'origine (npm run test:comparaison).
// Elle reste hors de la suite habituelle, de la mutation et de la CI, car c'est
// un outil de refacto, pas une règle permanente : sa référence, le code
// d'origine, cesse d'en être une dès qu'un comportement change volontairement
// (Conjured en est déjà exclu). Dans la CI, elle bloquerait ces évolutions.
// Raison secondaire : elle lit le premier commit dans l'historique Git, que la
// CI ne récupère pas (elle ne prend que le dernier commit). Elle n'apporte rien
// à la couverture, déjà mesurée par la suite habituelle.
export default {
  ...config,
  roots: ['<rootDir>/test/comparaison'],
  collectCoverage: false,
};
