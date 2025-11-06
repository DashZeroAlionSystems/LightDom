// Temporary shim for @ant-design/icons to reduce TS noise during large migration.
// Replace with real imports or remove this shim once icon names and package
// version are reconciled.

declare module '@ant-design/icons' {
  const _default: any;
  export default _default;
  // Commonly referenced icons in the codebase (shims). These are intentionally
  // typed `any` to reduce TS noise during incremental migration. Replace with
  // real typed imports or remove the shim when the icon import patterns are
  // reconciled with the installed @ant-design/icons package.

  export const TrendingUpOutlined: any;
  export const TrendingDownOutlined: any;
  export const ScreenshotOutlined: any;
  export const DiamondOutlined: any;
  export const BrainOutlined: any;
  export const BookmarkOutlined: any;
  export const ExclamationTriangleOutlined: any;
  export const ReceiveOutlined: any;
  export const MedalOutlined: any;
  export const SilverOutlined: any;
  export const BronzeOutlined: any;
  export const TelegramOutlined: any;
  export const GlobalFilled: any;
  export const HardDriveOutlined: any;
  export const LineChartFilled: any;
  export const BarChartFilled: any;
  export const ApiOutlined: any;
  export const PauseCircleOutlined: any;
  export const PlayCircleOutlined: any;
  export const MenuUnfoldOutlined: any;
  export const MenuFoldOutlined: any;
  export const TrendingUp: any;
  export const TrendingDown: any;
  export const TrophyOutlined: any;
  export const RocketOutlined: any;
  export const BarChartOutlined: any;
  export const SearchOutlined: any;
  export const DatabaseOutlined: any;
  export const ClusterOutlined: any;
  export const ExperimentOutlined: any;
  export const BugOutlined: any;
  export const CheckCircleOutlined: any;
  export const ClockCircleOutlined: any;
  export const FireOutlined: any;
  export const StarOutlined: any;
  export const CrownOutlined: any;
  export const TrendingUpOutlinedFilled: any;

  // Additional icons referenced across the codebase
  export const ThunderboltOutlined: any;
  export const WalletOutlined: any;
  export const GlobalOutlined: any;
  export const SettingOutlined: any;
  export const BellOutlined: any;
  export const UserOutlined: any;
  export const GiftOutlined: any;
  export const DashboardOutlined: any;
  export const ExclamationCircleOutlined: any;
  export const CloseCircleOutlined: any;
  export const SyncOutlined: any;
  export const ArrowUpOutlined: any;
  export const ArrowDownOutlined: any;
  export const PlusOutlined: any;
  export const InfoCircleOutlined: any;
  export const DeleteOutlined: any;
  export const MoreOutlined: any;
  export const FilterOutlined: any;
  export const SortAscendingOutlined: any;
  export const SortDescendingOutlined: any;
  export const EyeOutlined: any;
  export const EditOutlined: any;
  export const CopyOutlined: any;
  export const MailOutlined: any;
  export const PhoneOutlined: any;
  export const MessageOutlined: any;
  export const CalendarOutlined: any;
  export const EnvironmentOutlined: any;
  export const CompassOutlined: any;
  export const BulbOutlined: any;
  export const ToolOutlined: any;
  export const HomeOutlined: any;
  export const HeartOutlined: any;
  export const LikeOutlined: any;
  export const DislikeOutlined: any;
  export const CloudOutlined: any;
  export const LineChartOutlined: any;
  export const PieChartOutlined: any;
  export const AreaChartOutlined: any;
  export const MedalOutlinedFilled: any;
  export const TrophyFilled: any;
  export const SearchFilled: any;
  // Keep adding missing icons as TS reports them
}
