/**
 * @file DraggableWidget.tsx
 * @description 可拖拽的报表组件
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { WidgetConfig, Position, Size } from '../../models/report-models';

// 组件属性接?interface DraggableWidgetProps {
  widget: WidgetConfig;
  isSelected: boolean;
  isSnapping: boolean;
  gridSize: number;
  onSelect: () => void;
  onMove: (position: Position) => void;
  onResize: (size: Size) => void;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
  onRemove: () => void;
}

/**
 * 可拖拽组件包装器
 */
export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  isSelected,
  isSnapping,
  gridSize,
  onSelect,
  onMove,
  onResize,
  onUpdate,
  onRemove,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // 处理鼠标按下（开始拖拽）
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!widgetRef.current) return;

      const rect = widgetRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      setDragOffset({ x: offsetX, y: offsetY });
      setIsDragging(true);
      onSelect();
    },
    [onSelect]
  );

  // 处理鼠标移动（拖拽中?  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !widgetRef.current) return;

      const container = widgetRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      let newX = e.clientX - containerRect.left - dragOffset.x;
      let newY = e.clientY - containerRect.top - dragOffset.y;

      // 网格对齐
      if (isSnapping) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // 边界检?      newX = Math.max(
        0,
        Math.min(newX, containerRect.width - widget.size.width)
      );
      newY = Math.max(
        0,
        Math.min(newY, containerRect.height - widget.size.height)
      );

      onMove({ x: newX, y: newY });
    },
    [isDragging, dragOffset, isSnapping, gridSize, onMove, widget.size]
  );

  // 处理鼠标释放（结束拖拽）
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // 处理调整大小
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeHandle(handle);
      onSelect();
    },
    [onSelect]
  );

  // 处理调整大小移动
  const handleResizeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeHandle || !widgetRef.current) return;

      const container = widgetRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const widgetRect = widgetRef.current.getBoundingClientRect();

      let newWidth = widget.size.width;
      let newHeight = widget.size.height;
      let newX = widget.position.x;
      let newY = widget.position.y;

      // 根据不同的调整手柄处?      switch (resizeHandle) {
        case 'se': // 右下?          newWidth = e.clientX - widgetRect.left;
          newHeight = e.clientY - widgetRect.top;
          break;
        case 'sw': // 左下?          newWidth = widgetRect.right - e.clientX;
          newHeight = e.clientY - widgetRect.top;
          newX = e.clientX - containerRect.left;
          break;
        case 'ne': // 右上?          newWidth = e.clientX - widgetRect.left;
          newHeight = widgetRect.bottom - e.clientY;
          newY = e.clientY - containerRect.top;
          break;
        case 'nw': // 左上?          newWidth = widgetRect.right - e.clientX;
          newHeight = widgetRect.bottom - e.clientY;
          newX = e.clientX - containerRect.left;
          newY = e.clientY - containerRect.top;
          break;
        case 'e': // 右边
          newWidth = e.clientX - widgetRect.left;
          break;
        case 'w': // 左边
          newWidth = widgetRect.right - e.clientX;
          newX = e.clientX - containerRect.left;
          break;
        case 's': // 下边
          newHeight = e.clientY - widgetRect.top;
          break;
        case 'n': // 上边
          newHeight = widgetRect.bottom - e.clientY;
          newY = e.clientY - containerRect.top;
          break;
      }

      // 最小尺寸限?      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(30, newHeight);

      // 网格对齐
      if (isSnapping) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        if (resizeHandle.includes('w') || resizeHandle.includes('n')) {
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }
      }

      // 边界检?      if (newX < 0) {
        newWidth += newX;
        newX = 0;
      }
      if (newY < 0) {
        newHeight += newY;
        newY = 0;
      }

      onResize({ width: newWidth, height: newHeight });
      if (newX !== widget.position.x || newY !== widget.position.y) {
        onMove({ x: newX, y: newY });
      }
    },
    [isResizing, resizeHandle, isSnapping, gridSize, onResize, onMove, widget]
  );

  // 添加全局事件监听?  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener(
        'mousemove',
        isDragging ? handleMouseMove : handleResizeMouseMove
      );
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener(
          'mousemove',
          isDragging ? handleMouseMove : handleResizeMouseMove
        );
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    handleMouseMove,
    handleResizeMouseMove,
    handleMouseUp,
  ]);

  // 渲染调整手柄
  const renderResizeHandles = () => {
    if (!isSelected) return null;

    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

    return handles.map(handle => (
      <div
        key={handle}
        className={`absolute w-2 h-2 bg-blue-500 border border-white cursor-${getCursorForHandle(handle)} hover:bg-blue-600`}
        style={getHandlePosition(handle)}
        onMouseDown={e => handleResizeMouseDown(e, handle)}
      />
    ));
  };

  // 获取手柄光标样式
  const getCursorForHandle = (handle: string): string => {
    const cursors: Record<string, string> = {
      nw: 'nw-resize',
      n: 'n-resize',
      ne: 'ne-resize',
      e: 'e-resize',
      se: 'se-resize',
      s: 's-resize',
      sw: 'sw-resize',
      w: 'w-resize',
    };
    return cursors[handle] || 'default';
  };

  // 获取手柄位置样式
  const getHandlePosition = (handle: string): React.CSSProperties => {
    const positions: Record<string, React.CSSProperties> = {
      nw: { top: -4, left: -4 },
      n: { top: -4, left: '50%', transform: 'translateX(-50%)' },
      ne: { top: -4, right: -4 },
      e: { top: '50%', right: -4, transform: 'translateY(-50%)' },
      se: { bottom: -4, right: -4 },
      s: { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
      sw: { bottom: -4, left: -4 },
      w: { top: '50%', left: -4, transform: 'translateY(-50%)' },
    };
    return positions[handle] || {};
  };

  return (
    <div
      ref={widgetRef}
      className={`absolute border-2 transition-all duration-150 ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-transparent hover:border-gray-300'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-move'}`}
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.width,
        height: widget.size.height,
        backgroundColor: widget.style.backgroundColor,
        borderColor: widget.style.borderColor,
        borderWidth: widget.style.borderWidth,
        borderRadius: widget.style.borderRadius,
        padding: widget.style.padding,
        margin: widget.style.margin,
        boxShadow: widget.style.boxShadow,
        opacity: widget.style.opacity,
        zIndex: widget.style.zIndex,
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onClick={e => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* 组件内容 */}
      <WidgetContent widget={widget} onUpdate={onUpdate} />

      {/* 调整手柄 */}
      {renderResizeHandles()}

      {/* 选择指示?*/}
      {isSelected && (
        <div className="absolute -top-6 left-0 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
          {widget.type}
        </div>
      )}

      {/* 删除按钮 */}
      {isSelected && (
        <button
          className="absolute -top-6 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          title="删除组件"
        >
          ×
        </button>
      )}
    </div>
  );
};

