// Triage shim for sub-module imports from '@/components/ui/*' and '../components/ui/*'
// Some files import these as individual sub-modules rather than the main module

declare module '@/components/ui/card' {
  export const Card: any;
  export const CardHeader: any;
  export const CardTitle: any;
  export const CardContent: any;
  export const CardDescription: any;
  export const CardFooter: any;
  const _default: any;
  export default _default;
}

declare module '../components/ui/card' {
  export * from '@/components/ui/card';
}

declare module '@/components/ui/button' {
  export const Button: any;
  const _default: any;
  export default _default;
}

declare module '../components/ui/button' {
  export * from '@/components/ui/button';
}

declare module '@/components/ui/badge' {
  export const Badge: any;
  const _default: any;
  export default _default;
}

declare module '../components/ui/badge' {
  export * from '@/components/ui/badge';
}

declare module '@/components/ui/tabs' {
  export const Tabs: any;
  export const TabsList: any;
  export const TabsTrigger: any;
  export const TabsContent: any;
  const _default: any;
  export default _default;
}

declare module '../components/ui/tabs' {
  export * from '@/components/ui/tabs';
}

declare module '@/components/ui/select' {
  export const Select: any;
  export const SelectOption: any;
  export const SelectTrigger: any;
  export const SelectValue: any;
  export const SelectContent: any;
  export const SelectItem: any;
  const _default: any;
  export default _default;
}

declare module '../components/ui/select' {
  export * from '@/components/ui/select';
}

export {};
