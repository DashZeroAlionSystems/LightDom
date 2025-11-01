// Compatibility shim: re-export the Design System UI from src/components/ui
// Some files import '../ui' (from inside src/components/...), so providing this
// lightweight re-export fixes resolution without changing many call-sites.

export * from '../components/ui';
