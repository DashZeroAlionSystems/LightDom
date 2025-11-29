# LightDom Unified Styleguide

> **Status:** v0.1.0 (source of truth)  
> **Schema:** `design/styleguide.json`

This document captures the canonical visual, motion, and automation rules for the LightDom platform and StoryMiner services. All UI implementations, Storybook demos, and automated mining pipelines must conform to the tokens and conventions defined here.

---

## 1. Branding & Identity

### 1.1 Logo System
- Primary mark: `design/logo/primary.svg`
- Mask: `design/logo/mask.svg`
- Animation: `logo-router-animation` token (see §4 Motion). The animation pairs the logo with the active page name using the secondary font.
- Placement: top-left of the global header, vertically aligned with navigation. Page name appears to the right of the logo on desktop (4px padding) and below on mobile.

### 1.2 Authentication Placement
- Default: top-right header slot with button styling `btn-auth-primary`.
- Secondary: sticky CTA in hero for marketing views; inline card for admin login flows.
- Include avatar + dropdown inside the navigation rail for authenticated sessions.

---

## 2. Typography

| Token | Font Stack | Usage |
| --- | --- | --- |
| `font.primary` | "Space Grotesk", "Segoe UI", sans-serif | Headings, hero metrics |
| `font.secondary` | "IBM Plex Mono", "SFMono-Regular", monospace | Page labels, breadcrumb, telemetry readouts |
| `font.body` | "Inter", "Roboto", sans-serif | Body copy, data cards |
| `font.ui` | `font.body` | Buttons, inputs |

- Use the secondary font when animating the page name alongside the logo.
- Weight mapping: heading 600, body 400, meta 500.

---

## 3. Color System

Semantic ramp (light theme values):

| Token | Hex | Usage |
| --- | --- | --- |
| `color.primary` | `#4B5CFF` | Buttons, focus, active states |
| `color.secondary` | `#08C6A5` | Logo animation accent, charts |
| `color.surface` | `#0A0E27` (dark) / `#FFFFFF` (light) | Layout background |
| `color.onSurface` | `#F5F7FF` dark / `#1E2235` light | Text |
| `color.warning` | `#FFB347` | Alerts |
| `color.critical` | `#FF5F6D` | Failures |
| `color.success` | `#3ED598` | Success confirmations |

- Maintain WCAG AA contrast ratios for text on surfaces.
- Authentication surfaces must use `color.surfaceElevated` (`#11163A`) with border `color.outline` (`#2A3250`).

---

## 4. Motion & Chained Effects

### 4.1 Global Motion Tokens
| Token | Duration | Easing | Description |
| --- | --- | --- | --- |
| `motion.chain.fast` | 140ms | `cubic-bezier(0.2, 0.0, 0.2, 1)` | Hover → focus transitions |
| `motion.chain.emphasis` | 340ms | `cubic-bezier(0.25, 0.8, 0.25, 1)` | Call-to-action emphasis |
| `motion.logo.timeline` | 600ms | `easeOutQuart` | Logo + page-name reveal |

### 4.2 Logo Animation (Anime.js)
```ts
import anime from 'animejs';

export const logoRouterAnimation = (logoEl: HTMLElement, pageLabelEl: HTMLElement) => {
  const timeline = anime.timeline({ duration: 600, easing: 'easeOutQuart' });
  timeline
    .add({ targets: logoEl, scale: [0.85, 1], opacity: [0, 1], duration: 360 })
    .add({ targets: pageLabelEl, translateX: [-12, 0], opacity: [0, 1], duration: 280 }, '-=200');
  return timeline;
};
```
- Trigger on route change success; respect reduced-motion settings by skipping the timeline when `motion === 'none'`.

---

## 5. Component Taxonomy

| Category | Description | Naming Convention |
| --- | --- | --- |
| Atoms | Buttons, badges, typography tokens | `AtomName` / `atom-name` |
| Molecules | Cards, metric tiles, action bars | `MoleculeName` |
| Organisms | Dashboards, Crawlee control center | `OrganismName` |
| Templates | Page-level layouts with data binding | `TemplateName` |

