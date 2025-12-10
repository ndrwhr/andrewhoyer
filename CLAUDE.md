# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Andrew Wang-Hoyer's personal website and portfolio, an 11ty-based static site showcasing creative coding experiments and projects. The site features an interactive experiment gallery with procedurally generated SVG backgrounds.

## Build and Development Commands

### Initial Setup

```bash
nvm use          # Use Node version from .nvmrc (22)
npm install      # Install dependencies
```

### Development

```bash
npm run dev      # Start dev server with hot reloading
```

This command runs two processes concurrently:
- Vite dev server (compiles TypeScript/CSS) on port 3000
- 11ty with live reload watching for template changes

### Build

```bash
npm run build    # Full production build
```

This runs:
1. `vite build` - TypeScript/CSS compilation (outputs to `dist/public/`)
2. `npx @11ty/eleventy` - 11ty site generation (outputs to `dist/`)

### Individual Build Commands

```bash
npm run build:vite   # Vite build only
npm run build:11ty   # 11ty build only
npm run clean        # Remove dist/ directory
npm run typecheck    # TypeScript type checking
npm run test         # Run tests with Vitest
npm run test:run     # Run tests once (no watch)
```

### Deployment

```bash
wrangler login      # First time: authenticate with Cloudflare
npm run deploy:cf   # Build and deploy to Cloudflare Pages
```

Configure custom domain via Cloudflare dashboard after first deploy.

## Directory Structure

```
andrewhoyer/
├── src/
│   ├── _data/                  # 11ty data files (YAML)
│   │   ├── experiments.yml     # Experiment metadata
│   │   ├── contact.yml         # Contact links
│   │   └── site.json           # Site metadata
│   ├── _includes/              # Nunjucks partials
│   │   ├── experiments.njk
│   │   └── experiment.njk
│   ├── layouts/
│   │   └── default.njk         # Main layout
│   ├── pages/                  # Page templates
│   │   ├── index.njk
│   │   ├── 404.njk
│   │   └── resume.njk
│   ├── assets/images/          # Static images
│   ├── scripts/                # TypeScript source
│   │   ├── index.ts
│   │   ├── SiteBackground.ts
│   │   ├── Experiments.ts
│   │   ├── Experiment.ts
│   │   └── utils/Browser.ts
│   └── styles/                 # CSS source
│       ├── site.css
│       ├── resume.css
│       ├── experiment.css
│       ├── experiments.css
│       ├── four-o-four.css
│       └── variables.css
├── apps/                       # External apps (git submodules)
│   ├── experiments/            # Creative coding experiments
│   │   ├── blob/
│   │   ├── chaos-game/
│   │   ├── clock/
│   │   ├── cloth/
│   │   └── ... (18+ experiments)
│   ├── inkling/                # React work history app
│   └── swipe-sudoku/           # Sudoku landing page
├── tests/                      # Unit tests
├── dist/                       # Build output (gitignored)
├── eleventy.config.mjs         # 11ty configuration
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS configuration
└── vitest.config.ts            # Test configuration
```

## Architecture

### Static Site Generation (11ty)

- **Templates**: Nunjucks templating with `src/layouts/default.njk`
- **Data**: YAML files in `src/_data/` (experiments.yml, contact.yml)
- **Includes**: `src/_includes/` for reusable template partials
- **Pages**: `src/pages/` contains page templates
- **Config**: `eleventy.config.mjs` with custom filters (date, markdownify)

### Frontend Build System (Vite)

- **Entry points** (`vite.config.ts`):
  - `src/scripts/index.ts` → `dist/public/site.js` + `dist/public/site.css`
  - `src/styles/resume.css` → `dist/public/resume.css`

- **TypeScript** (`src/scripts/`):
  - `index.ts` - Entry point, initializes modules
  - `SiteBackground.ts` - Procedural SVG background generation
  - `Experiment.ts` - Interactive experiment card with SVG animation
  - `Experiments.ts` - Collection manager for experiment elements
  - `utils/Browser.ts` - Scroll/resize event utilities

- **CSS** (PostCSS pipeline):
  - Uses postcss-import, postcss-preset-env, postcss-custom-media, and cssnano
  - Source files in `src/styles/`
  - Custom media queries defined in `variables.css`

### Apps Directory

The `apps/` directory contains standalone projects:
- `apps/experiments/` - Creative coding experiments (mostly git submodules)
- `apps/inkling/` - React app for work history
- `apps/swipe-sudoku/` - Sudoku game landing page

These are copied to `dist/` via 11ty passthrough copy (configured in `eleventy.config.mjs`).
Note: `apps/experiments/svg-animations-src/dist` is mapped to `experiments/svg-animations` (pre-built output).
Submodules should not be modified directly.

## Important Patterns

### Experiment Data Structure

Experiments are defined in `src/_data/experiments.yml`:
- `name`, `date`, `description` - basic metadata
- `url` - link to experiment (internal or external)
- `repo` - GitHub repository link
- `points` - JSON-encoded SVG path coordinates for visual representation
- `tags` - categorization array

### Background Animation

The `SiteBackground` class generates animated SVG patterns. A random color scheme (1-5) is applied via body class `site--color-${random(1, 5)}`.

### Build Output

- Vite outputs JS/CSS to `dist/public/`
- 11ty generates HTML to `dist/`
- Static assets copied via passthrough: `src/assets/` → `dist/public/`
- Apps copied via passthrough: `apps/` → `dist/experiments/`, `dist/inkling/`, etc.

## Dependencies

### Runtime
- `gl-matrix` - Math utilities for SVG path calculations
- `lodash-es` - ES module version of Lodash utilities

### Build
- `@11ty/eleventy` v3 - Static site generation
- `vite` v6 - Build tool and dev server
- `typescript` v5 - Type checking
- `postcss-preset-env` - Modern CSS features
- `vitest` - Unit testing

## Testing

Tests are located in `tests/` and run with Vitest:
- `Browser.test.ts` - Scroll/resize listener tests
- `SiteBackground.test.ts` - SVG grid/shape generation tests
- `Experiment.test.ts` - SVG path creation tests
