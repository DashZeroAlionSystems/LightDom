// Lightweight third-party module shims to reduce type-check noise during triage.
// Replace with proper @types packages or explicit declarations later.

declare module 'node-cron';
declare module 'bull';
declare module 'ioredis';
declare module 'googleapis';
declare module '@modelcontextprotocol/sdk/client/index.js';
declare module '@modelcontextprotocol/sdk';

// ant-design icons: provide a permissive shim so named imports compile.
declare module '@ant-design/icons' {
  // allow any named export
  const _default: any;
  export = _default;
}
