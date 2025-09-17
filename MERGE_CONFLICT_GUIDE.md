# Merge Conflict Handling with Copilot Agent

This document describes how to use the Copilot Agent system to automatically detect and resolve merge conflicts in your repository.

## Overview

The Merge Conflict Agent is an intelligent system that can:
- **Detect** merge conflicts automatically
- **Analyze** conflict patterns and types
- **Resolve** conflicts using AI-assisted strategies
- **Validate** resolutions through automated testing
- **Report** on conflict resolution activities

## Quick Start

### Basic Commands

```bash
# Detect merge conflicts
node scripts/agent-runner.js merge-conflicts detect

# Analyze conflicts in a specific file
node scripts/agent-runner.js merge-conflicts analyze path/to/conflicted-file.js

# Automatically resolve conflicts where possible
node scripts/agent-runner.js merge-conflicts resolve

# Generate a detailed report
node scripts/agent-runner.js merge-conflicts report
```

### Using the Workflow

You can also trigger the complete merge conflict resolution workflow:

```bash
node scripts/agent-runner.js workflow MergeConflictWorkflow
```

## Features

### 1. Conflict Detection

The system automatically detects merge conflicts by analyzing git status and identifying files with conflict markers:

- `<<<<<<< HEAD` (current branch changes)
- `=======` (separator)
- `>>>>>>> branch-name` (incoming branch changes)

### 2. Conflict Analysis

For each conflict, the system analyzes:

- **Conflict Type**: Import conflicts, function conflicts, variable conflicts, or content modifications
- **Resolution Strategy**: How the conflict should be handled
- **Confidence Level**: How confident the system is in its automatic resolution

### 3. Automatic Resolution

The system can automatically resolve certain types of conflicts:

#### High Confidence (Auto-resolvable):
- **Import Conflicts** (90% confidence): Merges import statements, removing duplicates
- **Simple Additions** (80% confidence): Accepts new code additions
- **Function Conflicts** (60% confidence): Uses intelligent merging based on code length and complexity

#### Manual Review Required:
- **Variable Conflicts**: Complex variable declarations that may conflict
- **Content Modifications**: Significant changes to existing code logic
- **Low Confidence Resolutions**: Any conflict with confidence < 70%

### 4. Validation

After automatic resolution, the system validates changes by:
- Running unit tests
- Checking code formatting (linting)
- Verifying build integrity

## Configuration

### Agent Configuration

The Merge Conflict Agent is configured in `.cursor/agents.json`:

```json
{
  "name": "Merge Conflict Agent",
  "description": "Automatically detects and resolves merge conflicts using AI-assisted strategies",
  "triggers": [
    "onMergeConflict",
    "onPullRequest",
    "onManualTrigger"
  ],
  "tasks": [
    "detectMergeConflicts",
    "analyzeMergeConflicts", 
    "resolveMergeConflicts",
    "validateResolution",
    "generateConflictReport"
  ],
  "config": {
    "autoResolve": {
      "enabled": true,
      "confidenceThreshold": 0.7,
      "maxFilesAutoResolve": 10
    },
    "conflictTypes": {
      "import_conflicts": {
        "strategy": "merge_imports",
        "autoResolve": true
      },
      "function_conflicts": {
        "strategy": "intelligent_merge", 
        "autoResolve": true
      },
      "variable_conflicts": {
        "strategy": "rename_and_merge",
        "autoResolve": false
      },
      "content_modifications": {
        "strategy": "manual_review",
        "autoResolve": false
      }
    }
  }
}
```

### Workflow Configuration

The complete workflow is defined in `.cursor/workflows.json`:

```json
{
  "name": "MergeConflictWorkflow",
  "description": "Automated workflow to detect and resolve merge conflicts",
  "phases": [
    {
      "name": "Detection",
      "tasks": ["detectMergeConflicts"]
    },
    {
      "name": "Analysis", 
      "tasks": ["analyzeMergeConflicts"]
    },
    {
      "name": "Resolution",
      "tasks": ["resolveMergeConflicts"]
    },
    {
      "name": "Validation",
      "tasks": ["validateResolution", "runUnitTests", "runLinting"]
    },
    {
      "name": "Reporting",
      "tasks": ["generateConflictReport"]
    }
  ]
}
```

## Resolution Strategies

### 1. Merge Imports Strategy
Automatically merges import statements from both branches:

