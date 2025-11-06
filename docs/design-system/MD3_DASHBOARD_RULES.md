# MD3 Dashboard Implementation Rules

These rules codify the best practices gathered during research so teams can quickly apply the MD3 dashboard pattern across LightDom applications.

## Layout & Structure
1. **Feature-first organization** – dashboards live in `frontend/src/pages` but should rely on primitives exported from `frontend/src/components/ui` to keep layouts consistent.
2. **Workflow panels** – wrap dashboard sections with `<WorkflowPanel>` and `<WorkflowPanelSection>` to provide consistent surface, spacing, and typography. Use `<WorkflowPanelFooter>` for actions or metadata summaries.
3. **KPI grid** – surface key metrics via `<KpiGrid>` and `<KpiCard>` components. Limit columns to 4 for desktop; rely on responsive breakpoints baked into the grid variants.
4. **Async resilience** – handle loading/empty/error states using `<AsyncStateLoading>`, `<AsyncStateEmpty>`, and `<AsyncStateError>` before rendering workflows.

## Styling & Tokens
1. **MD3 typography** – use the `md3-*` classes from the design system (e.g., `md3-headline-large`, `md3-body-medium`) instead of custom typography utilities.
2. **Surfaces & elevation** – rely on tokens such as `bg-surface-container`, `bg-surface-container-high`, `shadow-level-*`, and `border-outline` to achieve consistent elevation.
3. **Color & tone** – only pass variant tones supported by primitives (`primary`, `success`, `warning`, `error`, `neutral`) and pair them with the correct MD3 icon colors.

## Actions & Navigation
1. **Floating action button** – use the shared `<Fab>` component for high-priority workflows. Default to `extended` with clear labels for clarity.
2. **Quick actions** – present secondary actions via bordered buttons (`ActionButton`) embedded inside workflow panels; avoid raw `<button>` styling.

## Data Fetching & Async Logic
1. Ensure each dashboard performs API calls via hooks or React Query wherever possible.
2. Always guard dashboards with loading/error states before rendering WorkflowPanels to avoid layout jumping.
3. Transform backend payloads within the page component or a dedicated hook before passing data into UI primitives.

## Documentation & Automation
1. Update `docs/design-system/README.md` whenever new dashboard primitives or tokens are exposed.
2. When applying these rules to new dashboards, reference `.windsurf/workflows/dashboard-md3-refresh.md` to follow the step-by-step migration guide.
3. Capture any new insights or pitfalls as Cascade memories so future workflows stay aligned.
