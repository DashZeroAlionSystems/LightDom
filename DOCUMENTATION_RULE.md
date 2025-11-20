# Documentation Rule & Enforcement Guide

## Core Rule

**Every code change MUST include corresponding documentation updates.**

This rule ensures that documentation stays synchronized with code, making the codebase maintainable, understandable, and professional.

---

## Rule Application

### When Code Changes, Documentation Changes

| Code Change Type | Required Documentation |
|-----------------|------------------------|
| New Component | Inline JSDoc + API docs + Usage example |
| Component Modification | Update inline comments + API docs |
| New Feature | User guide + Technical guide + Research (if applicable) |
| Bug Fix | CHANGELOG entry + Inline comment update |
| Architecture Change | Design docs + Diagrams + Migration guide |
| API Change | API documentation + Integration guide |
| Performance Optimization | Inline comments + Performance notes |
| Security Fix | Security docs + CHANGELOG + Advisory |

---

## Documentation Types

### 1. Inline Code Documentation (JSDoc)

**Required for:**
- All components
- All custom hooks
- All utility functions
- All complex logic

**Format:**
```typescript
/**
 * Component/Function brief description
 * 
 * Detailed explanation of what this does and why it exists.
 * Include any important context or design decisions.
 * 
 * @param paramName - Description of parameter with type info
 * @param anotherParam - Another parameter description
 * @returns Description of return value
 * 
 * @example
 * // Usage example showing typical use case
 * <ComponentName 
 *   paramName="value"
 *   anotherParam={data}
 * />
 * 
 * @remarks
 * Additional notes, warnings, or important information
 * 
 * @see RelatedComponent - Link to related functionality
 */
```

**Example:**
```typescript
/**
 * WorkflowNode - Atomic component for workflow visualization
 * 
 * Renders a single node in the workflow canvas with interactive controls
 * for selection, deletion, and configuration. Part of the atomic layer
 * in the atomic-to-dashboard architecture pattern.
 * 
 * @param node - Node data containing id, position, type, and configuration
 * @param isSelected - Whether this node is currently selected
 * @param onSelect - Callback fired when node is clicked
 * @param onDelete - Callback fired when delete button is clicked
 * @param onConfig - Callback fired when config button is clicked
 * @returns JSX.Element - Rendered workflow node with controls
 * 
 * @example
 * ```tsx
 * <WorkflowNode 
 *   node={{ id: '1', x: 100, y: 100, type: 'start', label: 'Begin' }}
 *   isSelected={false}
 *   onSelect={(id) => setSelectedNode(id)}
 *   onDelete={(id) => removeNode(id)}
 *   onConfig={(id) => openConfigModal(id)}
 * />
 * ```
 * 
 * @remarks
 * This component uses absolute positioning. Ensure parent has relative positioning.
 * Color scheme is determined by node type: start=green, action=blue, etc.
 * 
 * @see WorkflowCanvas - Parent component that manages node layout
 * @see NodePalette - Composite component that creates nodes
 */
const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onConfig
}) => {
  // Implementation
};
```

---

### 2. Component API Documentation

**Location:** `/docs/components/ComponentName.md`

**Template:**
```markdown
# ComponentName

## Overview
Brief description of what this component does and its purpose.

## API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| propName | string | Yes | - | Description of what this prop does |
| optionalProp | number | No | 0 | Optional prop with default value |

### Events

| Event | Signature | Description |
|-------|-----------|-------------|
| onEvent | (data: Type) => void | Fired when... |

### Return Value
Description of what the component renders.

## Usage Examples

### Basic Usage
```tsx
<ComponentName propName="value" />
```

### Advanced Usage
```tsx
<ComponentName 
  propName="value"
  optionalProp={10}
  onEvent={(data) => handleData(data)}
/>
```

## Styling
How to customize appearance, CSS classes available, etc.

## Accessibility
ARIA labels, keyboard navigation, screen reader support.

## Performance Considerations
Memoization, re-render behavior, expensive operations.

## Related Components
Links to similar or commonly used together components.

## Examples in Code
Links to actual usage in the codebase.
```

---

### 3. User Guides

**Location:** `/docs/guides/feature-name.md`

**Purpose:** Help users understand how to use features

**Structure:**
```markdown
# Feature Name User Guide

## What is [Feature]?
Simple explanation for end users.

## Getting Started
Step-by-step first-time setup or usage.

## Common Tasks

### Task 1: Do Something
1. Step one
2. Step two
3. Result

### Task 2: Do Something Else
...

## Tips & Tricks
Best practices, shortcuts, pro tips.

## Troubleshooting
Common issues and solutions.

## FAQ
Frequently asked questions.

## Next Steps
Where to go for more advanced usage.
```

---

### 4. Technical Guides

**Location:** `/docs/technical/topic-name.md`

**Purpose:** Explain how things work under the hood

