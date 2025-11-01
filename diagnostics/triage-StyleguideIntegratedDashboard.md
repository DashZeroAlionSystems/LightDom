# Triage: src/components/StyleguideIntegratedDashboard.tsx

Summary
-------
This component is high in TypeScript error counts (see diagnostics/top-25-ts-errors-clean.json). Common failures across similar UI files are:

- Missing or incompatible design-system symbols (EnhancedSpacing, EnhancedColors, typography tokens).
- Ant Design icon named-export mismatches with the installed `@ant-design/icons` version.
- Incorrect or missing prop types for component props and children.

Observed / Likely errors
------------------------
- TS2304: Cannot find name 'EnhancedSpacing' / 'EnhancedColors' — indicates the design system re-exports or the types file isn't imported.
- TS2724 / TS2614: Module '"@ant-design/icons"' has no exported member 'XOutlined' — icon import style mismatch.
- TS2322: Type 'Partial<...>' not assignable to required prop types.

Low-risk fixes
-------------
1. Ensure `src/styles/LightDomDesignSystem.tsx` exports the tokens used here under the expected names. If names differ, add small compatibility re-exports in `src/styles/`:

```ts
// src/styles/design-system-compat.ts
export { default as EnhancedSpacing } from './LightDomDesignSystem';
// or
export const EnhancedSpacing = LightDomSpacing;
```

2. Use the ant-design icons shim (`src/types/ant-design-icons-shims.d.ts`) as a stop-gap. Where feasible, prefer default imports for icons:

```ts
import SettingOutlined from '@ant-design/icons/SettingOutlined';
```

3. If component props are assigned from `Partial<T>`, update the component to handle optional fields or make the callers pass required properties. Add minimal tests for render paths.

Notes and next steps
--------------------
- Create a compatibility re-export file if the design-system tokens have been renamed project-wide.
- After applying small shims, re-run `npm run type-check` and iterate on any remaining, smaller errors.
