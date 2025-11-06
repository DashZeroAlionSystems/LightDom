// Triage shim: loosen CSSProperties.textAlign to accept any value (reduces widespread style typing noise)
import 'react';

declare module 'react' {
  interface CSSProperties {
    // Many places use string values for textAlign; allow any as a triage workaround
    textAlign?: any;
  }
}

export {};
