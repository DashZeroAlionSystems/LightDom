# GitHub Copilot Instructions for LightDom

## Project Overview

LightDom is a blockchain-based DOM optimization platform that combines React/TypeScript frontend, Solidity smart contracts, Node.js backend, and Electron desktop capabilities.

## Quick Context

When assisting with LightDom, consider:

- **Tech Stack**: React 19 + TypeScript + Vite, Node.js + Express, PostgreSQL, Solidity 0.8.19, Hardhat, TailwindCSS
- **Architecture**: Microservices with blockchain integration, web crawler, optimization engine
- **Coding Standards**: TypeScript strict mode, functional React components, ESLint/Prettier configured

## Code Generation Guidelines

### TypeScript/JavaScript

```typescript
// Prefer modern async/await patterns
async function optimizeDOM(url: string): Promise<OptimizationResult> {
  try {
    const analysis = await analyzeDOMStructure(url);
    return await calculateOptimizations(analysis);
  } catch (error) {
    logger.error('DOM optimization failed', { url, error });
    throw new OptimizationError('Failed to optimize DOM', { cause: error });
  }
}

// Use proper types, avoid 'any'
interface OptimizationResult {
  spaceSaved: number;
  suggestions: string[];
  performance: PerformanceMetrics;
}

// Use optional chaining and nullish coalescing
const tokenAmount = optimization?.rewards?.amount ?? 0;
```

### React Components

```tsx
// Functional components with TypeScript
interface DashboardProps {
  userId: string;
  onOptimize: (result: OptimizationResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, onOptimize }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);

  // Use custom hooks for logic separation
  const { optimize } = useOptimization();

  // Proper error handling
  const handleOptimize = useCallback(async () => {
    try {
      setLoading(true);
      const result = await optimize(userId);
      setResults(prev => [...prev, result]);
      onOptimize(result);
    } catch (error) {
      toast.error('Optimization failed');
      logger.error('Optimization error', { userId, error });
    } finally {
      setLoading(false);
    }
  }, [userId, optimize, onOptimize]);

  return (
    <div className="dashboard-container">
      <Button onClick={handleOptimize} disabled={loading}>
        {loading ? 'Optimizing...' : 'Start Optimization'}
      </Button>
      {/* Component JSX */}
    </div>
  );
};
```

### Solidity Smart Contracts

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title DOMSpaceToken
/// @notice Token for rewarding DOM optimization
/// @dev Implements ERC20 with access control
contract DOMSpaceToken is ERC20, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    /// @notice Emitted when tokens are minted for optimization
    /// @param to Address receiving tokens
    /// @param amount Amount minted
    /// @param optimizationId Reference to optimization
    event OptimizationReward(
        address indexed to,
        uint256 amount,
        bytes32 indexed optimizationId
    );

    constructor() ERC20("DOM Space Harvester", "DSH") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Mint tokens as reward for optimization
    /// @param to Recipient address
    /// @param amount Token amount
    /// @param optimizationId Optimization reference
    function rewardOptimization(
        address to,
        uint256 amount,
        bytes32 optimizationId
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Invalid amount");
        
        _mint(to, amount);
        emit OptimizationReward(to, amount, optimizationId);
    }
}
```

### API Development

```typescript
// Express API with proper validation and error handling
import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const OptimizationSchema = z.object({
  url: z.string().url(),
  options: z.object({
    threshold: z.number().min(0).max(100).optional(),
  }).optional(),
});

