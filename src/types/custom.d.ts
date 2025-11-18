
// Minimal, focused ambient declarations.
// NOTE: This file exists only to declare a very small set of local JS modules
// that don't have TypeScript typings in-repo. Avoid adding broad/duplicate
// ambient declarations here — prefer per-module `.d.ts` files next to the
// JS source if more are needed.

// Vite ImportMeta env declarations
interface ImportMetaEnv {
  readonly VITE_RPC_URL?: string
  readonly VITE_TOKEN_CONTRACT_ADDRESS?: string
  readonly VITE_REGISTRY_CONTRACT_ADDRESS?: string
  readonly VITE_NFT_CONTRACT_ADDRESS?: string
  readonly VITE_CHAIN_ID?: string
  readonly VITE_API_URL?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_WS_URL?: string
  readonly VITE_SOCKET_URL?: string
  readonly VITE_ENCRYPTION_KEY?: string
  readonly VITE_JWT_SECRET?: string
  readonly VITE_DATABASE_URL?: string
  readonly VITE_REDIS_URL?: string
  readonly VITE_EMAIL_SERVICE_URL?: string
  readonly VITE_STORAGE_BUCKET?: string
  readonly VITE_CDN_URL?: string
  readonly VITE_ANALYTICS_ID?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_LOG_LEVEL?: string
  readonly VITE_NODE_ENV?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_BUILD_DATE?: string
  readonly VITE_COMMIT_HASH?: string
  readonly VITE_BRANCH?: string
  // Add more as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Loose declaration for a local DatabaseIntegration JS module used by the
// codebase. Keep this narrow to avoid duplicate-declaration collisions.
declare module './DatabaseIntegration' {
  // the implementation is JS; callers expect an exported object
  export const databaseIntegration: any;
}

// If other specific missing modules are encountered, add targeted stubs
// next to their source files (e.g. src/services/foo/foo.d.ts). Avoid
// wildcard or broad third-party ambient declarations here.