- Storybook stories must follow `Category/Component/Variant` titles.
- Screenshots stored under `storyMining/data/processed/screenshots/{batchId}/{category}/{component}/{variant}.png`.

---

## 6. Sectional Theming & Product Enrichment

Enterprise surfaces may expose complementary themes that sit on top of the primary brand while remaining visually compatible with the animated logo system.

### 6.1 Theme Definitions
- **Primary Theme (`theme.primary`)** – Default LightDom palette and typography; must always be available.
- **Secondary Themes (`theme.secondary[*]`)** – Opt-in, feature-specific palettes used to enrich product areas (e.g., Campaigns, Analytics). Secondary themes:
  - Must declare `logoCompatibilityScore ≥ 0.9` when evaluated against the logo colors.
  - Inherit typography from the base styleguide unless they explicitly override the secondary font.
  - Provide an `animeMorphPalette` for the Anime.js morph animation that renders `{Logo} : {Category}`.
- **Service Inclusion Rules** – Themes register a `serviceMatrix` listing the modules where the theme may appear. Only services listed may apply the secondary theme.

### 6.2 Attribute Matrix

| Attribute | Description | Inheritable | Override Policy |
| --- | --- | --- | --- |
| `palette.base` | Core background + foreground colors | Yes | Clamp to accessible contrast ratios |
| `palette.accent` | Accent color used for highlight + animations | Yes | Must complement logo primary hue |
| `typography.secondary` | Mono/alternate font | Optional | Provide fallback stack |
| `motion.timeline` | Logo/category morph timeline adjustments | Optional | Duration delta ±120ms from primary |
| `data.directoryPrefix` | Custom data directory branch under `storyMining` | No | Unique per theme |
| `storybook.branding` | Storybook theme token overrides | Yes | Must pass visual QA checklist |

### 6.3 Campaign Theme Blueprint
- Namespace: `theme.secondary.campaigns`
- Palette: deep magenta base with cyan accent, validated for logo compatibility.
- Anime.js: morph animation extends the logo timeline with a cascading reveal of campaign tags using the secondary font.
- Service Matrix: `['campaigns-dashboard', 'campaigns-reports']`.
- Files generated by the crawler store under `storyMining/data/processed/screenshots/{batchId}/campaigns/...`.

### 6.4 Governance
- Secondary themes are stored alongside the primary styleguide JSON (see §8 governance) and must be reviewed via design QA.
- Automation scripts read the theme configuration to determine which sections of the styleguide may be edited when a secondary theme is active. Non-listed attributes remain locked to the primary theme.
- Anime.js morph tests must run as part of CI to ensure the logo/category animation remains smooth when switching themes.

---

## 7. Automation & Data Mining Rules

1. Crawler jobs must emit events to the StoryMiner message bus (`story.captured`, `layer.snapshot`, `prediction.result`).
2. BullMQ is the default queue for orchestrating discovery, crawl, and enrichment jobs; queue names follow `storyMiner:{service}:{priority}`.
3. Every crawl batch updates:
   - `design/styleguide.json` (tokens & taxonomy)
   - `docs/styleguide.md` (this file; append release note)
   - Storybook stories under `frontend/src/stories/`
4. Directory hierarchy follows the template in `storyMining/data/README.md`.
5. TensorFlow classifiers publish checkpoints to `storyMining/data/processed/models/checkpoints/` using timestamped folders.
6. Overlay service must visualize prediction confidence with a green→amber→red gradient defined by tokens `color.success`, `color.warning`, `color.critical`.

---

## 8. Governance & Change Process

- Any change to branding, typography, or motion requires updating both this markdown file and the JSON schema.
- Automation scripts should run `npm run styleguide:validate` before committing (script to be implemented in Phase 2).
- Keep append-only changelog at the bottom of this document.

### Changelog
- **2025-11-25** – v0.1 initial canonical guide established with StoryMiner scaffolding.