router.post('/api/optimization/submit', 
  authenticate,
  validateRequest(OptimizationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url, options } = req.body;
      const userId = req.user.id;

      const result = await optimizationService.optimize({
        url,
        userId,
        options,
      });

      logger.info('Optimization completed', { 
        userId, 
        url, 
        spaceSaved: result.spaceSaved 
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);
```

## Common Patterns

### Error Handling

```typescript
// Custom error classes
export class OptimizationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'OptimizationError';
  }
}

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof OptimizationError) {
    return res.status(400).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    });
  }

  logger.error('Unhandled error', { error });
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
};
```

### Database Operations

```typescript
// Use parameterized queries
export async function saveOptimization(data: OptimizationData): Promise<void> {
  const query = `
    INSERT INTO optimizations (user_id, url, space_saved, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  
  const values = [data.userId, data.url, data.spaceSaved, new Date()];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    logger.error('Database error', { error, data });
    throw new DatabaseError('Failed to save optimization');
  }
}
```

### State Management

```typescript
// Custom hooks for state management
export function useOptimization() {
  const [state, setState] = useState<OptimizationState>({
    loading: false,
    results: [],
    error: null,
  });

  const optimize = useCallback(async (url: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await api.optimize(url);
      setState(prev => ({
        ...prev,
        loading: false,
        results: [...prev.results, result],
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  return { ...state, optimize };
}
```

## Testing Patterns

```typescript
// Unit tests with Vitest
describe('OptimizationService', () => {
  let service: OptimizationService;
  let mockCrawler: jest.Mocked<WebCrawler>;

  beforeEach(() => {
    mockCrawler = {
      analyze: jest.fn(),
    } as any;
    service = new OptimizationService(mockCrawler);
  });

  it('should calculate space savings correctly', async () => {
    mockCrawler.analyze.mockResolvedValue({
      totalSpace: 1000,
      unusedSpace: 300,
    });

    const result = await service.optimize('https://example.com');

    expect(result.spaceSaved).toBe(300);
    expect(mockCrawler.analyze).toHaveBeenCalledWith('https://example.com');
  });

  it('should handle errors gracefully', async () => {
    mockCrawler.analyze.mockRejectedValue(new Error('Network error'));

    await expect(service.optimize('https://example.com'))
      .rejects
      .toThrow(OptimizationError);
  });
});
```

## Project-Specific Conventions

### File Organization

```
src/
├── components/        # React components (PascalCase)
├── core/             # Business logic (PascalCase)
├── api/              # API endpoints (camelCase)
├── utils/            # Utility functions (camelCase)
├── types/            # TypeScript types and interfaces
├── hooks/            # Custom React hooks (use prefix)
└── tests/            # Test files (.test.ts)
```

### Naming Conventions

- **Components**: PascalCase (`OptimizationDashboard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useOptimization.ts`)
- **Utilities**: camelCase (`calculateSpaceSavings.ts`)
- **Types**: PascalCase (`OptimizationResult.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_OPTIMIZATION_THRESHOLD`)

### Import Order

```typescript
// 1. External dependencies
import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';

// 2. Internal modules
import { OptimizationService } from '@/core/OptimizationService';
import { useAuth } from '@/hooks/useAuth';

// 3. Types
import type { OptimizationResult } from '@/types';

// 4. Styles
import './Dashboard.css';
```

## Security Considerations

```typescript
// Input validation
import { z } from 'zod';

const sanitizeUrl = (url: string): string => {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Invalid protocol');
  }
  return parsed.toString();
};

// Environment variables
const config = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  // Never commit secrets
};

// SQL injection prevention
const query = 'SELECT * FROM users WHERE id = $1';
const result = await pool.query(query, [userId]);

// XSS prevention (React handles this automatically)
<div>{userInput}</div> // Safe with React

// Use helmet for Express
import helmet from 'helmet';
app.use(helmet());
```

## Performance Optimization

```typescript
// Memoization
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  const processedData = useMemo(() => processData(data), [data]);
  
  const handleClick = useCallback(() => {
    // Handler logic
  }, [/* dependencies */]);

  return <div>{/* Component JSX */}</div>;
});

// Code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));

// Database query optimization
const query = `
  SELECT o.*, u.username 
  FROM optimizations o
  JOIN users u ON o.user_id = u.id
  WHERE o.created_at > $1
  ORDER BY o.created_at DESC
  LIMIT 100
`;
```

## Environment Setup

```bash
# Required environment variables
DATABASE_URL=postgresql://user:pass@localhost:5432/lightdom
ETHEREUM_RPC_URL=http://localhost:8545
ADMIN_PRIVATE_KEY=0x...
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## Common Commands

```bash
# Development
npm run dev              # Start frontend
npm run api              # Start API server
npm run start            # Start complete system

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:coverage    # Coverage report

# Building
npm run build            # Build frontend
npm run type-check       # TypeScript check

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier

# Blockchain
npx hardhat compile      # Compile contracts
npx hardhat test         # Test contracts
npx hardhat node         # Start local node
```

## Tips for Effective Code Generation

1. **Context Awareness**: Consider the full project structure
2. **Type Safety**: Always provide proper TypeScript types
3. **Error Handling**: Include try-catch and proper error messages
4. **Testing**: Generate tests alongside implementation
5. **Documentation**: Add JSDoc comments for complex functions
6. **Security**: Validate inputs and sanitize outputs
7. **Performance**: Consider memoization and lazy loading
8. **Accessibility**: Include ARIA labels for UI components

## Resources

- [Project README](../README.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [Cursor Rules](../.cursorrules)
- [API Documentation](../docs/api/)
- [Testing Guide](../docs/testing/)

---

**Note**: These instructions help GitHub Copilot provide contextually relevant code suggestions. For more detailed project guidelines, refer to `.cursorrules` and project documentation.
