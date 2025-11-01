// Triage-only: augment React's CSSProperties to allow arbitrary string-indexed
// style keys/values commonly used in the codebase (e.g., dynamic CSS values).
// This reduces high-frequency errors where inline style objects are treated as
// incompatible with strict React.CSSProperties.

// Safer, namespace-based augmentation: add an index signature to React.CSSProperties
// via the global React namespace. This avoids overriding the module exports.
declare global {
  namespace React {
    interface CSSProperties {
      [key: string]: any;
    }
  }
}

export {};
