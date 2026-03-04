/**
 * @file CanvasArea.tsx
 * @description 拖拽设计器画布区域组? * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  WidgetConfig,
  Position,
  Size,
  CanvasConfig,
  DropTarget,
} from '../../models/report-models';
import { useDragDropManager } from './DragDropManager';
import { DraggableWidget } from './DraggableWidget';
import { GridBackground } from './GridBackground';

// 画布属性接?interface CanvasAreaProps {
  widgets: WidgetConfig[];
  canvasConfig: CanvasConfig;
  selectedWidgetId: string | null;
  onWidgetSelect: (id: string) => void;
  onWidgetMove: (id: string, position: Position) => void;
  onWidgetResize: (id: string, size: Size) => void;
  onWidgetAdd: (widget: WidgetConfig) => void;
  onWidgetRemove: (id: string) => void;
  onWidgetUpdate: (id: string, updates: Partial<WidgetConfig>) => void;
  className?: string;
}

/**
 * 画布区域主组? */
export const CanvasArea: React.FC<CanvasAreaProps> = ({
  widgets,
  canvasConfig,
  selectedWidgetId,
  onWidgetSelect,
  onWidgetMove,
  onWidgetResize,
  onWidgetAdd,
  onWidgetRemove,
  onWidgetUpdate,
  className = '',
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<Position | null>(null);

  // 拖拽管理?  const dragDropManager = useDragDropManager({
    onDragStart: () => setIsDragging(true),
    onDragOver: (target, event) => {
      if (target.type === 'canvas' && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setDropIndicator({ x, y });
      }
    },
    onDragLeave: () => {
      setDropIndicator(null);
    },
    onDrop: (target, event) => {
      if (target.type === 'canvas' && canvasRef.current) {
        try {
          const dragData = event.dataTransfer.getData('application/json');
          if (dragData) {
            const draggedItem = JSON.parse(dragData);

            if (draggedItem.type === 'widget') {
              const rect = canvasRef.current.getBoundingClientRect();
              const x = event.clientX - rect.left;
              const y = event.clientY - rect.top;

              // 创建新的组件实例
              const newWidget = createWidgetFromDragItem(draggedItem, { x, y });
              onWidgetAdd(newWidget);
            }
          }
        } catch (error) {
          console.error('处理放置操作失败:', error);
        }
      }
      setDropIndicator(null);
    },
    onDragEnd: () => {
      setIsDragging(false);
      setDropIndicator(null);
    },
  });

  // 注册画布为目标区?  useEffect(() => {
    if (canvasRef.current) {
      dragDropManager.registerDropTarget(
        'canvas-main',
        canvasRef.current,
        'canvas'
      );
    }

    return () => {
      if (canvasRef.current) {
        dragDropManager.unregisterDropTarget('canvas-main');
      }
    };
  }, [dragDropManager]);

  // 从拖拽项目创建组?  const createWidgetFromDragItem = useCallback(
    (item: any, position: Position): WidgetConfig => {
      const baseConfig: WidgetConfig = {
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: item.widgetType,
        position,
        size: getDefaultWidgetSize(item.widgetType),
        config: getDefaultWidgetConfig(item.widgetType),
        style: getDefaultWidgetStyle(),
      };

      return baseConfig;
    },
    []
  );

  // 处理画布点击
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // 只有直接点击画布时才取消选择
      if (e.target === canvasRef.current) {
        onWidgetSelect('');
      }
    },
    [onWidgetSelect]
  );

  // 处理拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // 实际的放置处理在dragDropManager中完?  }, []);

  return (
    <div
      ref={canvasRef}
      className={`relative bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
      style={{
        width: canvasConfig.width,
        height: canvasConfig.height,
        backgroundColor: canvasConfig.backgroundColor,
      }}
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-testid="canvas-area"
    >
      {/* 网格背景 */}
      {canvasConfig.showGrid && (
        <GridBackground
          gridSize={canvasConfig.gridSize}
          width={canvasConfig.width}
          height={canvasConfig.height}
        />
      )}

      {/* 组件容器 */}
      <div className="absolute inset-0">
        {widgets.map(widget => (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            isSelected={widget.id === selectedWidgetId}
            isSnapping={canvasConfig.snapToGrid}
            gridSize={canvasConfig.gridSize}
            onSelect={() => onWidgetSelect(widget.id)}
            onMove={(position: Position) => onWidgetMove(widget.id, position)}
            onResize={(size: Size) => onWidgetResize(widget.id, size)}
            onUpdate={(updates: Partial<WidgetConfig>) =>
              onWidgetUpdate(widget.id, updates)
            }
            onRemove={() => onWidgetRemove(widget.id)}
          />
        ))}
      </div>

      {/* 放置指示?*/}
      {dropIndicator && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: dropIndicator.x - 25,
            top: dropIndicator.y - 25,
            width: 50,
            height: 50,
            border: '2px dashed #3b82f6',
            borderRadius: '4px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          }}
        />
      )}

      {/* 拖拽状态覆盖层 */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-20 pointer-events-none" />
      )}

      {/* 空状态提?*/}
      {widgets.length === 0 && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-lg font-medium">拖拽组件到这里开始设?/div>
            <div className="text-sm mt-1">
              从左侧组件面板拖拽图表、表格等组件到画布上
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 默认组件尺寸
const getDefaultWidgetSize = (widgetType: string): Size => {
  switch (widgetType) {
    case 'chart':
      return { width: 400, height: 300 };
    case 'table':
      return { width: 500, height: 300 };
    case 'text':
      return { width: 200, height: 100 };
    case 'kpi-card':
      return { width: 250, height: 150 };
    case 'filter':
      return { width: 300, height: 80 };
    default:
      return { width: 300, height: 200 };
  }
};

// 默认组件配置
const getDefaultWidgetConfig = (widgetType: string): any => {
  switch (widgetType) {
    case 'chart':
      return {
        chartType: 'bar',
        title: '新建图表',
        xAxis: { field: '', title: 'X�?, show: true },
        yAxis: { field: '', title: 'Y�?, show: true },
        series: [],
        legend: { show: true, position: 'top' },
        tooltip: { show: true, trigger: 'item' },
        dataBinding: { sourceType: 'static', staticData: [] },
      };
    case 'table':
      return {
        title: '数据表格',
        columns: [],
        dataBinding: { sourceType: 'static', staticData: [] },
        pagination: { show: true, pageSize: 10, pageSizeOptions: [10, 20, 50] },
        sorting: { multiple: false },
        filtering: { showFilters: false, filterFields: [] },
      };
    case 'text':
      return {
        content: '文本内容',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#000000',
        lineHeight: 1.5,
        fontFamily: 'sans-serif',
      };
    case 'kpi-card':
      return {
        title: 'KPI指标',
        value: 0,
        valueType: 'number',
        trend: 'neutral',
        dataBinding: { sourceType: 'static', staticData: [] },
      };
    default:
      return {};
  }
};

// 默认组件样式
const getDefaultWidgetStyle = (): any => ({
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  borderRadius: 4,
  padding: 16,
  margin: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  opacity: 1,
  zIndex: 1,
});
