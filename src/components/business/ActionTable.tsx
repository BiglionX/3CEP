/**
 * 操作表格组件 - 行内操作菜单
 */

'use client';

import { Column, DataTableMobile } from '@/components/tables/DataTableMobile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  Edit,
  Eye,
  MoreVertical,
  Settings,
  Share2,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

export interface ActionItem {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  divider?: boolean;
}

export interface ActionTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  actions: (item: T) => ActionItem[];
  enableBatchOperations?: boolean;
  pageSize?: number;
  emptyMessage?: string;
}

export function ActionTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  actions,
  enableBatchOperations = true,
  pageSize = 10,
  emptyMessage = '暂无数据',
}: ActionTableProps<T>) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // 添加操作列到自定义列
  const columnsWithAction: Column<T>[] = [
    ...columns,
    {
      key: '__actions__',
      label: '操作',
      sortable: false,
      mobile: { show: true, priority: 1 },
      render: (_, item, index) => {
        const itemId = item.id || String(index);
        const itemActions = actions(item);
        const isOpen = activeItemId === itemId;

        return (
          <div className="flex justify-end">
            <DropdownMenu
              open={isOpen}
              onOpenChange={open => setActiveItemId(open ? itemId : null)}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">打开菜单</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {itemActions.map((action, idx) => {
                  const Icon = action.icon;

                  if (action.divider) {
                    return <DropdownMenuSeparator key={idx} />;
                  }

                  return (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => {
                        action.onClick();
                        setActiveItemId(null);
                      }}
                      disabled={action.disabled}
                      className={`flex items-center gap-2 ${action.color || ''}`}
                    >
                      <Icon className={`w-4 h-4 ${action.color || ''}`} />
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DataTableMobile
      columns={columnsWithAction}
      data={data}
      loading={loading}
      rowActions={[]} // 使用内置的下拉菜单，不显示行内按钮
      enableBatchOperations={enableBatchOperations}
      emptyMessage={emptyMessage}
      pageSize={pageSize}
    />
  );
}

// 预定义的操作
export const CommonActions = {
  view: (onClick: () => void) => ({
    icon: Eye,
    label: '查看',
    onClick,
    color: 'text-blue-600',
  }),

  edit: (onClick: () => void) => ({
    icon: Edit,
    label: '编辑',
    onClick,
    color: 'text-green-600',
  }),

  delete: (onClick: () => void, disabled = false) => ({
    icon: Trash2,
    label: '删除',
    onClick,
    color: 'text-red-600',
    disabled,
  }),

  settings: (onClick: () => void) => ({
    icon: Settings,
    label: '设置',
    onClick,
    color: 'text-gray-600',
  }),

  share: (onClick: () => void) => ({
    icon: Share2,
    label: '分享',
    onClick,
    color: 'text-purple-600',
  }),

  download: (onClick: () => void) => ({
    icon: Download,
    label: '下载',
    onClick,
    color: 'text-blue-600',
  }),
};

export default ActionTable;
