import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Server/integration tests run in a Node environment.
    environment: "node",
    globals: true,
    // Exécution séquentielle des fichiers : chaque suite d'intégration charge
    // l'app Express + better-sqlite3 ; le parallélisme saturait la mémoire.
    fileParallelism: false,
    pool: "forks",
    // Les suites d'intégration enchaînent des logins bcrypt (coûteux en CPU) ;
    // on laisse une marge confortable aux hooks et aux tests.
    hookTimeout: 30000,
    testTimeout: 20000,
    include: ["server/**/*.{test,spec}.ts", "server/__tests__/**/*.ts", "src/**/*.{test,spec}.ts"],
  },
});
