/**
 * 业务 UI 组件库 - 统一导出
 *
 * 包含以下系列：
 * - Table 系列：UserTable, OrderTable, ActionTable
 * - Card 系列：StatCard, InfoCard, ActionCard
 * - Filter 系列：FilterBar, SearchBox, DateRangePicker
 * - Menu 系列：ActionMenu (内置于 ActionTable)
 */

// Table 系列
export { UserTable } from './UserTable';
export type { User, UserTableProps } from './UserTable';

export { OrderTable } from './OrderTable';
export type { Order, OrderItem, OrderTableProps } from './OrderTable';

export { ActionTable, CommonActions } from './ActionTable';
export type { ActionItem, ActionTableProps } from './ActionTable';

// Card 系列
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

export { InfoCard } from './InfoCard';
export type { InfoCardProps } from './InfoCard';

export { ActionCard } from './ActionCard';
export type { ActionCardProps } from './ActionCard';

// Filter 系列
export { FilterBar } from './FilterBar';
export type { FilterBarProps, FilterConfig } from './FilterBar';

export { SearchBox } from './SearchBox';
export type { SearchBoxProps } from './SearchBox';

export { DateRangePicker } from './DateRangePicker';
export type { DateRange, DateRangePickerProps } from './DateRangePicker';