**Structure:**
```markdown
# Technical Guide: [Topic]

## Architecture Overview
High-level system design.

## How It Works
Detailed explanation of mechanisms.

## Data Flow
```
Input → Process → Output
```

## State Management
How state is managed and why.

## Performance Optimizations
What optimizations are applied and why.

## Edge Cases
Special scenarios and how they're handled.

## Testing Strategy
How to test this functionality.

## Integration Points
How this connects to other parts of the system.

## Security Considerations
Security implications and mitigations.
```

---

### 5. Research Documentation

**Location:** `/RESEARCH_TOPIC.md` (root level) or `/docs/research/`

**Purpose:** Document design decisions, use case analysis, comparisons

**Structure:**
```markdown
# Research: [Topic]

## Problem Statement
What problem are we solving?

## Research Questions
1. Question one?
2. Question two?

## Findings

### Finding 1
Evidence and analysis.

### Finding 2
...

## Use Cases

### Use Case 1
Detailed scenario and solution.

## Technical Specifications
APIs, schemas, algorithms.

## Implementation Recommendations
How to build based on research.

## Success Metrics
How to measure if solution works.

## Future Considerations
Next steps and potential improvements.

## References
- Link 1
- Link 2
```

---

### 6. CHANGELOG

**Location:** `/CHANGELOG.md` (root level)

**Purpose:** Track all changes by version

**Format:**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature X
- New component Y

### Changed
- Modified behavior of Z

### Fixed
- Bug in component A

### Security
- Security fix for vulnerability B

## [1.2.0] - 2025-11-15

### Added
...
```

---

## Verification Checklist

Before submitting any code change, verify:

- [ ] **Inline Documentation**
  - [ ] JSDoc comments added/updated for changed functions
  - [ ] Parameter descriptions accurate
  - [ ] Return value documented
  - [ ] Usage example provided
  - [ ] Remarks for important context

- [ ] **Component API Documentation**
  - [ ] Component docs exist in `/docs/components/`
  - [ ] Props table updated
  - [ ] Events documented
  - [ ] Usage examples added
  - [ ] Related components linked

- [ ] **User-Facing Guides**
  - [ ] User guide updated if feature changed
  - [ ] Screenshots updated if UI changed
  - [ ] New sections added for new features
  - [ ] Troubleshooting updated if issues known

- [ ] **Technical Documentation**
  - [ ] Architecture docs updated if structure changed
  - [ ] Data flow diagrams updated
  - [ ] Integration guides updated if APIs changed
  - [ ] Performance notes added if optimization made

- [ ] **Research Documentation**
  - [ ] Research docs updated if use cases changed
  - [ ] New use cases added if discovered
  - [ ] Technical specs updated
  - [ ] References added for external resources

- [ ] **CHANGELOG**
  - [ ] Entry added under appropriate section (Added/Changed/Fixed/Security)
  - [ ] Change clearly described
  - [ ] Version number referenced
  - [ ] Breaking changes noted

- [ ] **Cross-References**
  - [ ] Related docs linked
  - [ ] See-also references added
  - [ ] Examples reference actual code
  - [ ] Consistency across all docs

---

## Documentation Standards

### Writing Style

**Be Clear:**
- Use simple language
- Avoid jargon unless necessary
- Define technical terms
- Use active voice

**Be Concise:**
- Get to the point quickly
- Remove unnecessary words
- Use bullet points for lists
- Break up long paragraphs

**Be Complete:**
- Include all required information
- Don't assume prior knowledge
- Provide examples
- Link to related content

**Be Consistent:**
- Use same terminology throughout
- Follow established patterns
- Match project voice and tone
- Use consistent formatting

### Code Examples

**Requirements:**
- Must be runnable (or clearly marked as pseudo-code)
- Include necessary imports
- Show realistic usage
- Add comments for complex parts
- Use TypeScript for type safety

**Example:**
```typescript
// ✅ Good example
import { WorkflowBuilder } from './components';

// Create a simple workflow with validation
const workflow = new WorkflowBuilder()
  .addNode({ type: 'start', label: 'Begin' })
  .addNode({ type: 'action', label: 'Process' })
  .addNode({ type: 'end', label: 'Finish' })
  .connect('start', 'action')
  .connect('action', 'end')
  .validate() // Ensures all nodes connected properly
  .build();
