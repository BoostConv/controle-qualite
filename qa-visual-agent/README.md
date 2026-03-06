# QA Visual Agent

Outil interne de contrôle qualité visuel pour agence CRO. Compare des maquettes Figma avec des pages web développées en utilisant l'IA (Claude Sonnet).

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- API Anthropic (claude-sonnet-4-5) pour l'analyse visuelle
- API ScreenshotOne pour les captures automatiques

## Installation

```bash
cd qa-visual-agent
npm install
```

## Configuration

Créez un fichier `.env.local` à la racine :

```
ANTHROPIC_API_KEY=sk-ant-...
SCREENSHOTONE_API_KEY=...
```

### Obtenir les clés

- **Anthropic** : [console.anthropic.com](https://console.anthropic.com/)
- **ScreenshotOne** : [screenshotone.com](https://screenshotone.com/)

## Développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Déploiement Vercel

1. Poussez le code sur GitHub
2. Importez le projet dans [Vercel](https://vercel.com)
3. Configurez les variables d'environnement dans les Settings du projet :
   - `ANTHROPIC_API_KEY`
   - `SCREENSHOTONE_API_KEY`
4. Déployez

### Commande CLI

```bash
npx vercel --prod
```

## Utilisation

1. **Uploadez** une maquette Figma (PNG/JPG/WebP) dans la colonne Desktop et/ou Mobile
2. **Capturez** la page développée via URL ou upload manuel
3. **Lancez l'analyse** — Claude compare les images et génère un rapport détaillé
4. **Consultez le rapport** avec scores, issues filtrables, et options de copie

## Structure

```
qa-visual-agent/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # Analyse via Claude Vision
│   │   └── screenshot/route.ts # Capture via ScreenshotOne
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Interface principale
├── components/
│   ├── IssueCard.tsx           # Carte d'issue expandable
│   ├── ReportView.tsx          # Vue rapport complète
│   ├── ScoreRing.tsx           # Score circulaire animé
│   ├── UploadZone.tsx          # Zone d'upload drag & drop
│   └── ViewportColumn.tsx      # Colonne Desktop/Mobile
├── lib/
│   ├── anthropic.ts            # Client Claude Vision
│   └── screenshotone.ts        # Client ScreenshotOne
├── types/
│   └── index.ts                # Types TypeScript
└── .env.local                  # Variables d'environnement
```
