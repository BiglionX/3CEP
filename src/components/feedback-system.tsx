/**
 * 操作反馈系统
 * 提供统一的用户操作反馈机制，包括Toast通知、确认对话框和加载状态
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from 'lucide-react';

// 反馈类型枚举
export enum FeedbackType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  LOADING = 'LOADING',
}

// 反馈位置枚举
export enum FeedbackPosition {
  TOP_LEFT = 'TOP_LEFT',
  TOP_CENTER = 'TOP_CENTER',
  TOP_RIGHT = 'TOP_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_CENTER = 'BOTTOM_CENTER',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
}

// 反馈信息接口
export interface Feedback {
  id: string;
  type: FeedbackType;
  message: string;
  title?: string;
  duration?: number;
  position?: FeedbackPosition;
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

// 确认对话框选项
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: FeedbackType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// 加载状态选项
export interface LoadingOptions {
  message?: string;
  cancellable?: boolean;
  onCancel?: () => void;
}

// 反馈上下文类型
interface FeedbackContextType {
  // Toast通知
  showToast: (
    message: string,
    options?: {
      type?: FeedbackType;
      title?: string;
      duration?: number;
      position?: FeedbackPosition;
      closable?: boolean;
      action?: { label: string; onClick: () => void };
    }
  ) => void;

  // 确认对话框
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;

  // 加载状态
  showLoading: (options?: LoadingOptions) => void;
  hideLoading: () => void;

  // 清除所有反馈
  clearAll: () => void;

  // 当前状态
  toasts: Feedback[];
  isLoading: boolean;
  loadingMessage?: string;
}

// 创建反馈上下文
const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

// 反馈提供商组件
export function FeedbackProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [toasts, setToasts] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [activeConfirm, setActiveConfirm] = useState<ConfirmOptions | null>(
    null
  );
  const [resolveConfirm, setResolveConfirm] = useState<
    ((value: boolean) => void) | null
  >(() => null);

  // 显示Toast通知
  const showToast = useCallback(
    (
      message: string,
      options: {
        type?: FeedbackType;
        title?: string;
        duration?: number;
        position?: FeedbackPosition;
        closable?: boolean;
        action?: { label: string; onClick: () => void };
      } = {}
    ): string => {
      const {
        type = FeedbackType.INFO,
        title,
        duration = type === FeedbackType.ERROR ? 8000 : 5000,
        position = FeedbackPosition.BOTTOM_RIGHT,
        closable = true,
        action,
      } = options;

      const id = Math.random().toString(36).substr(2, 9);

      const newToast: Feedback = {
        id,
        type,
        message,
        title,
        duration,
        position,
        closable,
        action,
        timestamp: Date.now(),
      };

      setToasts(prev => [...prev, newToast]);

      // 自动移除
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
        }, duration);
      }

      return id;
    },
    []
  );

  // 显示确认对话框
  const showConfirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise(resolve => {
        setActiveConfirm(options);
        setResolveConfirm(() => (value: boolean) => resolve(value));
      });
    },
    []
  );

  // 处理确认对话框确认
  const handleConfirm = useCallback(() => {
    if (resolveConfirm) {
      resolveConfirm(true);
      setResolveConfirm(null);
    }
    setActiveConfirm(null);
    if (activeConfirm?.onConfirm) {
      activeConfirm.onConfirm();
    }
  }, [resolveConfirm, activeConfirm]);

  // 处理确认对话框取消
  const handleCancel = useCallback(() => {
    if (resolveConfirm) {
      resolveConfirm(false);
      setResolveConfirm(null);
    }
    setActiveConfirm(null);
    if (activeConfirm?.onCancel) {
      activeConfirm.onCancel();
    }
  }, [resolveConfirm, activeConfirm]);

  // 显示加载状态
  const showLoading = useCallback((options: LoadingOptions = {}) => {
    const { message = '处理中...', cancellable = false, onCancel } = options;
    setIsLoading(true);
    setLoadingMessage(message);

    if (cancellable && onCancel) {
      // 可以添加取消逻辑
    }
  }, []);

  // 隐藏加载状态
  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  }, []);

  // 清除所有反馈
  const clearAll = useCallback(() => {
    setToasts([]);
    setIsLoading(false);
    setLoadingMessage(undefined);
    setActiveConfirm(null);
    if (resolveConfirm) {
      resolveConfirm(false);
      setResolveConfirm(null);
    }
  }, [resolveConfirm]);

  // 反馈上下文值
  const contextValue: FeedbackContextType = {
    showToast,
    showConfirm,
    showLoading,
    hideLoading,
    clearAll,
    toasts,
    isLoading,
    loadingMessage,
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onRemove={id =>
          setToasts(prev => prev.filter(toast => toast.id !== id))
        }
      />
      {activeConfirm && (
        <ConfirmDialog
          options={activeConfirm}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </FeedbackContext.Provider>
  );
}

// 使用反馈上下文的Hook
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}

// Toast容器组件
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Feedback[];
  onRemove: (id: string) => void;
}) {
  // 按位置分组Toasts
  const groupedToasts = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || FeedbackPosition.BOTTOM_RIGHT;
      if (!acc[position]) acc[position] = [];
      acc[position].push(toast);
      return acc;
    },
    {} as Record<FeedbackPosition, Feedback[]>
  );

  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={getPositionClasses(position as FeedbackPosition)}
        >
          {positionToasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </div>
      ))}
    </>
  );
}

// 单个Toast项组件
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Feedback;
  onRemove: (id: string) => void;
}) {
  const getToastStyle = () => {
    switch (toast.type) {
      case FeedbackType.SUCCESS:
        return 'bg-green-50 border-green-200 text-green-800';
      case FeedbackType.ERROR:
        return 'bg-red-50 border-red-200 text-red-800';
      case FeedbackType.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case FeedbackType.LOADING:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case FeedbackType.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case FeedbackType.ERROR:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case FeedbackType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case FeedbackType.LOADING:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={`${getToastStyle()} border rounded-lg p-4 shadow-lg mb-2 max-w-sm w-full animate-in slide-in-from-right duration-300`}
    >
      <div className="flex items-start gap-3">
        {getToastIcon()}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-medium text-sm">{toast.title}</h4>
          )}
          <p className="text-sm opacity-90">{toast.message}</p>
          {toast.action && (
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 h-7 px-2 text-xs"
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </Button>
          )}
        </div>
        {toast.closable && (
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// 确认对话框组件
function ConfirmDialog({
  options,
  onConfirm,
  onCancel,
}: {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const {
    title,
    message,
    confirmText = '确认',
    cancelText = '取消',
    type = FeedbackType.WARNING,
  } = options;

  const getDialogStyle = () => {
    switch (type) {
      case FeedbackType.ERROR:
        return 'border-red-200';
      case FeedbackType.WARNING:
        return 'border-yellow-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl shadow-xl max-w-md w-full border ${getDialogStyle()} animate-in zoom-in-95 duration-200`}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel} className="px-4 py-2">
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={
                type === FeedbackType.ERROR ? 'bg-red-600 hover:bg-red-700' : ''
              }
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 加载遮罩组件
function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 text-center animate-in zoom-in-95 duration-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        {message && <p className="text-gray-700 font-medium">{message}</p>}
      </div>
    </div>
  );
}

// 获取位置样式类
function getPositionClasses(position: FeedbackPosition): string {
  const baseClasses = 'fixed z-40 space-y-2 p-4 pointer-events-none';

  switch (position) {
    case FeedbackPosition.TOP_LEFT:
      return `${baseClasses} top-0 left-0`;
    case FeedbackPosition.TOP_CENTER:
      return `${baseClasses} top-0 left-1/2 transform -translate-x-1/2`;
    case FeedbackPosition.TOP_RIGHT:
      return `${baseClasses} top-0 right-0`;
    case FeedbackPosition.BOTTOM_LEFT:
      return `${baseClasses} bottom-0 left-0`;
    case FeedbackPosition.BOTTOM_CENTER:
      return `${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2`;
    case FeedbackPosition.BOTTOM_RIGHT:
      return `${baseClasses} bottom-0 right-0`;
    default:
      return `${baseClasses} bottom-0 right-0`;
  }
}

// 预设的便捷方法
export const useToast = () => {
  const { showToast } = useFeedback();

  return {
    success: (
      message: string,
      options?: Omit<Parameters<typeof showToast>[1], 'type'>
    ) => showToast(message, { ...options, type: FeedbackType.SUCCESS }),

    error: (
      message: string,
      options?: Omit<Parameters<typeof showToast>[1], 'type'>
    ) => showToast(message, { ...options, type: FeedbackType.ERROR }),

    warning: (
      message: string,
      options?: Omit<Parameters<typeof showToast>[1], 'type'>
    ) => showToast(message, { ...options, type: FeedbackType.WARNING }),

    info: (
      message: string,
      options?: Omit<Parameters<typeof showToast>[1], 'type'>
    ) => showToast(message, { ...options, type: FeedbackType.INFO }),

    loading: (
      message: string,
      options?: Omit<Parameters<typeof showToast>[1], 'type'>
    ) =>
      showToast(message, {
        ...options,
        type: FeedbackType.LOADING,
        duration: 0,
      }),
  };
};

// 预设的确认对话框方法
export const useConfirm = () => {
  const { showConfirm } = useFeedback();

  return {
    confirm: (options: Omit<ConfirmOptions, 'type'>) =>
      showConfirm({ ...options, type: FeedbackType.WARNING }),

    danger: (options: Omit<ConfirmOptions, 'type'>) =>
      showConfirm({ ...options, type: FeedbackType.ERROR }),

    info: (options: Omit<ConfirmOptions, 'type'>) =>
      showConfirm({ ...options, type: FeedbackType.INFO }),
  };
};

// 预设的加载状态方法
export const useLoading = () => {
  const { showLoading, hideLoading } = useFeedback();

  return {
    show: showLoading,
    hide: hideLoading,
  };
};

// 高阶组件导出
export const withFeedback = (Component: React.ComponentType) => Component;

// 批量操作反馈函数
export const withBatchFeedback = async <T,>(
  items: T[],
  operation: (item: T) => Promise<any>,
  options: {
    itemName?: string;
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<{ item: T; success: boolean }[]> => {
  const { itemName = '项目', successMessage = '成功', errorMessage = '失败' } = options;
  const results: { item: T; success: boolean }[] = [];

  for (const item of items) {
    try {
      await operation(item);
      results.push({ item, success: true });
    } catch (error) {
      results.push({ item, success: false });
    }
  }

  return results;
};

// 便捷方法导出
export const useSuccess = () => {
  const { showToast } = useFeedback();
  return (message: string, title?: string) =>
    showToast(message, { type: FeedbackType.SUCCESS, title });
};

export const useError = () => {
  const { showToast } = useFeedback();
  return (message: string, title?: string) =>
    showToast(message, { type: FeedbackType.ERROR, title });
};

export const useWarning = () => {
  const { showToast } = useFeedback();
  return (message: string, title?: string) =>
    showToast(message, { type: FeedbackType.WARNING, title });
};

export const useInfo = () => {
  const { showToast } = useFeedback();
  return (message: string, title?: string) =>
    showToast(message, { type: FeedbackType.INFO, title });
};

export const useDismissToast = () => {
  const { clearAll } = useFeedback();
  return clearAll;
};
