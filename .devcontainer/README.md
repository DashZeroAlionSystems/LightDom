# LightDom Dev Container Documentation

## Overview

The LightDom dev container provides a fully configured development environment with all necessary tools and dependencies pre-installed. This ensures consistency across development machines and simplifies onboarding.

## What's Included

### Base Image
- **Node.js 20 LTS**: Latest stable Node.js version
- **Debian Bullseye**: Stable Linux distribution
- **Python 3.11**: For tooling and scripts

### Tools & Features

#### Development Tools
- **Git**: Version control
- **GitHub CLI**: GitHub operations from terminal
- **Docker-in-Docker**: Container development support
- **PostgreSQL Client**: Database management
- **Redis Tools**: Cache management

#### Language & Runtime
- **Node.js 20**: JavaScript runtime
- **npm**: Package manager
- **TypeScript**: Type-safe JavaScript
- **tsx**: TypeScript execution

#### Blockchain Development
- **Foundry**: Ethereum development toolkit
  - Forge: Smart contract testing
  - Cast: Blockchain interaction
  - Anvil: Local Ethereum node

#### Database
- **PostgreSQL 13+**: Primary database
- **psql**: PostgreSQL CLI
- Connection pooling configured

#### Build Tools
- **Vite**: Frontend build tool
- **Hardhat**: Smart contract compilation
- **TypeScript Compiler**: Type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting

### VS Code Extensions

Pre-installed extensions:
- TypeScript support (ms-vscode.vscode-typescript-next)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Prettier formatter (esbenp.prettier-vscode)
- ESLint (ms-vscode.vscode-eslint)
- Solidity support (JuanBlanco.solidity)
- Docker support (ms-vscode.vscode-docker)
- PostgreSQL client (ms-vscode.vscode-postgresql)
- Thunder Client (API testing)
- Git Graph visualization
- GitLens
- GitHub Pull Requests

## Quick Start

### GitHub Codespaces

1. **Open in Codespace**
   - Navigate to GitHub repository
   - Click "Code" → "Codespaces" → "Create codespace on main"
   - Wait for container to build (first time ~5-10 minutes)

2. **Automatic Setup**
   - Post-create script runs automatically
   - Installs dependencies
   - Sets up database
   - Configures environment

3. **Start Development**
   ```bash
   # Everything is ready, just start:
   npm run dev
   # or
   make dev-full
   ```

### VS Code Dev Containers

