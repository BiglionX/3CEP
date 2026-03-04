/**
 * @file Toolbar.tsx
 * @description 设计器工具栏组件
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React from 'react';

// 工具栏属性接?interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  isPreviewMode: boolean;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreviewToggle: () => void;
  className?: string;
}

/**
 * 设计器工具栏组件
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  isPreviewMode,
  onSave,
  onUndo,
  onRedo,
  onPreviewToggle,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${className}`}>
      {/* 左侧操作按钮 */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <SaveIcon />
          <span>保存</span>
        </button>

        <div className="h-6 w-px bg-gray-300"></div>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-1 ${
            canUndo
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="撤销 (Ctrl+Z)"
        >
          <UndoIcon />
          <span>撤销</span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-1 ${
            canRedo
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="重做 (Ctrl+Y)"
        >
          <RedoIcon />
          <span>重做</span>
        </button>
      </div>

      {/* 中间标题 */}
      <div className="text-lg font-semibold text-gray-800">拖拽报表设计?/div>

      {/* 右侧视图切换 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">视图模式:</span>
          <ViewModeToggle
            isPreviewMode={isPreviewMode}
            onToggle={onPreviewToggle}
          />
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        <button
          className="px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
          title="帮助"
        >
          <HelpIcon />
        </button>
      </div>
    </div>
  );
};

// 视图模式切换组件
const ViewModeToggle: React.FC<{
  isPreviewMode: boolean;
  onToggle: () => void;
}> = ({ isPreviewMode, onToggle }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => !isPreviewMode && onToggle()}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          !isPreviewMode
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        设计
      </button>
      <button
        onClick={() => isPreviewMode && onToggle()}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          isPreviewMode
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        预览
      </button>
    </div>
  );
};

// SVG图标组件
const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
  </svg>
);

const UndoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const RedoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a7 7 0 00-7 7v2a1 1 0 11-2 0v-2a9 9 0 019-9h5.586l-2.293 2.293a1 1 0 11-1.414-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const HelpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);
