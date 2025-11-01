---
description: Apply Material Design 3 dashboard components, async states, and documentation updates using the new design system primitives.
auto_execution_mode: 3
---

1. Review current dashboard requirements
   - Open `frontend/src/pages/DashboardPage.tsx`
   - skim for existing data hooks (`useDashboardData`) and identify places to apply WorkflowPanel, KPI, and async states.

2. Integrate MD3 dashboard primitives
   - Replace legacy card layouts with `<KpiGrid>` and `<KpiCard>` using MD3 tokens.
   - Wrap detailed sections with `<WorkflowPanel>` + `<WorkflowPanelSection>` + `<WorkflowPanelFooter>`.
   - Use `<AsyncStateLoading>`, `<AsyncStateError>`, and `<AsyncStateEmpty>` for resilient loading states.

3. Verify design tokens and typography
   - Ensure all text uses MD3 classes (`md3-headline-large`, `md3-body-medium`, etc.).
   - Confirm surfaces/elevation (`bg-surface-container`, `shadow-level-*`) match design system guidance.

4. Add high-impact actions
   - Inject `<Fab>` for core workflow creation actions.
   - Confirm icon + label combination aligns with MD3 FAB guidelines.

5. Sync documentation
   - Update `docs/design-system/README.md` with any new usage notes discovered.
   - Cross-reference `docs/design-system/IMPLEMENTATION_SUMMARY.md` if structural changes occur.

6. Capture learnings
   - Summarize design choices in Cascade memory.
   - Note any follow-up tasks (SEO dashboard, neural network dashboard) for future workflows.