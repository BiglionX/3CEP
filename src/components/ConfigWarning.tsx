'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { isConfigured } from '@/lib/supabase';

/**
 * 配置警告弹窗
 * 当 Supabase 等关键配置缺失时显示
 * TODO: 配置好 Supabase 后可移除此组件
 */
export default function ConfigWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 检查配置状态
    if (!isConfigured && !dismissed) {
      setIsVisible(true);
    }
  }, [dismissed]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-800">
              缺少配置
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              Supabase 数据库未配置，当前使用模拟数据模式。
              如需启用真实数据，请在 <code className="bg-amber-100 px-1 rounded">.env.local</code> 中设置：
            </p>
            <ul className="text-xs text-amber-700 mt-2 space-y-1 font-mono">
              <li>- NEXT_PUBLIC_SUPABASE_URL</li>
              <li>- NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>- SUPABASE_SERVICE_ROLE_KEY (可选)</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setDismissed(true);
            }}
            className="text-amber-600 hover:text-amber-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
