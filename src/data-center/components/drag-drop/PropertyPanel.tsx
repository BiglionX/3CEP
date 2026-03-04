/**
 * @file PropertyPanel.tsx
 * @description 属性面板组? * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React, { useState } from 'react';
import {
  WidgetConfig,
  ReportDesignConfig,
  WidgetType,
} from '../../models/report-models';

// 属性面板属性接?interface PropertyPanelProps {
  selectedWidget: WidgetConfig | null;
  designConfig: ReportDesignConfig;
  onWidgetUpdate: (id: string, updates: Partial<WidgetConfig>) => void;
  onConfigUpdate: (updates: Partial<ReportDesignConfig>) => void;
  className?: string;
}

/**
 * 属性面板组? */
export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedWidget,
  designConfig,
  onWidgetUpdate,
  onConfigUpdate,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'widget' | 'design'>(
    selectedWidget ? 'widget' : 'design'
  );

  // 当选中组件变化时，默认切换到组件属性tab
  React.useEffect(() => {
    if (selectedWidget) {
      setActiveTab('widget');
    } else {
      setActiveTab('design');
    }
  }, [selectedWidget]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* 标题?*/}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedWidget ? `${selectedWidget.type} 属性` : '设计属?}
        </h2>
      </div>

      {/* Tab导航 */}
      <div className="border-b">
        <nav className="flex">
          {selectedWidget && (
            <button
              onClick={() => setActiveTab('widget')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'widget'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              组件属?            </button>
          )}
          <button
            onClick={() => setActiveTab('design')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'design'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            设计设置
          </button>
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'widget' && selectedWidget ? (
          <WidgetProperties widget={selectedWidget} onUpdate={onWidgetUpdate} />
        ) : (
          <DesignProperties config={designConfig} onUpdate={onConfigUpdate} />
        )}
      </div>
    </div>
  );
};

// 组件属性面?const WidgetProperties: React.FC<{
  widget: WidgetConfig;
  onUpdate: (id: string, updates: Partial<WidgetConfig>) => void;
}> = ({ widget, onUpdate }) => {
  const handlePropertyChange = (property: string, value: any) => {
    const updates: Partial<WidgetConfig> = {};

    if (property.startsWith('config.')) {
      const configKey = property.split('.')[1];
      updates.config = {
        ...widget.config,
        [configKey]: value,
      };
    } else if (property.startsWith('style.')) {
      const styleKey = property.split('.')[1];
      updates.style = {
        ...widget.style,
        [styleKey]: value,
      };
    } else {
      updates[property as keyof WidgetConfig] = value;
    }

    onUpdate(widget.id, updates);
  };

  switch (widget.type) {
    case 'chart':
      return (
        <ChartProperties widget={widget} onChange={handlePropertyChange} />
      );
    case 'table':
      return (
        <TableProperties widget={widget} onChange={handlePropertyChange} />
      );
    case 'text':
      return <TextProperties widget={widget} onChange={handlePropertyChange} />;
    case 'kpi-card':
      return (
        <KpiCardProperties widget={widget} onChange={handlePropertyChange} />
      );
    default:
      return (
        <CommonProperties widget={widget} onChange={handlePropertyChange} />
      );
  }
};

