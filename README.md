# Visiora

Application web responsive de campagnes de visibilité pour TikTok, YouTube et Facebook.

## Stack
- Next.js App Router
- React
- TypeScript
- Supabase (Auth, PostgreSQL, Row Level Security)
- Vercel (déploiement continu depuis GitHub)

## Démarrage
```bash
npm install
npm run dev
```

## Variables d'environnement
Créer un fichier `.env.local` à partir de ces variables :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Ne jamais exposer une clé Supabase `service_role` ou une clé secrète dans le navigateur.

## Base de données
Le schéma initial est provisionné dans le projet Supabase `visiora-production`. Les tables exposées utilisent Row Level Security.

## Principes produit
Visiora promeut la découverte de contenus et les interactions authentiques. Les abonnements et interactions doivent rester volontaires ; aucun faux abonné ni compte automatisé.
