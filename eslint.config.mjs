// Configuration d'ESLint : il vérifie la qualité du code (erreurs probables,
// constructions à risque). La mise en forme est laissée à Prettier.
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // Dossiers produits par les outils : rien à vérifier.
  { ignores: ['coverage/', 'reports/', '.stryker-tmp/'] },

  // Règles recommandées de JavaScript, puis le jeu « strict » de TypeScript.
  eslint.configs.recommended,
  tseslint.configs.strict,

  {
    rules: {
      // Exigence du projet : aucun any, même écrit explicitement.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
);
