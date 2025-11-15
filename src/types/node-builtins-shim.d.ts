// Minimal Node.js builtin module shims for MCP tooling that runs in a Node context.
// These are intentionally broad and should be replaced with precise typings later.

declare module 'child_process' {
  export function spawn(...args: any[]): any;
  export function spawnSync(...args: any[]): any;
}

declare module 'fs/promises' {
  export function readFile(...args: any[]): any;
  export function writeFile(...args: any[]): any;
  export function mkdtemp(...args: any[]): any;
}

declare module 'fs' {
  export function existsSync(...args: any[]): any;
}

declare module 'path' {
  const path: any;
  export = path;
}

declare module 'url' {
  export function fileURLToPath(...args: any[]): any;
}
