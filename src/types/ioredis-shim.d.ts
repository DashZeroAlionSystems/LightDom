// Minimal shim for ioredis and IORedis namespace used across the codebase.
declare namespace IORedis {
  export type Redis = any;
}

declare module 'ioredis' {
  // The package typically exports a Redis class; provide a permissive any.
  class Redis {
    constructor(...args: any[]);
  }
  export = Redis;
}
