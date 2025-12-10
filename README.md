# andrew.wang-hoyer.com

Personal website and portfolio showcasing creative coding experiments.

## Quick Start

```bash
nvm use           # Use Node 22 (from .nvmrc)
npm install       # Install dependencies
npm run dev       # Start development server
```

## Build

```bash
npm run build     # Full production build to dist/
npm run typecheck # TypeScript type checking
npm run test      # Run tests
```

## Deploy

```bash
wrangler login      # First time: authenticate with Cloudflare
npm run deploy:cf   # Build and deploy to Cloudflare Pages
```

## Tech Stack

- **Static Site Generator**: 11ty v3
- **Build Tool**: Vite v6
- **Language**: TypeScript
- **Styling**: PostCSS with custom properties
- **Testing**: Vitest

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.