1. **Prerequisites**
   - Install [VS Code](https://code.visualstudio.com/)
   - Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Install [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Open in Container**
   - Open project folder in VS Code
   - Press `F1` → "Dev Containers: Reopen in Container"
   - Wait for container to build

3. **Start Development**
   ```bash
   npm run dev
   ```

## Container Lifecycle Scripts

### Post-Create Script

Runs once after container is created:

```bash
.devcontainer/post-create.sh
```

**What it does:**
- Updates system packages
- Installs Foundry (Ethereum toolkit)
- Installs Node.js dependencies
- Installs global npm packages
- Sets up PostgreSQL database
- Creates and seeds database
- Generates environment file
- Configures Git
- Builds the application
- Runs initial tests

### Post-Start Script

Runs every time container starts:

```bash
.devcontainer/post-start.sh
```

**What it does:**
- Ensures PostgreSQL is running
- Starts Anvil blockchain if needed
- Verifies all services are running
- Displays service status and helpful information

## Port Forwarding

Automatically forwarded ports:

| Port | Service | Label |
|------|---------|-------|
| 3000 | Frontend (Vite) | Main application UI |
| 3001 | API Server | Backend REST API |
| 5432 | PostgreSQL | Database |
| 8545 | Anvil | Local blockchain |
| 8080 | Electron DevTools | Desktop app debugging |

Access forwarded ports:
- GitHub Codespaces: Ports tab → Click globe icon
- VS Code: Ports panel in terminal area

## Environment Configuration

### Default Environment Variables

Created automatically in `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=lightdom
DB_PASSWORD=lightdom123

# Blockchain
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NETWORK_ID=31337

# Application
NODE_ENV=development
PORT=3001
FRONTEND_PORT=3000

# Security
JWT_SECRET=lightdom-development-secret-key-change-in-production
ENCRYPTION_KEY=lightdom-encryption-key-32-chars

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=debug
```

### Custom Configuration

To customize environment:

1. Edit `.env` file:
   ```bash
   code .env
   ```

2. Restart services:
   ```bash
   make dev-stop
   make dev-full
   ```

## VS Code Settings

### Pre-configured Settings

Located in `.devcontainer/devcontainer.json`:

```json
{
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  }
}
```

### Customization

Add personal settings without affecting team:

1. Create `.vscode/settings.json` (gitignored)
2. Add your preferences
3. They'll override container settings

## Database Management

### Accessing PostgreSQL

```bash
# Using CLI
npm run cli db console

# Using Make
make db-console

# Direct psql
PGPASSWORD=lightdom123 psql -h localhost -U lightdom -d dom_space_harvester
```

### Common Operations

```bash
# List databases
\l

# Connect to database
\c dom_space_harvester

# List tables
\dt

# Describe table
\d table_name

# Run query
SELECT * FROM optimizations LIMIT 10;

# Quit
\q
```

### Database Reset

```bash
# Reset entire database
npm run cli db reset

# Or with Make
make db-reset
```

## Blockchain Development

### Anvil Local Network

Automatically started in post-start script:

```bash
# Check if running
curl http://localhost:8545

# Start manually if needed
npm run cli blockchain start

# Stop
npm run cli blockchain stop
```

### Default Accounts

Anvil provides 10 test accounts with 10000 ETH each:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

# ... 8 more accounts
```

### Smart Contract Development

```bash
# Compile contracts
npm run cli blockchain compile

# Test contracts
npm run cli blockchain test

# Deploy to local network
npm run cli blockchain deploy
```

## Troubleshooting

### Container Build Fails

```bash
# Rebuild container
# VS Code: F1 → "Dev Containers: Rebuild Container"

# GitHub Codespaces:
# Delete codespace and create new one
```

### PostgreSQL Not Starting

```bash
# Manual start
sudo service postgresql start

# Check status
pg_isready -h localhost -p 5432

# View logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Anvil Not Running

```bash
# Check if process exists
ps aux | grep anvil

# Kill stale process
pkill -9 anvil

# Restart
npm run cli blockchain start
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or stop all services
make dev-stop
```

### Out of Space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a

# Clean project artifacts
make clean-all
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall
npm ci
```

## Performance Optimization

### Faster Rebuilds

1. **Use Volume Mounts**: Already configured for node_modules
2. **Selective Watch**: Use `.dockerignore` to exclude unnecessary files
3. **Parallel Operations**: Multiple terminals for different services

### Memory Management

```bash
# Check memory usage
free -h

# Increase container memory in Docker Desktop
# Settings → Resources → Memory: 8GB recommended
```

### Disk Space

```bash
# Clean Docker
docker system prune -a

# Clean project
make clean-all

# Clean logs
make clean-logs
```

## Best Practices

### 1. Regular Updates

```bash
# Update dependencies
npm run cli -- update-deps

# Update dev container
# VS Code: F1 → "Dev Containers: Rebuild Container"
```

### 2. Clean Commits

```bash
# Before committing
make quality          # Lint and format
npm run cli test      # Run tests
```

### 3. Environment Isolation

- Don't commit `.env` with real credentials
- Use `.env.example` as template
- Keep secrets in GitHub Secrets for CI/CD

### 4. Resource Management

```bash
# Stop when not in use
make dev-stop

# Clean periodically
make clean-cache
```

## Advanced Configuration

### Custom Dev Container Features

Add features in `devcontainer.json`:

```json
{
  "features": {
    "ghcr.io/devcontainers/features/aws-cli:1": {},
    "ghcr.io/devcontainers/features/terraform:1": {}
  }
}
```

### Custom Scripts

Add custom setup in `.devcontainer/scripts/`:

```bash
#!/bin/bash
# .devcontainer/scripts/custom-setup.sh

# Your custom setup logic
echo "Running custom setup..."
```

Reference in `post-create.sh`:

```bash
bash .devcontainer/scripts/custom-setup.sh
```

### Environment-Specific Settings

Create environment variants:

```
.devcontainer/
├── devcontainer.json          # Default
├── devcontainer.staging.json  # Staging
└── devcontainer.prod.json     # Production
```

## Integration with CI/CD

### GitHub Actions

The dev container configuration ensures CI/CD mirrors local development:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
```

### Pre-commit Hooks

Setup automated checks:

```bash
# Install Husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "make quality"
```

## Additional Resources

- [Dev Containers Documentation](https://containers.dev/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces](https://github.com/features/codespaces)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Foundry Book](https://book.getfoundry.sh/)

## Support

For issues with the dev container:

1. Check this documentation
2. Review [Troubleshooting](#troubleshooting) section
3. Check GitHub repository issues
4. Create new issue with:
   - Container platform (Codespaces/Local)
   - Error messages
   - Steps to reproduce

---

**Maintained by**: LightDom Development Team  
**Last Updated**: Auto-generated based on container configuration

Keep this documentation updated as the dev container configuration evolves.
