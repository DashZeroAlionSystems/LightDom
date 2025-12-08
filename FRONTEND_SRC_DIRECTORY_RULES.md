# Frontend and Source Directory Rules

## Directory Structure

### Primary Development: `src/` Directory
- **Purpose**: Main development directory with TypeScript support, Vite config, and full tooling
- **Contains**: All React components, services, utilities, tests
- **Build System**: Vite + TypeScript + Ant Design
- **Hot Reload**: Full HMR support
- **Import Aliases**: `@/` prefix configured in vite.config.ts

### Production Frontend: `frontend/` Directory  
- **Purpose**: Production-ready, deployed frontend code
- **Source**: Copy from `src/` after testing and validation
- **Build Output**: Optimized, minified, production builds
- **Deployment**: Served via Nginx/Express in production

## File Organization Rules

### Rule 1: Develop in `src/`, Deploy to `frontend/`

**Development Workflow:**
```bash
# 1. Develop in src/
src/components/MyComponent.tsx

# 2. Test locally
npm run dev

# 3. Build
npm run build

# 4. Copy to frontend when stable
cp -r src/components/MyComponent.tsx frontend/src/components/
```

### Rule 2: Component Structure

**src/ Structure (Development):**
```
src/
├── components/         # React components
│   ├── atoms/         # Basic UI elements
│   ├── molecules/     # Composite components
│   ├── organisms/     # Complex components
│   └── templates/     # Page templates
├── services/          # API services
├── hooks/             # Custom React hooks
├── contexts/          # React contexts
├── utils/             # Utilities
├── types/             # TypeScript types
└── stories/           # Storybook stories
```

**frontend/ Structure (Production):**
```
frontend/
├── index.html         # Entry HTML
├── vite.config.ts     # Production Vite config
├── package.json       # Production dependencies
└── src/               # Copied from src/ when stable
    └── (mirror of src/ directory)
```

### Rule 3: Configuration Sync

**Maintain separate configs:**
- `vite.config.ts` - Root level (development)
- `frontend/vite.config.ts` - Frontend level (production)
- `tsconfig.json` - Shared TypeScript config
- `package.json` - Keep dependencies in sync

### Rule 4: Copy Strategy

**What to Copy:**
✅ Tested components
✅ Validated services
✅ Production-ready utilities
✅ Finalized types

**What NOT to Copy:**
❌ Test files (*.test.tsx, *.spec.ts)
❌ Story files (*.stories.tsx)
❌ Development utilities
❌ Experimental features

### Rule 5: Gradual Migration

**Copy one feature at a time:**
1. Develop and test in `src/`
2. Run full test suite
3. Build and verify
4. Copy to `frontend/src/`
5. Test in production mode
6. Deploy

## Vite Config Strategy

### Development (Root vite.config.ts)
```typescript
// Full dev features
export default defineConfig({
  plugins: [react(), storybook()],
  resolve: {
    alias: { '@': '/src' }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
```

### Production (frontend/vite.config.ts)
```typescript
// Optimized for production
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false
  },
  resolve: {
    alias: { '@': '/src' }
  }
});
```

## Copy Commands

### Manual Copy (Safe)
```bash
# Copy specific component
cp -r src/components/MyComponent.tsx frontend/src/components/

# Copy entire category
cp -r src/components/atoms/* frontend/src/components/atoms/

# Copy service
cp services/my-service.js frontend/services/
```

### Automated Copy Script
```bash
# Create sync script
cat > scripts/sync-to-frontend.sh << 'EOF'
#!/bin/bash
# Sync validated components to frontend

# Copy components (exclude stories and tests)
rsync -av --exclude='*.stories.tsx' --exclude='*.test.tsx' \
  src/components/ frontend/src/components/

# Copy services (validated only)
rsync -av services/ frontend/services/

echo "Sync complete"
EOF

chmod +x scripts/sync-to-frontend.sh
```

## Best Practices

### 1. Version Control
- Keep `src/` and `frontend/` in sync via Git tags
- Tag stable releases: `git tag -a v1.0.0-stable`
- Document what's copied in CHANGELOG

### 2. Testing Before Copy
```bash
# Test in src/
npm run test
npm run build
npm run storybook

# Only copy if all pass
./scripts/sync-to-frontend.sh
```

### 3. Configuration Management
- Use environment variables for API URLs
- Maintain separate `.env` files:
  - `.env.development` - src/ development
  - `.env.production` - frontend/ production

### 4. Import Consistency
```typescript
// Always use @ alias
import { Button } from '@/components/atoms/Button';
// NOT: import { Button } from '../../components/atoms/Button';
```

## Migration Checklist

When copying from `src/` to `frontend/`:

- [ ] Component fully tested
- [ ] No console.log or debug code
- [ ] TypeScript types complete
- [ ] Storybook stories created (but not copied)
- [ ] Documentation updated
- [ ] Build succeeds without errors
- [ ] No development dependencies used
- [ ] Environment variables externalized
- [ ] API endpoints use env vars
- [ ] Production optimizations applied

## Troubleshooting

### Issue: Import paths break after copy
**Solution**: Ensure both vite configs have same alias configuration

### Issue: Different behavior in frontend/
**Solution**: Check for hardcoded localhost URLs, use env vars

### Issue: Build fails in frontend/
**Solution**: Verify all dependencies in frontend/package.json

### Issue: Components look different
**Solution**: Ensure CSS/theme files are copied and imported

## Summary

**Development Flow:**
`src/` → develop → test → build → validate → copy to `frontend/` → deploy

**Key Principle:** 
`src/` is the source of truth during development. `frontend/` is production-ready mirror of stable code.

**DO NOT:**
- Develop directly in `frontend/`
- Copy untested code
- Break working production code
- Mix configurations

**DO:**
- Test thoroughly in `src/` first
- Copy incrementally
- Keep configs in sync
- Document what's been copied
- Version control properly
