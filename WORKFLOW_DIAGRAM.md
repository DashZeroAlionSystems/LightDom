# LightDom Workflow Architecture

This document provides a visual overview of the workflow automation architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     LightDom Platform                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Frontend  │  │     API     │  │  Blockchain │             │
│  │   React 19  │◄─┤   Express   │◄─┤    Anvil    │             │
│  │    Vite     │  │  Node.js    │  │   Foundry   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                 │                 │                    │
│         └────────┬────────┴────────┬────────┘                    │
│                  │                 │                             │
│         ┌────────▼─────┐  ┌───────▼────────┐                    │
│         │  PostgreSQL  │  │   Smart        │                    │
│         │   Database   │  │   Contracts    │                    │
│         └──────────────┘  └────────────────┘                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Automation Tools

```
┌─────────────────────────────────────────────────────────────────┐
│                   Automation Interface                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │   CLI Tool       │         │    Makefile      │             │
│  │   (cli.js)       │         │   (60+ cmds)     │             │
│  ├──────────────────┤         ├──────────────────┤             │
│  │ • dev            │         │ • make dev       │             │
│  │ • build          │         │ • make test      │             │
│  │ • test           │         │ • make build     │             │
│  │ • db             │         │ • make quality   │             │
│  │ • blockchain     │         │ • make deploy    │             │
│  │ • docker         │         │ • ...            │             │
│  │ • quality        │         │                  │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                            │                        │
│           └────────────┬───────────────┘                        │
│                        │                                        │
│              ┌─────────▼──────────┐                             │
│              │  npm/yarn scripts  │                             │
│              └────────────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Development Flow                              │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Developer   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Dev Setup   │
    │  (Container) │
    └──────┬───────┘
           │
           ├─────────► make quick-start / npm run cli setup
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  Services Start                          │
    ├──────────────────────────────────────────┤
    │  • PostgreSQL (5432)                     │
    │  • Anvil Blockchain (8545)               │
    │  • API Server (3001)                     │
    │  • Frontend Dev Server (3000)            │
    └──────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Code Changes │
    └──────┬───────┘
           │
           ├─────────► Hot Reload (Vite)
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  Quality Checks                          │
    ├──────────────────────────────────────────┤
    │  • ESLint (make lint)                    │
    │  • Prettier (make format)                │
    │  • TypeScript (make type-check)          │
    │  • Tests (make test)                     │
    └──────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │  Commit      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Push & PR   │
    └──────────────┘
```

## AI Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Integration                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐         ┌────────────────────┐          │
│  │  GitHub Copilot    │         │    Cursor AI       │          │
│  ├────────────────────┤         ├────────────────────┤          │
│  │ • Code completion  │         │ • Chat interface   │          │
│  │ • Inline suggests  │         │ • Composer mode    │          │
│  │ • Context aware    │         │ • Workflows        │          │
│  └─────────┬──────────┘         └──────────┬─────────┘          │
│            │                               │                     │
│            └───────────┬───────────────────┘                     │
│                        │                                         │
│                        ▼                                         │
│          ┌─────────────────────────┐                             │
│          │  Project Context        │                             │
│          ├─────────────────────────┤                             │
│          │ • .cursorrules          │                             │
│          │ • COPILOT_INSTRUCTIONS  │                             │
│          │ • CURSOR_INSTRUCTIONS   │                             │
│          │ • workflows.json        │                             │
│          │ • tasks.json            │                             │
│          └─────────────────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline                               │
└─────────────────────────────────────────────────────────────────┘

    Git Push
       │
       ▼
┌─────────────────┐
│  GitHub Actions │
├─────────────────┤
│ • ci-cd.yml     │
│ • test.yml      │
│ • auto-merge    │
└────────┬────────┘
         │
         ├──────► Lint & Format Check
         │
         ├──────► Type Check
         │
         ├──────► Security Scan
         │
         ├──────► Run Tests
         │          │
         │          ├──► Unit Tests
         │          ├──► Integration Tests
         │          └──► E2E Tests
         │
         ├──────► Build Application
         │
         ├──────► Code Coverage Check
         │
         └──────► Deploy
                    │
                    ├──► Staging
                    │
                    └──► Production (manual approval)
