# Enhanced LightDom Design System Rules

## HTML5 Semantic Foundation

### Layout Semantics
1. **Use semantic HTML5 elements**:
   - `<main>` for primary content areas
   - `<section>` for logical content groupings (WorkflowPanel)
   - `<article>` for self-contained content blocks
   - `<aside>` for secondary/side content
   - `<header>` and `<footer>` for page regions
   - `<nav>` for navigation elements

2. **Form Semantics**:
   - `<form>`, `<fieldset>`, `<legend>` for form structure
   - `<label>` with proper `for` attributes for accessibility
   - `<input>`, `<textarea>`, `<select>` with semantic types
   - `<button>` over `<div>` for interactive elements

3. **Interactive Elements**:
   - `<dialog>` for modal overlays
   - `<details>`/`<summary>` for collapsible content
   - `<progress>` for loading states
   - `<meter>` for gauge/value displays

4. **Content Semantics**:
   - `<figure>`/`<figcaption>` for images/charts
   - `<time>` with `datetime` attribute for timestamps
   - `<mark>` for highlighting important content

## Component Architecture Rules

### Atomic Design Hierarchy
1. **Atoms**: Basic elements (Button, Input, Badge, Icon)
2. **Molecules**: Compound atoms (KpiCard, FormField, ActionButton)
3. **Organisms**: Complex molecules (WorkflowPanel, KpiGrid, AsyncState)
4. **Templates**: Page-level layouts (DashboardPage, FormLayout)
5. **Pages**: Complete implementations (AdminDashboardPage, SEOModelTrainingPage)

### Component Composition Rules
1. **Single Responsibility**: Each component handles one concern
2. **Compound Components**: Use React.cloneElement for related sub-components
3. **Render Props**: For flexible composition patterns
4. **Higher-Order Components**: For cross-cutting concerns (auth, loading)

### Variant System Rules
1. **cva-based Variants**: Use `class-variance-authority` for all component variants
2. **Semantic Naming**: `primary`, `secondary`, `success`, `warning`, `error`, `neutral`
3. **Size Variants**: `sm`, `md`, `lg` for consistent scaling
4. **State Variants**: `disabled`, `loading`, `active`, `hover`

## MD3 Implementation Rules

### Color & Theming
1. **Semantic Colors**: Use MD3 tokens (`--md3-primary`, `--md3-on-primary`, etc.)
2. **Surface System**: 5-level elevation with appropriate shadows
3. **State Layers**: Hover, focus, pressed states with overlay colors
4. **Dark/Light Mode**: Support both themes with automatic switching

### Typography Scale
1. **MD3 Scale**: Display (large/medium/small), Headline, Title, Body, Label
2. **Line Heights**: Appropriate ratios for each scale
3. **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
4. **Text Colors**: `text-on-surface`, `text-on-surface-variant`, etc.

### Spacing & Layout
1. **4px Grid**: Base unit for all spacing and sizing
2. **Consistent Margins**: Use predefined gap classes
3. **Container Queries**: Responsive design with modern CSS
4. **Flex/Grid**: Appropriate layout systems for different use cases

## Accessibility Rules

### WCAG 2.1 AA Compliance
1. **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
2. **Focus Indicators**: Visible focus rings on all interactive elements
3. **Keyboard Navigation**: Full keyboard accessibility
4. **Screen Reader Support**: Proper ARIA labels and semantic markup

### Interactive Elements
1. **Button Semantics**: Use `<button>` or `role="button"` with keyboard support
2. **Form Labels**: Every form control has an associated label
3. **Error States**: Clear error messaging and visual indicators
4. **Loading States**: Indicate when content is loading

## Performance Rules

### Bundle Optimization
1. **Tree Shaking**: Only import used components
2. **Code Splitting**: Lazy load non-critical components
3. **Bundle Analysis**: Monitor bundle sizes regularly

### Rendering Performance
1. **Memoization**: Use `React.memo` for expensive components
2. **Virtualization**: For large lists (react-window, react-virtualized)
3. **Debouncing**: For search inputs and API calls

## Testing Rules

### Component Testing
1. **Unit Tests**: Test component logic and variants
2. **Integration Tests**: Test component interactions
3. **Visual Regression**: Automated screenshot testing
4. **Accessibility Testing**: Automated a11y checks

### Test Organization
1. **Colocation**: Tests next to components
2. **Consistent Naming**: `ComponentName.test.tsx`
3. **Coverage Goals**: 80%+ code coverage target

## Documentation Rules

### Component Documentation
1. **README**: Each component has usage examples
2. **Props Interface**: Fully typed and documented
3. **Variants**: All variants documented with examples
4. **Accessibility**: A11y considerations documented

### Design System Updates
1. **Version Control**: Document breaking changes
2. **Migration Guides**: For major updates
3. **Deprecation Policy**: Clear deprecation timelines

## Memory & Workflow Integration

### Automatic Memory Creation Triggers
- **API Patterns**: New endpoint structures or error handling
- **Component Variants**: Novel styling or interaction patterns
- **Design System**: New conventions or token usage
- **Architecture**: Significant structural decisions
- **Performance**: Optimization techniques or bottlenecks
- **Security**: Implementation patterns or vulnerabilities
- **Integration**: Third-party service connections
- **Problem Solving**: Complex issues with reusable solutions

### Memory Workflow Integration
- **Reference Memories**: During component development
- **Update Existing**: When patterns evolve
- **Link Workflows**: Connect memories to automation workflows
- **Review Cycle**: Quarterly memory relevance assessment

## Development Workflow Rules

### Component Creation
1. **Start with MD3**: Base all components on Material Design 3
2. **Use Primitives**: Build on existing design system components
3. **Test Variants**: Ensure all variants work correctly
4. **Document Usage**: Add examples to design system docs

### Dashboard Implementation
1. **Follow MD3 Rules**: Use established dashboard patterns
2. **Async States**: Handle loading/error/empty states
3. **KPI Cards**: Use for key metrics display
4. **Workflow Panels**: Structure content in logical sections

### Code Quality
1. **TypeScript**: Full type coverage required
2. **Linting**: Pass all ESLint rules
3. **Testing**: Unit tests for component logic
4. **Accessibility**: WCAG AA compliance

## Migration & Maintenance

### Legacy Component Handling
1. **Gradual Migration**: Migrate components over time
2. **Backward Compatibility**: Maintain existing APIs
3. **Deprecation Warnings**: Alert developers to changes
4. **Removal Timeline**: Clear schedule for old component removal

### System Evolution
1. **Regular Audits**: Review component usage and performance
2. **User Feedback**: Incorporate UX improvements
3. **Technology Updates**: Keep dependencies current
4. **Performance Monitoring**: Track bundle sizes and runtime performance
