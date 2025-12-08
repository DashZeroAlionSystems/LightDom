# Frontend Structure Guide

## Directory Structure

LightDom has a dual-source structure to support both shared ML/AI components and frontend-specific code:

```
LightDom/
├── src/                          # Shared ML/AI components (root level)
│   ├── ml/                       # Machine Learning models
│   │   ├── UIUXNeuralNetwork.ts
│   │   ├── CodeBERTIntegration.ts
│   │   ├── CodeT5Integration.ts
│   │   ├── ViTIntegration.ts
│   │   ├── ProjectManagementOrchestrator.ts
│   │   ├── CodebaseIndexer.ts
│   │   ├── OllamaCodebaseIntegration.ts
│   │   └── ModelCatalogMiner.ts
│   ├── database/                 # Database access layer
│   │   └── DatabaseAccessLayer.ts
│   ├── crawler/                  # Enterprise crawler
│   │   └── EnterpriseCrawler.ts
│   ├── design-system/            # Design tokens and atomic components
│   ├── components/               # Shared UI components
│   │   ├── neural/               # Neural network visualizations
│   │   ├── vscode/               # VSCode computer use components
│   │   └── admin/                # Admin dashboard components
│   ├── rag/                      # RAG system
│   └── stories/                  # Storybook stories
│
└── frontend/                     # Real frontend application
    ├── src/                      # Frontend-specific code
    │   ├── components/           # Frontend UI components
    │   ├── pages/                # Frontend pages
    │   ├── hooks/                # React hooks
    │   ├── utils/                # Frontend utilities
    │   ├── services/             # API services
    │   └── App.tsx               # Main app component
    ├── vite.config.ts            # Frontend build config
    └── tsconfig.json             # Frontend TypeScript config
```

## Path Aliases Configuration

### In Frontend (`frontend/vite.config.ts` and `frontend/tsconfig.json`)

The frontend can access both its own `src/` and the root `src/` folder:

```typescript
// Import from frontend/src/
import Button from '@/components/Button';
import useFetch from '@/hooks/useFetch';

// Import from root src/ (shared ML/AI)
import { UIUXNeuralNetwork } from '@/ml/UIUXNeuralNetwork';
import { CodebaseIndexer } from '@/ml/CodebaseIndexer';
import { DatabaseAccessLayer } from '@/database/DatabaseAccessLayer';
import { VSCodeComputerUse } from '@/vscode/VSCodeComputerUse';
```

### Path Aliases

**Frontend-specific paths** (from `frontend/src/`):
- `@/*` → `frontend/src/*`
- `@/components/*` → `frontend/src/components/*`
- `@/pages/*` → `frontend/src/pages/*`
- `@/hooks/*` → `frontend/src/hooks/*`
- `@/utils/*` → `frontend/src/utils/*`
- `@/services/*` → `frontend/src/services/*`

**Shared ML/AI paths** (from root `src/`):
- `@/ml/*` → `src/ml/*` - Machine learning models
- `@/database/*` → `src/database/*` - Database access layer
- `@/crawler/*` → `src/crawler/*` - Enterprise crawler
- `@/design-system/*` → `src/design-system/*` - Design tokens
- `@/neural/*` → `src/neural/*` - Neural network components
- `@/rag/*` → `src/rag/*` - RAG system
- `@/vscode/*` → `src/components/vscode/*` - VSCode components
- `@/admin/*` → `src/components/admin/*` - Admin components
- `@/stories/*` → `src/stories/*` - Storybook stories

## Usage Examples

### Example 1: Using ML Models in Frontend

```typescript
// frontend/src/pages/MLDashboard.tsx
import React, { useState, useEffect } from 'react';
import { UIUXNeuralNetwork } from '@/ml/UIUXNeuralNetwork';
import { CodebaseIndexer } from '@/ml/CodebaseIndexer';
import { ProjectManagementOrchestrator } from '@/ml/ProjectManagementOrchestrator';

const MLDashboard = () => {
  const [network, setNetwork] = useState<UIUXNeuralNetwork | null>(null);

  useEffect(() => {
    const initML = async () => {
      const nn = new UIUXNeuralNetwork();
      await nn.initializeModel();
      setNetwork(nn);
    };
    initML();
  }, []);

  return (
    <div>
      <h1>ML Dashboard</h1>
      {network && <p>Neural network initialized</p>}
    </div>
  );
};

export default MLDashboard;
```

### Example 2: Using Database in Frontend

```typescript
// frontend/src/services/dataService.ts
import { getDatabase } from '@/database/DatabaseAccessLayer';

export const fetchTrainingData = async () => {
  const db = getDatabase();
  await db.initialize();
  
  const data = await db.select('nn_training_data', {
    limit: 100,
    orderBy: 'created_at DESC',
  });
  
  return data;
};
```

### Example 3: Using VSCode Component in Frontend

