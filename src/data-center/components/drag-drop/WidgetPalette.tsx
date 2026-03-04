/**
 * @file WidgetPalette.tsx
 * @description 组件调色板（左侧组件库）
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React from 'react';
import { WidgetType, DraggableItem } from '../../models/report-models';

// 组件项接?interface WidgetItem {
  type: WidgetType;
  name: string;
  icon: string;
  description: string;
}

// 调色板属性接?interface WidgetPaletteProps {
  widgets: WidgetItem[];
  onWidgetDrag: (widgetType: WidgetType) => DraggableItem;
  className?: string;
}

/**
 * 组件调色板组? */
export const WidgetPalette: React.FC<WidgetPaletteProps> = ({
  widgets,
  onWidgetDrag,
  className = '',
}) => {
  const handleDragStart = (widget: WidgetItem, event: React.DragEvent) => {
    const draggableItem = onWidgetDrag(widget.type);
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify(draggableItem)
    );
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* 标题?*/}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">组件?/h2>
        <p className="text-sm text-gray-600 mt-1">拖拽组件到画布上</p>
      </div>

      {/* 组件列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {widgets.map(widget => (
            <WidgetItem
              key={widget.type}
              widget={widget}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>

      {/* 底部信息 */}
      <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
        <div className="space-y-1">
          <div>💡 提示?/div>
          <div>�?拖拽组件到画布空白区?/div>
          <div>�?点击组件进行属性配?/div>
          <div>�?使用右下角手柄调整大?/div>
        </div>
      </div>
    </div>
  );
};

// 单个组件项组?const WidgetItem: React.FC<{
  widget: WidgetItem;
  onDragStart: (widget: WidgetItem, event: React.DragEvent) => void;
}> = ({ widget, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(widget, e)}
      className="group p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start space-x-3">
        {/* 图标 */}
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl group-hover:bg-blue-200 transition-colors">
          {widget.icon}
        </div>

        {/* 文本信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {widget.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {widget.description}
          </p>
        </div>
      </div>

      {/* 拖拽指示?*/}
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-xs text-blue-600 flex items-center">
          <DragIcon className="w-3 h-3 mr-1" />
          拖拽到画?        </div>
      </div>
    </div>
  );
};

// 拖拽图标组件
const DragIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm0 2h6v12H7V4z" />
    <path d="M5 8a1 1 0 011-1h1a1 1 0 010 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1z" />
  </svg>
);
