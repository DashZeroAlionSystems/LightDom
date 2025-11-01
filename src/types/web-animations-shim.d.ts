// Triage shim: add commonly-used Web Animations properties that some code uses
// This file intentionally widens the AnimationKeyframe type to include 'offset' and easing
export {};

declare global {
  // widen both AnimationKeyframe and Keyframe (some libs use either name)
  interface AnimationKeyframe {
    offset?: number;
    easing?: string;
    composite?: 'replace' | 'add' | string;
  }

  interface Keyframe {
    offset?: number;
    easing?: string;
    composite?: 'replace' | 'add' | string;
    [prop: string]: any;
  }

  // Accept objects keyed by property names as well (PropertyIndexedKeyframes)
  interface PropertyIndexedKeyframes {
    [property: string]: string | number | Keyframe | Array<Keyframe | string | number> | undefined;
  }
}