```

### Screenshots & Diagrams

**When to Include:**
- UI components (always)
- User workflows (when complex)
- Architecture diagrams (for system design)
- Data flow diagrams (for complex logic)
- Before/after comparisons (for improvements)

**Requirements:**
- High quality (at least 1920x1080 for full screens)
- Annotated if needed
- Consistent style
- Alt text for accessibility
- Hosted in repo or reliable CDN

---

## Enforcement

### PR Review Checklist

Every pull request will be checked for:

1. **Documentation completeness**
   - All required docs present
   - All sections filled in
   - No placeholders or TODOs

2. **Documentation quality**
   - Clear and concise writing
   - Proper formatting
   - Code examples work
   - Links not broken

3. **Documentation accuracy**
   - Matches actual code behavior
   - Examples run without errors
   - No outdated information
   - Version numbers correct

4. **Documentation consistency**
   - Terminology matches existing docs
   - Format matches templates
   - Style matches guidelines
   - Cross-references accurate

### Automated Checks

**Tools to Use:**
- ESLint plugin for JSDoc validation
- Markdown linters for doc files
- Link checkers for broken links
- Spell checkers for typos
- TypeScript compiler for code examples

### Manual Review

**Reviewers should:**
- Read all changed documentation
- Verify examples work
- Check for completeness
- Ensure clarity
- Validate accuracy

---

## Documentation Locations Summary

| Type | Location | Example |
|------|----------|---------|
| Inline JSDoc | In code files | `src/pages/WorkflowBuilderDemo.tsx` |
| Component API | `/docs/components/` | `docs/components/WorkflowNode.md` |
| User Guides | `/docs/guides/` | `docs/guides/workflow-creation.md` |
| Technical Guides | `/docs/technical/` | `docs/technical/atomic-architecture.md` |
| Research Docs | Root or `/docs/research/` | `BRIDGE_USECASES_RESEARCH.md` |
| CHANGELOG | Root | `CHANGELOG.md` |
| README | Root | `README.md` |

---

## Templates

Templates are available in `/docs/templates/` for:
- Component documentation
- User guides
- Technical guides
- Research documents
- API documentation

Use these templates for consistency.

---

## Benefits of This Rule

### For Developers
- Easier onboarding for new team members
- Faster understanding of existing code
- Less time spent figuring out how things work
- Better collaboration with clear contracts

### For Users
- Clear usage instructions
- Helpful examples
- Troubleshooting guides
- Confidence in using features

### For Maintainers
- Easier code reviews
- Better bug reports (users can reference docs)
- Simplified refactoring (understanding intent)
- Long-term maintainability

### For Project
- Professional appearance
- Easier adoption
- Higher quality contributions
- Better community engagement

---

## Exception Handling

### When Documentation Can Be Delayed

**Acceptable scenarios:**
- Experimental branches (must doc before merge to main)
- Emergency hotfixes (doc within 24 hours)
- Draft/WIP PRs (must doc before final review)

**Never acceptable:**
- Merging to main without docs
- Removing docs without replacement
- Breaking changes without migration guide
- New public APIs without docs

### How to Request Exception

1. Add `[docs-delayed]` tag to PR
2. Create tracking issue for docs
3. Link issue in PR description
4. Set deadline (max 1 week)
5. Get approval from maintainer

---

## Review Examples

### ✅ Good Documentation Update

**Code Change:**
```typescript
// Added new prop to WorkflowNode
interface WorkflowNodeProps {
  node: NodeData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onConfig: (id: string) => void;
  showLabel?: boolean; // NEW PROP
}
```

**Documentation Update:**
```typescript
/**
 * @param showLabel - Whether to display node label (default: true)
 */

// Updated API docs:
// | showLabel | boolean | No | true | Whether to display the node label text |

// Updated example:
<WorkflowNode 
  node={nodeData}
  showLabel={false} // NEW: Hide label
  ...
/>

// Updated CHANGELOG:
### Changed
- WorkflowNode now accepts optional `showLabel` prop to control label visibility
```

### ❌ Bad Documentation Update

**Code Change:**
```typescript
// Same prop added
```

**Missing Documentation:**
- No JSDoc update
- No API docs update
- No example showing new prop
- No CHANGELOG entry

**Result:** PR rejected until docs added.

---

## Tools & Resources

### Recommended Tools
- **JSDoc:** For inline documentation
- **Markdown editors:** VS Code, Typora
- **Diagram tools:** Excalidraw, draw.io
- **Screenshot tools:** Built-in OS tools, Snagit
- **Link checkers:** markdown-link-check
- **Spell checkers:** Code Spell Checker (VS Code)

### Resources
- JSDoc reference: https://jsdoc.app/
- Markdown guide: https://www.markdownguide.org/
- TypeScript docs: https://www.typescriptlang.org/docs/
- React docs: https://react.dev/
- Best practices: See CODE_QUALITY_BENCHMARK_ANALYSIS.md

---

## Conclusion

Documentation is not optional—it's a core part of code quality. By following this rule, we ensure that the LightDom project remains maintainable, professional, and accessible to all contributors and users.

**Remember:**
- Write docs as you write code
- Keep docs synchronized with code
- Make docs clear and helpful
- Review docs as carefully as code

**When in doubt, over-document rather than under-document.**

---

**Rule Effective Date:** 2025-11-15  
**Rule Version:** 1.0  
**Next Review:** 2026-02-15 (3 months)
