/**
 * @file DragDropDesigner.tsx
 * @description 拖拽报表设计器主页面
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReportDesignConfig,
  WidgetConfig,
  Position,
  Size,
  CanvasConfig,
  DataSourceConfig,
  WidgetType,
} from '../../models/report-models';
import { CanvasArea } from './CanvasArea';
import { WidgetPalette } from './WidgetPalette';
import { PropertyPanel } from './PropertyPanel';
import { Toolbar } from './Toolbar';
import { createDraggableWidget } from './DragDropManager';
import { DraggableItem } from '../../models/report-models';

// 设计器属性接?interface DragDropDesignerProps {
  initialConfig?: Partial<ReportDesignConfig>;
  onSave?: (config: ReportDesignConfig) => Promise<void>;
  onLoad?: (id: string) => Promise<ReportDesignConfig>;
  className?: string;
}

/**
 * 拖拽报表设计器主组件
 */
export const DragDropDesigner: React.FC<DragDropDesignerProps> = ({
  initialConfig,
  onSave,
  onLoad,
  className = '',
}) => {
  // 状态管?  const [designConfig, setDesignConfig] = useState<ReportDesignConfig>(() =>
    createDefaultDesignConfig(initialConfig)
  );

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 当前选中的组?  const selectedWidget =
    designConfig.widgets.find(w => w.id === selectedWidgetId) || null;

  // 保存到历史记?  const saveToHistory = useCallback(
    (config: ReportDesignConfig) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(config)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // 撤销操作
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setDesignConfig(prevState);
      setHistoryIndex(historyIndex - 1);
      setSelectedWidgetId(null);
    }
  }, [history, historyIndex]);

  // 重做操作
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setDesignConfig(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // 组件操作处理函数
  const handleWidgetSelect = useCallback(
    (id: string) => {
      setSelectedWidgetId(id === selectedWidgetId ? null : id);
    },
    [selectedWidgetId]
  );

  const handleWidgetMove = useCallback(
    (id: string, position: Position) => {
      setDesignConfig(prev => {
        const newWidgets = prev.widgets.map(widget =>
          widget.id === id ? { ...widget, position } : widget
        );
        const newConfig = { ...prev, widgets: newWidgets };
        saveToHistory(newConfig);
        return newConfig;
      });
    },
    [saveToHistory]
  );

  const handleWidgetResize = useCallback(
    (id: string, size: Size) => {
      setDesignConfig(prev => {
        const newWidgets = prev.widgets.map(widget =>
          widget.id === id ? { ...widget, size } : widget
        );
        const newConfig = { ...prev, widgets: newWidgets };
        saveToHistory(newConfig);
        return newConfig;
      });
    },
    [saveToHistory]
  );

  const handleWidgetAdd = useCallback(
    (widget: WidgetConfig) => {
      setDesignConfig(prev => {
        const newWidgets = [...prev.widgets, widget];
        const newConfig = { ...prev, widgets: newWidgets };
        saveToHistory(newConfig);
        return newConfig;
      });
      setSelectedWidgetId(widget.id);
    },
    [saveToHistory]
  );

  const handleWidgetRemove = useCallback(
    (id: string) => {
      setDesignConfig(prev => {
        const newWidgets = prev.widgets.filter(widget => widget.id !== id);
        const newConfig = { ...prev, widgets: newWidgets };
        saveToHistory(newConfig);
        return newConfig;
      });
      if (selectedWidgetId === id) {
        setSelectedWidgetId(null);
      }
    },
    [selectedWidgetId, saveToHistory]
  );

  const handleWidgetUpdate = useCallback(
    (id: string, updates: Partial<WidgetConfig>) => {
      setDesignConfig(prev => {
        const newWidgets = prev.widgets.map(widget =>
          widget.id === id ? { ...widget, ...updates } : widget
        );
        const newConfig = { ...prev, widgets: newWidgets };
        saveToHistory(newConfig);
        return newConfig;
      });
    },
    [saveToHistory]
  );

  // 配置更新处理
  const handleConfigUpdate = useCallback(
    (updates: Partial<ReportDesignConfig>) => {
      setDesignConfig(prev => {
        const newConfig = { ...prev, ...updates };
        saveToHistory(newConfig);
        return newConfig;
      });
    },
    [saveToHistory]
  );

  // 保存设计
  const handleSave = useCallback(async () => {
    try {
      if (onSave) {
        await onSave({
          ...designConfig,
          updatedAt: new Date().toISOString(),
        });
      }
      // 显示保存成功提示
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('设计保存成功')} catch (error) {
      console.error('保存失败:', error);
    }
  }, [designConfig, onSave]);

  // 预览切换
  const handlePreviewToggle = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
  }, [isPreviewMode]);

  // 组件库数?  const widgetLibrary: Array<{
    type: WidgetType;
    name: string;
    icon: string;
    description: string;
  }> = [
    {
      type: 'chart',
      name: '图表',
      icon: '📊',
      description: '柱状图、折线图、饼图等',
    },
    { type: 'table', name: '表格', icon: '📋', description: '数据表格展示' },
    { type: 'text', name: '文本', icon: '📝', description: '文本内容展示' },
    {
      type: 'kpi-card',
      name: 'KPI卡片',
      icon: '📈',
      description: '关键指标展示',
    },
    { type: 'filter', name: '过滤?, icon: '🔍', description: '数据筛选控? },
  ];

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* 顶部工具?*/}
      <Toolbar
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isPreviewMode={isPreviewMode}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreviewToggle={handlePreviewToggle}
        className="border-b bg-white"
      />

      {/* 主工作区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧面板 - 组件?*/}
        <WidgetPalette
          widgets={widgetLibrary}
          onWidgetDrag={widgetType => createDraggableWidget(widgetType)}
          className="w-64 border-r bg-white"
        />

        {/* 中间画布区域 */}
        <div className="flex-1 p-4 overflow-auto">
          <CanvasArea
            widgets={designConfig.widgets}
            canvasConfig={designConfig.canvas}
            selectedWidgetId={selectedWidgetId}
            onWidgetSelect={handleWidgetSelect}
            onWidgetMove={handleWidgetMove}
            onWidgetResize={handleWidgetResize}
            onWidgetAdd={handleWidgetAdd}
            onWidgetRemove={handleWidgetRemove}
            onWidgetUpdate={handleWidgetUpdate}
            className="shadow-lg"
          />
        </div>

        {/* 右侧面板 - 属性配?*/}
        <PropertyPanel
          selectedWidget={selectedWidget}
          designConfig={designConfig}
          onWidgetUpdate={handleWidgetUpdate}
          onConfigUpdate={handleConfigUpdate}
          className="w-80 border-l bg-white"
        />
      </div>

      {/* 状态栏 */}
      <div className="border-t bg-white px-4 py-2 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <div>
            组件? {designConfig.widgets.length} | 画布尺寸:{' '}
            {designConfig.canvas.width}×{designConfig.canvas.height}
          </div>
          <div>
            {isPreviewMode ? '预览模式' : '设计模式'} | 历史记录:{' '}
            {historyIndex + 1}/{history.length}
          </div>
        </div>
      </div>
    </div>
  );
};

// 创建默认设计配置
const createDefaultDesignConfig = (
  partial?: Partial<ReportDesignConfig>
): ReportDesignConfig => ({
  id: partial?.id || `design_${Date.now()}`,
  name: partial?.name || '新建报表设计',
  description: partial?.description || '',
  canvas: partial?.canvas || {
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    gridSize: 20,
    showGrid: true,
    snapToGrid: true,
  },
  widgets: partial?.widgets || [],
  dataSource: partial?.dataSource || {
    type: 'database',
    connectionId: '',
  },
  createdAt: partial?.createdAt || new Date().toISOString(),
  updatedAt: partial?.updatedAt || new Date().toISOString(),
  createdBy: partial?.createdBy || 'current_user',
  version: partial?.version || 1,
});

// 默认导出
export default DragDropDesigner;