// 组件内容渲染?const WidgetContent: React.FC<{
  widget: WidgetConfig;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
}> = ({ widget, onUpdate }) => {
  switch (widget.type) {
    case 'chart':
      return <ChartWidgetContent config={widget.config} />;
    case 'table':
      return <TableWidgetContent config={widget.config} />;
    case 'text':
      return <TextWidgetContent config={widget.config} onUpdate={onUpdate} />;
    case 'kpi-card':
      return <KpiCardWidgetContent config={widget.config} />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          未知组件类型: {widget.type}
        </div>
      );
  }
};

// 图表组件内容
const ChartWidgetContent: React.FC<{ config: any }> = ({ config }) => (
  <div className="w-full h-full flex flex-col">
    <div className="text-sm font-medium text-gray-700 p-2 border-b">
      {config.title || '图表标题'}
    </div>
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="text-2xl mb-2">📊</div>
        <div>{config.chartType || '柱状?}占位?/div>
      </div>
    </div>
  </div>
);

// 表格组件内容
const TableWidgetContent: React.FC<{ config: any }> = ({ config }) => (
  <div className="w-full h-full flex flex-col">
    <div className="text-sm font-medium text-gray-700 p-2 border-b">
      {config.title || '数据表格'}
    </div>
    <div className="flex-1 overflow-auto">
      <div className="p-4 text-center text-gray-400">表格内容占位?/div>
    </div>
  </div>
);

// 文本组件内容
const TextWidgetContent: React.FC<{
  config: any;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
}> = ({ config, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(config.content || '');

  const handleSave = () => {
    onUpdate({
      config: {
        ...config,
        content: editValue,
      },
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="w-full h-full p-2">
        <textarea
          className="w-full h-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full p-2 cursor-text"
      style={{
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        textAlign: config.textAlign,
        color: config.color,
        lineHeight: config.lineHeight,
        fontFamily: config.fontFamily,
      }}
      onClick={() => setIsEditing(true)}
    >
      {config.content || '点击编辑文本'}
    </div>
  );
};

// KPI卡片组件内容
const KpiCardWidgetContent: React.FC<{ config: any }> = ({ config }) => (
  <div className="w-full h-full flex flex-col p-4">
    <div className="text-sm text-gray-600 mb-2">
      {config.title || 'KPI指标'}
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">
      {config.prefix}
      {config.value}
      {config.suffix}
    </div>
    <div className="text-xs text-gray-500">
      {config.trend === 'up'
        ? '📈 上升'
        : config.trend === 'down'
          ? '📉 下降'
          : '�?稳定'}
    </div>
  </div>
);
