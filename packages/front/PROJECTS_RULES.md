# Règles du Projet Front

Ce document définit les règles et conventions spécifiques au projet Front (`packages/front`).

## Structure du Code

- Utilisez les alias de chemin (`@components/*`, `@framework/*`, etc.) pour les imports. Évitez les chemins relatifs complexes.
- La logique de récupération de données côté client (React Query) se trouve dans `src/framework/rest/`.
- La logique de récupération de données côté serveur (SSR) se trouve dans les fichiers `*.ssr.ts` du même répertoire.

## Qualité du Code

- **Très important:** La compilation de production (`next build`) **ignore toujours** les erreurs TypeScript et ESLint.
- Avant de considérer une modification comme terminée, lancez explicitement `tsc --noEmit` pour détecter les erreurs de types.
- Tout nouveau code doit être typé correctement avec TypeScript.

## Internationalisation (i18n)

- Les chaînes de caractères visibles par l'utilisateur doivent être internationalisées en utilisant `next-i18next`.
- Les fichiers de traduction se trouvent dans `public/locales/`.

## Déploiement

- Le déploiement sur Vercel est déclenché par un push sur la branche `main` contenant `[front]` ou `[all]` dans le message de commit.
- Les variables d'environnement de production sont gérées dans `vercel.json`.
