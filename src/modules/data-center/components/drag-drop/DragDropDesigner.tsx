'use client';

import React from 'react';

interface DragDropDesignerProps {
  onSave?: (config: any) => void;
  onLoad?: (id: string) => Promise<any>;
  className?: string;
}

export const DragDropDesigner: React.FC<DragDropDesignerProps> = ({
  onSave,
  onLoad,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg ${className}`}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          数据中心设计器
        </h2>
        <p className="text-gray-500 mb-4">拖拽式设计工具 - 开发中</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">功能特性:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ 可视化数据模型设计</li>
            <li>✓ 拖拽式字段配置</li>
            <li>✓ 关系图谱生成</li>
            <li>✓ 元数据管理</li>
          </ul>
        </div>
        {onSave && (
          <button
            onClick={() => onSave({ test: 'config' })}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            测试保存
          </button>
        )}
      </div>
    </div>
  );
};
