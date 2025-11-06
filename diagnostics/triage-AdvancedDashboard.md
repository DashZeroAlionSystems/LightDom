# Triage: src/components/AdvancedDashboard.tsx

Summary
-------
`AdvancedDashboard.tsx` is among the high-error files. Errors typically fall into these categories for this repo:

- Missing or renamed exports from shared design-system modules.
- Incorrect typing for complex props (dashboard widgets, data models).
- Third-party type mismatches (Electron types, Web APIs) when running type-check.

Observed / Likely errors
------------------------
- TS2307: Cannot find module '../styles/LightDomDesignSystem' or missing named export.
- TS2339: Property 'components' or 'widgets' does not exist on passed-in config objects.
- TS2694/TS2724: Electron or DOM API types differ from runtime expectations.

Low-risk fixes
-------------
1. Add lightweight adapter types in `src/types/` to normalize incoming dashboard config shapes (e.g., `DashboardConfig` with optional fields).
2. Add compatibility re-exports for design tokens if names changed.
3. For Electron API mismatches, add small ambient declarations in `src/types/` (e.g., extend `Electron` namespace) as a temporary measure and schedule proper types upgrade.

Next steps
----------
- Create `src/types/dashboard-shims.d.ts` with `declare interface DashboardConfig { widgets?: any[] }` to unblock compilation while creating robust typed interfaces.
- Re-run `npm run type-check` and iterate on any remaining reported fields.
