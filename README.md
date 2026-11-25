# Visiora

Application web responsive de campagnes de visibilité pour TikTok, YouTube et Facebook.

## Stack
- Next.js 16 App Router
- React 19
- TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- Vercel (déploiement continu depuis GitHub)

## Démarrage
```bash
npm install
npm run dev
```

## Variables d'environnement
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

La clé publishable est conçue pour être utilisée côté client avec les politiques RLS activées. Ne jamais exposer une clé secrète Supabase ou une clé service-role dans le navigateur.

## Authentification
Les routes `/connexion` et `/espace` utilisent Supabase Auth. La confirmation par e-mail renvoie vers `/auth/callback`. Les sessions sont gérées par cookies via `@supabase/ssr`.

## Base de données
Le schéma initial est provisionné dans le projet Supabase `visiora-production`. Les tables exposées utilisent Row Level Security.

## Principes produit
Visiora promeut la découverte de contenus et les interactions authentiques. Les abonnements et interactions doivent rester volontaires ; aucun faux abonné ni compte automatisé.
