/**
 * @file page.tsx
 * @description 拖拽设计器测试页?
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React from 'react';
import { DragDropDesigner } from '@/data-center/components/drag-drop/DragDropDesigner';

export default function DragDropDesignerPage() {
  const handleSave = async (config: any) => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('保存设计配置:', config)// 这里可以调用API保存配置
    localStorage.setItem('drag-drop-design', JSON.stringify(config));
  };

  const handleLoad = async (id: string) => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('加载设计配置:', id)const saved = localStorage.getItem('drag-drop-design');
    return saved ? JSON.parse(saved) : null;
  };

  return (
    <div className="h-screen">
      <DragDropDesigner
        onSave={handleSave}
        onLoad={handleLoad}
        className="h-full"
      />
    </div>
  );
}