```javascript
// Before (conflict):
<<<<<<< HEAD
import { Button } from './components/Button';
import { Modal } from './components/Modal';
=======
import { Card } from './components/Card';
import { Dialog } from './components/Dialog';
>>>>>>> feature-branch

// After (resolved):
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { Card } from './components/Card';
import { Dialog } from './components/Dialog';
```

### 2. Intelligent Merge Strategy
For function conflicts, chooses the version with more comprehensive implementation:

```javascript
// Chooses the version with more lines/complexity
// Useful for functions where one branch has more complete implementation
```

### 3. Rename and Merge Strategy
For variable conflicts, preserves both versions with clear commenting:

```javascript
// From current branch (main)
const originalVariable = 'value1';

// From incoming branch (feature-branch)  
const newVariable = 'value2';
```

### 4. Manual Review Strategy
For complex content modifications, the system marks files for manual review and provides detailed analysis to help developers resolve conflicts manually.

## Best Practices

### 1. Regular Conflict Detection
Run conflict detection regularly during development:

```bash
# Add to pre-commit hooks
node scripts/agent-runner.js merge-conflicts detect
```

### 2. Review Automatic Resolutions
Always review automatically resolved conflicts:

```bash
# Check what was resolved
git diff --cached

# Run tests after resolution
npm test
```

### 3. Use Reports for Analysis
Generate reports to understand conflict patterns:

```bash
node scripts/agent-runner.js merge-conflicts report
```

### 4. Customize Confidence Thresholds
Adjust the confidence threshold based on your team's preferences:

```json
{
  "autoResolve": {
    "confidenceThreshold": 0.8  // Higher = more conservative
  }
}
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Merge Conflict Resolution
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  resolve-conflicts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Detect and resolve conflicts
        run: |
          node scripts/agent-runner.js merge-conflicts detect
          node scripts/agent-runner.js merge-conflicts resolve
      - name: Validate resolution
        run: |
          npm test
          npm run lint
      - name: Generate report
        run: node scripts/agent-runner.js merge-conflicts report
```

## Troubleshooting

### Common Issues

1. **"No merge conflicts detected" but conflicts exist**
   - Ensure you're in a git repository
   - Check if files are properly staged for merge
   - Verify conflict markers are present in files

2. **Automatic resolution failed**
   - Check the confidence threshold settings
   - Review the specific conflict types that failed
   - Use manual resolution for complex conflicts

3. **Tests fail after resolution**
   - The system validates resolutions automatically
   - Failed tests indicate the resolution may need manual review
   - Check the generated report for details

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
DEBUG=* node scripts/agent-runner.js merge-conflicts resolve
```

## Advanced Usage

### Custom Resolution Strategies

You can extend the system with custom resolution strategies by modifying the `AgentRunner` class:

```javascript
// Add custom strategy
determineConflictType(conflict) {
  // Your custom logic here
  if (conflict.currentContent.includes('your-pattern')) {
    return 'custom_conflict_type';
  }
  // ... existing logic
}
```

### Integration with External Tools

The system can be integrated with external merge tools:

```bash
# Use with your preferred merge tool
git mergetool
node scripts/agent-runner.js merge-conflicts resolve
```

## API Reference

### Main Methods

- `detectMergeConflicts()`: Detect conflicts in repository
- `analyzeConflicts(files)`: Analyze specific conflict files  
- `parseConflictMarkers(content, fileName)`: Parse conflict markers in content
- `generateResolutionSuggestions(fileName, conflicts)`: Generate resolution strategies
- `applyAutomaticResolutions(conflictDetails)`: Apply automatic resolutions
- `generateMergeConflictReport()`: Generate detailed report

### Configuration Options

- `confidenceThreshold`: Minimum confidence for automatic resolution (0.0-1.0)
- `maxFilesAutoResolve`: Maximum number of files to auto-resolve in one operation
- `conflictTypes`: Configuration for different conflict type handling strategies

## Contributing

To contribute to the merge conflict handling system:

1. Add new conflict detection patterns in `determineConflictType()`
2. Implement new resolution strategies in `generateResolution()`
3. Add tests in `test-merge-conflicts.js`
4. Update documentation

## Support

For issues or questions about merge conflict handling:

1. Check this documentation
2. Review the generated conflict reports
3. Enable debug logging for detailed information
4. Open an issue with reproduction steps