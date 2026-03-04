'use client';

import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '请输入内?..',
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // 处理内容变化
  const handleChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // 处理键盘快捷?  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          break;
      }
    }
  };

  // 初始化编辑器内容
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* 工具?*/}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault();
            document.execCommand('bold');
            editorRef?.focus();
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="粗体 (Ctrl+B)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 4a1 1 0 011-1h4.5a1 1 0 01.707.293l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-.707.293H6a1 1 0 01-1-1V4zm9 10a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 011-1h6.5a1 1 0 01.707.293l3 3a1 1 0 010 1.414l-3 3z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault();
            document.execCommand('italic');
            editorRef?.focus();
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="斜体 (Ctrl+I)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8 2a1 1 0 000 2h1.5a1 1 0 01.894.553l2.282 4.148a1 1 0 00.894.553H15a1 1 0 100-2h-1.5a1 1 0 01-.894-.553l-2.282-4.148A1 1 0 0010.5 2H8zm0 10a1 1 0 000 2h1.5a1 1 0 01.894.553l2.282 4.148a1 1 0 00.894.553H15a1 1 0 100-2h-1.5a1 1 0 01-.894-.553l-2.282-4.148a1 1 0 00-.894-.553H8z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault();
            document.execCommand('underline');
            editorRef?.focus();
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="下划?(Ctrl+U)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault();
            document.execCommand('insertUnorderedList');
            editorRef?.focus();
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="项目符号列表"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault();
            document.execCommand('insertOrderedList');
            editorRef?.focus();
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="编号列表"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* 编辑区域 */}
      <div
        ref={editorRef}
        contentEditable
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        className={`min-h-64 p-4 outline-none ${
          isFocused ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          minHeight: '256px',
          lineHeight: '1.5',
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
