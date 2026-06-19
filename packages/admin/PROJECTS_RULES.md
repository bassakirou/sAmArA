# Règles du Projet Admin

Ce document définit les règles et conventions spécifiques au projet Admin (`packages/admin`).

## Structure du Code

- Utilisez l'alias de chemin `@/*` pour importer depuis `src/*`. N'utilisez pas de chemins relatifs comme `../../`.
- La logique de récupération de données se trouve dans `src/data/`. Les nouveaux hooks de données doivent y être ajoutés.
- Les singletons clients (comme axios) et les constantes d'endpoints sont dans `src/data/client/`.

## Qualité du Code

- **Très important:** La compilation de production (`next build`) **n'exécute pas** la vérification de types TypeScript ni ESLint lorsque `APPLICATION_MODE === 'production'`.
- Avant de considérer une modification comme terminée, lancez explicitement `tsc --noEmit` et `next lint` pour détecter les erreurs.
- Tout nouveau code doit être typé correctement avec TypeScript.

## Internationalisation (i18n)

- Les chaînes de caractères visibles par l'utilisateur doivent être internationalisées en utilisant `next-i18next`.
- Les fichiers de traduction se trouvent dans `public/locales/`.

## Déploiement

- Le déploiement sur Vercel est déclenché par un push sur la branche `main` contenant `[admin]` ou `[all]` dans le message de commit.
- Les variables d'environnement de production sont gérées dans `vercel.json`.