// 设计属性面?const DesignProperties: React.FC<{
  config: ReportDesignConfig;
  onUpdate: (updates: Partial<ReportDesignConfig>) => void;
}> = ({ config, onUpdate }) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">基本信息</h3>
        <div className="space-y-3">
          <PropertyInput
            label="报表名称"
            value={config.name}
            onChange={v => handleChange('name', v)}
          />
          <PropertyTextarea
            label="描述"
            value={config.description || ''}
            onChange={v => handleChange('description', v)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">画布设置</h3>
        <div className="space-y-3">
          <PropertyNumberInput
            label="宽度"
            value={config.canvas.width}
            onChange={v =>
              handleChange('canvas', { ...config.canvas, width: v })
            }
            min={400}
            max={2000}
          />
          <PropertyNumberInput
            label="高度"
            value={config.canvas.height}
            onChange={v =>
              handleChange('canvas', { ...config.canvas, height: v })
            }
            min={300}
            max={1500}
          />
          <PropertyColorPicker
            label="背景颜色"
            value={config.canvas.backgroundColor}
            onChange={v =>
              handleChange('canvas', { ...config.canvas, backgroundColor: v })
            }
          />
          <PropertyCheckbox
            label="显示网格"
            checked={config.canvas.showGrid}
            onChange={v =>
              handleChange('canvas', { ...config.canvas, showGrid: v })
            }
          />
          <PropertyCheckbox
            label="网格对齐"
            checked={config.canvas.snapToGrid}
            onChange={v =>
              handleChange('canvas', { ...config.canvas, snapToGrid: v })
            }
          />
          <PropertyNumberInput
            label="网格大小"
            value={config.canvas.gridSize}
            onChange={v =>
              handleChange('canvas', { ...config.canvas, gridSize: v })
            }
            min={10}
            max={50}
          />
        </div>
      </div>
    </div>
  );
};

// 各种属性输入组?const PropertyInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}> = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const PropertyTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}> = ({ label, value, onChange, rows = 3 }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const PropertyNumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ label, value, onChange, min, max, step = 1 }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const PropertyColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="flex items-center space-x-2">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
);

const PropertyCheckbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <label className="ml-2 block text-sm text-gray-700">{label}</label>
  </div>
);

const PropertySelect: React.FC<{
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// 各种组件特定的属性面?const ChartProperties: React.FC<any> = ({ widget, onChange }) => (
  <div className="p-4 space-y-4">
    <PropertyInput
      label="图表标题"
      value={widget.config.title}
      onChange={v => onChange('config.title', v)}
    />
    <PropertySelect
      label="图表类型"
      value={widget.config.chartType}
      options={[
        { value: 'bar', label: '柱状? },
        { value: 'line', label: '折线? },
        { value: 'pie', label: '饼图' },
        { value: 'area', label: '面积? },
      ]}
      onChange={v => onChange('config.chartType', v)}
    />
  </div>
);

const TableProperties: React.FC<any> = ({ widget, onChange }) => (
  <div className="p-4 space-y-4">
    <PropertyInput
      label="表格标题"
      value={widget.config.title}
      onChange={v => onChange('config.title', v)}
    />
    <PropertyNumberInput
      label="每页行数"
      value={widget.config.pagination.pageSize}
      onChange={v => onChange('config.pagination.pageSize', v)}
      min={5}
      max={100}
    />
  </div>
);

const TextProperties: React.FC<any> = ({ widget, onChange }) => (
  <div className="p-4 space-y-4">
    <PropertyNumberInput
      label="字体大小"
      value={widget.config.fontSize}
      onChange={v => onChange('config.fontSize', v)}
      min={8}
      max={72}
    />
    <PropertySelect
      label="字体粗细"
      value={widget.config.fontWeight}
      options={[
        { value: 'normal', label: '正常' },
        { value: 'bold', label: '粗体' },
        { value: 'lighter', label: '细体' },
      ]}
      onChange={v => onChange('config.fontWeight', v)}
    />
    <PropertyColorPicker
      label="文字颜色"
      value={widget.config.color}
      onChange={v => onChange('config.color', v)}
    />
  </div>
);

const KpiCardProperties: React.FC<any> = ({ widget, onChange }) => (
  <div className="p-4 space-y-4">
    <PropertyInput
      label="指标标题"
      value={widget.config.title}
      onChange={v => onChange('config.title', v)}
    />
    <PropertyInput
      label="前缀"
      value={widget.config.prefix || ''}
      onChange={v => onChange('config.prefix', v)}
    />
    <PropertyInput
      label="后缀"
      value={widget.config.suffix || ''}
      onChange={v => onChange('config.suffix', v)}
    />
  </div>
);

const CommonProperties: React.FC<any> = ({ widget, onChange }) => (
  <div className="p-4 space-y-4">
    <div className="text-gray-500 text-center py-8">通用属性配置区?/div>
  </div>
);