```typescript
// frontend/src/pages/IDEControl.tsx
import React from 'react';
import VSCodeComputerUse from '@/vscode/VSCodeComputerUse';

const IDEControl = () => {
  return (
    <div>
      <h1>IDE Control Panel</h1>
      <VSCodeComputerUse
        mode="real"
        onFileCreated={(result) => console.log('File created:', result)}
      />
    </div>
  );
};

export default IDEControl;
```

### Example 4: Using Admin Dashboard Components

```typescript
// frontend/src/pages/Admin.tsx
import React from 'react';
import NeuralNetworkAdminPanel from '@/admin/NeuralNetworkAdminPanel';

const AdminPage = () => {
  return (
    <div>
      <NeuralNetworkAdminPanel />
    </div>
  );
};

export default AdminPage;
```

## Development Workflow

### 1. Develop Shared ML/AI Components

Create new ML/AI components in the root `src/` folder:

```bash
# Create new ML model
touch src/ml/MyNewModel.ts

# Create tests
touch src/ml/__tests__/MyNewModel.test.ts
```

### 2. Use in Frontend

Import and use in the frontend:

```typescript
// frontend/src/pages/MyPage.tsx
import { MyNewModel } from '@/ml/MyNewModel';
```

### 3. Build and Run

```bash
# Development (frontend only)
npm run dev

# Development (full stack)
npm run dev:complete

# Build frontend
cd frontend && npm run build

# Build all
npm run build
```

## Storybook Integration

Storybook uses the root `src/` folder for stories:

```bash
# Run Storybook
npm run storybook

# Stories are in: src/stories/
# View at: http://localhost:6006
```

Access stories:
- **Neural Network**: AI / UIUXTrainingDashboard
- **VSCode**: AI / VSCode Computer Use
- **Atomic Components**: Design System / Atomic Components

## TypeScript Configuration

### Frontend TypeScript (`frontend/tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/ml/*": ["../src/ml/*"],
      "@/database/*": ["../src/database/*"],
      // ... other paths
    }
  }
}
```

### Root TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/ml/*": ["src/ml/*"],
      // ... other paths
    }
  }
}
```

## Build Process

### Frontend Build

The frontend build process:

1. Vite resolves `@/ml/*` → `../src/ml/*`
2. TypeScript compiles with path aliases
3. Output to `frontend/dist/`

### Components Available in Frontend

All components from root `src/` are available:

- ✅ **ML Models**: CodeBERT, CodeT5, ViT, Neural Networks
- ✅ **Database**: DatabaseAccessLayer
- ✅ **Crawler**: EnterpriseCrawler
- ✅ **Design System**: Tokens, Atomic Components
- ✅ **Admin**: NeuralNetworkAdminPanel
- ✅ **VSCode**: VSCodeComputerUse
- ✅ **Visualizations**: NeuralNetworkVisualizer
- ✅ **RAG**: RAG system components

## Best Practices

### 1. Keep ML/AI Logic in Root `src/`

```typescript
// ✅ Good: ML logic in root src/
// src/ml/MyMLModel.ts
export class MyMLModel {
  async train() { /* ... */ }
}

// ✅ Good: Frontend uses it
// frontend/src/pages/MLPage.tsx
import { MyMLModel } from '@/ml/MyMLModel';
```

### 2. Keep UI-Specific Logic in Frontend `src/`

```typescript
// ✅ Good: UI logic in frontend/src/
// frontend/src/hooks/useMLModel.ts
import { MyMLModel } from '@/ml/MyMLModel';

export const useMLModel = () => {
  // React-specific logic
};
```

### 3. Share Components Via Root `src/components/`

```typescript
// ✅ Good: Shared component
// src/components/neural/NetworkVisualization.tsx
export const NetworkVisualization = () => { /* ... */ };

// ✅ Good: Use in frontend
// frontend/src/pages/Dashboard.tsx
import { NetworkVisualization } from '@/neural/NetworkVisualization';
```

## Troubleshooting

### Path Resolution Issues

If you see import errors:

1. Check `vite.config.ts` alias configuration
2. Check `tsconfig.json` paths configuration
3. Restart TypeScript server in VS Code
4. Clear build cache: `rm -rf node_modules/.vite`

### Build Errors

```bash
# Clear caches
rm -rf dist frontend/dist node_modules/.vite

# Reinstall
npm install

# Rebuild
npm run build
```

### TypeScript Errors

```bash
# Check configuration
npx tsc --showConfig

# Validate paths
npx tsc --noEmit
```

## Summary

- **Root `src/`**: Shared ML/AI components, models, database, crawler
- **Frontend `src/`**: Frontend-specific UI, pages, hooks, services
- **Path aliases**: Configured in both vite.config.ts and tsconfig.json
- **Access**: Frontend can import from both locations using `@/` aliases
- **Build**: Vite resolves paths correctly for production builds

This structure allows you to:
- ✅ Develop ML/AI components once
- ✅ Use them across frontend, backend, and Storybook
- ✅ Maintain clean separation of concerns
- ✅ Share code without duplication
- ✅ Build efficiently with proper tree-shaking
