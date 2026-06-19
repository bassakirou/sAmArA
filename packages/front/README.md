# Samara Front

Storefront Next.js 13 de Samara pour les clients finaux.

Ce depot est prevu pour vivre seul et etre deploye automatiquement sur Vercel.

## Stack

- Next.js 13
- React 18
- TypeScript
- Tailwind CSS
- React Query
- next-auth
- next-i18next
- Stripe / PayPal / Razorpay selon configuration
- PWA

## Demarrage local

1. Installer les dependances :
   ```bash
   npm ci
   ```
2. Creer l'environnement local :
   ```bash
   cp .env.example .env.local
   ```
3. Lancer le serveur :
   ```bash
   npm run dev
   ```
4. Ouvrir `http://localhost:3003`.

## Variables d'environnement

- Exemple local : `.env.example`
- Exemple production : `.env.production.example`
- Le vrai `.env.local` / `.env.production.local` ne doit jamais etre committe.

Variables critiques :

- `NEXT_PUBLIC_REST_API_ENDPOINT`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SHOP_URL`
- `NEXT_PUBLIC_AUTH_TOKEN_KEY`
- `NEXTAUTH_URL`
- `SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_PUSHER_APP_KEY`
- `NEXT_PUBLIC_PUSHER_HOST`
- `NEXT_PUBLIC_PUSHER_PORT`

## CI

Le workflow `/.github/workflows/ci.yml` verifie ce depot sur chaque push / pull request :

- installation des dependances avec `npm ci`
- lint avec `next lint`
- verification TypeScript avec `tsc --noEmit`
- build Next.js

## Deploiement Vercel

Le workflow `/.github/workflows/deploy-vercel.yml` deploie automatiquement sur Vercel a chaque push sur `main`.

### Secrets GitHub requis

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Variables a configurer dans Vercel

Reprendre les valeurs de `.env.production.example` dans les variables d'environnement du projet Vercel.

### Recommandation

Si tu gardes ce workflow GitHub Actions comme pipeline de production, desactive le deploiement Git automatique cote Vercel pour eviter les doublons.

## Commandes utiles

```bash
npm run dev
npm run build
```
