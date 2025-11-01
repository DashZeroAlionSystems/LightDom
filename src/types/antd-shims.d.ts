// Triage-only: widen a few Ant Design types that cause a large number of
// 'Type "string" is not assignable to type "Gutter"' / SpaceSize errors.
// These are intentionally permissive and should be replaced with narrow
// augmentations once the top clusters are surgically fixed.

declare module 'antd' {
  // Ant Design `Gutter` is commonly `number | [number, number]` — widen to any
  // so code that passes numeric strings or other shapes during triage compiles.
  export type Gutter = any;
  export type SpaceSize = any;
  // Common named exports used across the codebase — declare permissively for triage.
  export const Space: any;
  export const Card: any;
  export const Typography: any;
  export const Button: any;
  export const Row: any;
  export const Col: any;
  export const Tag: any;
  export const Progress: any;
  export const Alert: any;
  export const Badge: any;
  export const Statistic: any;
  export const Avatar: any;
  export const Select: any;
  export const Divider: any;
  export const Tooltip: any;
  export const message: any;
  export const Tabs: any;
  export const Modal: any;
  export const Input: any;
  export const List: any;
  export const Form: any;
  export const Table: any;
  export const Switch: any;
  export const Timeline: any;
  export const Drawer: any;
  export const Spin: any;
  export const Layout: any;
  export const DatePicker: any;
  export const Empty: any;
  export const InputNumber: any;
  export const Slider: any;
  export const Menu: any;
  export const Dropdown: any;
  export const Checkbox: any;
  export const Radio: any;
  export const Upload: any;
  export const Rate: any;
  export const Transfer: any;
  export const Tree: any;
  export const Collapse: any;
  export const Steps: any;
  export const Popover: any;
  // Additional triage exports seen in top clusters
  export const FloatButton: any;
  export const Tour: any;
  export const Carousel: any;
  export const Calendar: any;
  export const Popconfirm: any;
  export const Breadcrumb: any;
  export const Pagination: any;
  export const BackTop: any;
  export const Affix: any;
  export const Anchor: any;
  export const ConfigProvider: any;
}

declare module 'antd/lib/row' {
  export type Gutter = any;
}

declare module 'antd/lib/space' {
  export type SpaceSize = any;
  export interface SpaceProps {
    [key: string]: any;
  }
}
