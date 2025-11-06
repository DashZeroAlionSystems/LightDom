// Triage shim: loosen textAlign typing in csstype to accept arbitrary strings in the short term
declare module 'csstype' {
  // Properties corresponds to camelCase style keys like textAlign
  interface Properties {
    textAlign?: any; // triage: accept any to silence widespread mismatches
  }
  // PropertiesHyphen for kebab-case keys
  interface PropertiesHyphen {
    'text-align'?: any;
  }
}

export {};
