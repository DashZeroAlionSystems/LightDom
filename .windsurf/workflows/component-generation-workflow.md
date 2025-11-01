---
description: Automated workflow for generating new MD3-compliant components with proper structure, variants, and documentation
auto_execution_mode: 3
---

1. **Component Analysis**
   - Review component requirements against MD3_DASHBOARD_RULES.md
   - Identify HTML5 semantic elements to use as foundation
   - Determine variant needs (size, tone, state)
   - Check for existing similar components to maintain consistency

2. **Component Scaffolding**
   - Generate TypeScript interface with proper VariantProps
   - Create cva-based variant system using MD3 tokens
   - Implement accessibility features (ARIA, focus management)
   - Add proper React.forwardRef for ref forwarding

3. **Variant Implementation**
   - Implement size variants (sm, md, lg) with consistent scaling
   - Add semantic tone variants (primary, success, warning, error, neutral)
   - Include state variants (disabled, loading) where applicable
   - Ensure MD3 color token usage throughout

4. **HTML5 Semantic Integration**
   - Use appropriate semantic elements (<button>, <dialog>, <progress>, etc.)
   - Implement proper ARIA attributes for accessibility
   - Add keyboard navigation support
   - Ensure screen reader compatibility

5. **Testing & Documentation**
   - Generate unit tests for component variants
   - Create usage examples in design system README
   - Add accessibility testing guidelines
   - Document integration with existing component ecosystem

6. **Component Registration**
   - Export from UI index with proper TypeScript types
   - Update design system documentation
   - Create memory entry for component patterns used
   - Verify integration with existing dashboard workflows

7. **Quality Assurance**
   - Run TypeScript compilation checks
   - Verify MD3 token usage consistency
   - Test component in multiple dashboard contexts
   - Ensure responsive behavior across screen sizes