```

## Dev Container Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dev Container                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Base Image: Node 20 + Python 3.11 + Debian              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Features                                                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • Docker-in-Docker                                       │   │
│  │  • Git + GitHub CLI                                       │   │
│  │  • PostgreSQL Client                                      │   │
│  │  • Redis Tools                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Development Tools                                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • Node.js 20 + npm                                       │   │
│  │  • TypeScript                                             │   │
│  │  • Vite                                                   │   │
│  │  • Hardhat                                                │   │
│  │  • Foundry (Forge, Cast, Anvil)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  VS Code Extensions                                       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • TypeScript                                             │   │
│  │  • ESLint                                                 │   │
│  │  • Prettier                                               │   │
│  │  • Solidity                                               │   │
│  │  • Docker                                                 │   │
│  │  • GitLens                                                │   │
│  │  • + more...                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Lifecycle Scripts                                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  post-create.sh  ─► One-time setup                        │   │
│  │  post-start.sh   ─► Every container start                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Command Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Command Execution Flow                        │
└─────────────────────────────────────────────────────────────────┘

Developer Input
       │
       ├──────► make <command>
       │            │
       │            └──► Makefile
       │                    │
       │                    └──► Shell Commands / npm scripts
       │
       ├──────► npm run cli <command>
       │            │
       │            └──► cli.js
       │                    │
       │                    └──► Commander.js
       │                            │
       │                            └──► Node.js execution
       │
       └──────► npm run <script>
                    │
                    └──► package.json scripts
                            │
                            └──► Node.js / Shell execution
```

## Database Migration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Database Migration Flow                         │
└─────────────────────────────────────────────────────────────────┘

    Developer
       │
       ├──► Create migration file
       │    (database/migrations/XXX_name.sql)
       │
       ▼
    make db-migrate / npm run cli db migrate
       │
       ├──► Start PostgreSQL
       │
       ├──► Apply migration script
       │
       ├──► Update schema version
       │
       └──► Verify changes
              │
              ├──► Success ──► Ready for development
              │
              └──► Failure ──► Rollback & Fix
```

## Smart Contract Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              Smart Contract Deployment Flow                      │
└─────────────────────────────────────────────────────────────────┘

    Developer
       │
       ├──► Edit contracts/*.sol
       │
       ▼
    make contracts-compile
       │
       ├──► Hardhat compile
       │
       ├──► Generate artifacts
       │
       └──► Success?
              │
              ├──► Yes ──► make contracts-test
              │              │
              │              ├──► Run Hardhat tests
              │              │
              │              └──► Success?
              │                     │
              │                     └──► Yes ──► make contracts-deploy
              │                                     │
              │                                     ├──► Start Anvil
              │                                     │
              │                                     ├──► Deploy contracts
              │                                     │
              │                                     └──► Verify deployment
              │
              └──► No ──► Fix compilation errors
```

## Testing Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    Testing Pipeline                              │
└─────────────────────────────────────────────────────────────────┘

    Developer
       │
       ├──► make test / npm run cli test
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
    Unit Tests   Integration   E2E Tests    Smart Contract
                    Tests                        Tests
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                          │
                          ▼
                  Generate Coverage
                          │
                          ├──► Check threshold (80%)
                          │
                          ├──► Pass ──► Success
                          │
                          └──► Fail ──► Fix tests
```

## Documentation Structure

```
LightDom/
├── README.md                       ◄── Project overview
├── QUICK_START.md                  ◄── Fast start guide
├── QUICK_REFERENCE.md              ◄── Command reference
├── WORKFLOW_AUTOMATION.md          ◄── Complete automation guide
├── CONTRIBUTING.md                 ◄── Contribution guide
├── ARCHITECTURE.md                 ◄── System architecture
│
├── .devcontainer/
│   ├── README.md                   ◄── Dev container guide
│   ├── devcontainer.json           ◄── Container config
│   ├── post-create.sh              ◄── Setup script
│   └── post-start.sh               ◄── Startup script
│
├── .github/
│   ├── COPILOT_INSTRUCTIONS.md     ◄── Copilot guide
│   └── workflows/                  ◄── CI/CD configs
│
└── .cursor/
    ├── CURSOR_INSTRUCTIONS.md      ◄── Cursor guide
    ├── workflows.json              ◄── Cursor workflows
    └── tasks.json                  ◄── Cursor tasks
```

---

**Visual Guide**: This diagram helps understand how all the workflow automation tools fit together.
