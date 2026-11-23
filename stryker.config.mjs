// Configuration des tests de mutation (Stryker).
//
// Stryker fabrique des versions sabotées du code de l'application (des
// « mutants » : un `<` changé en `<=`, un `-` en `+`, une condition remplacée
// par `true`...) et lance les tests sur chacune. Un mutant détecté par au moins
// un test est « tué » ; un mutant qu'aucun test ne voit « survit » et signale
// un trou dans le filet de tests.

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  // On sabote le code de l'application, jamais les tests.
  mutate: ['app/**/*.ts'],

  testRunner: 'jest',
  jest: { configFile: 'jest.config.ts' },

  // Pour chaque mutant, Stryker ne lance que les tests qui passent par la ligne
  // sabotée : même verdict, en beaucoup moins de temps.
  coverageAnalysis: 'perTest',

  reporters: ['clear-text', 'progress', 'html'],
  htmlReporter: { fileName: 'reports/mutation/mutation.html' },

  // Seuil : la commande échoue si un seul mutant survit (score sous 100 %).
  thresholds: { high: 100, low: 100, break: 100 },
};
