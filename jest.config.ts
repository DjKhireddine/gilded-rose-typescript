import { pathsToModuleNameMapper } from  "ts-jest";
import { compilerOptions } from './tsconfig.json'

export default {
  roots: ['<rootDir>/app', '<rootDir>/test/jest'],
  collectCoverage: true,
  // On mesure le code de l'application, pas celui des tests.
  collectCoverageFrom: ['app/**/*.ts'],
  coverageDirectory: 'coverage',
  // Istanbul (« babel ») compte les branches en lisant le code avant l'exécution :
  // le total est fixe, quel que soit le jeu de tests lancé.
  coverageProvider: 'babel',
  // Les tests échouent si la moindre ligne ou branche n'est plus couverte.
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' } ),
};
