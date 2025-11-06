// Minimal shims for node-cron and a global `cron` namespace used in the repo.
declare module 'node-cron' {
  const nodeCron: any;
  export = nodeCron;
}

// Provide a global `cron` namespace with ScheduledTask to satisfy type references
declare namespace cron {
  // ScheduledTask is the type returned by schedule in many cron libs
  export type ScheduledTask = any;
}
