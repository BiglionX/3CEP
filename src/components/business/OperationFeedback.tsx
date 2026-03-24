/**
 * 统一操作反馈组件
 * 为任意子组件提供加载、确认、反馈的统一处理
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingOverlay } from '@/components/ui/loading';
import { useOperation, UseOperationOptions } from '@/hooks/use-operation';
import { AlertTriangle } from 'lucide-react';
import React, { ReactNode, useCallback, useState } from 'react';

export interface OperationFeedbackProps extends UseOperationOptions {
  /** 子组件 */
  children: ReactNode;
  /** 是否需要确认对话框 */
  requireConfirm?: boolean;
  /** 确认对话框标题 */
  confirmTitle?: string;
  /** 确认对话框描述 */
  confirmDescription?: string;
  /** 确认按钮文本 */
  confirmButtonText?: string;
  /** 取消按钮文本 */
  cancelButtonText?: string;
  /** 渲染触发操作的函数 */
  renderTrigger?: (props: {
    onClick: () => void;
    isLoading: boolean;
  }) => ReactNode;
}

/**
 * 统一操作反馈组件
 * 自动处理加载状态、确认对话框和操作反馈
 */
export function OperationFeedback({
  children,
  requireConfirm = false,
  confirmTitle = '确认操作',
  confirmDescription = '此操作将执行重要变更，是否继续？',
  confirmButtonText = '确认',
  cancelButtonText = '取消',
  renderTrigger,
  ...options
}: OperationFeedbackProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<
    (() => Promise<any>) | null
  >(null);

  const { execute, isLoading } = useOperation(options);

  /**
   * 处理操作执行
   */
  const handleExecute = useCallback(
    async (operation: () => Promise<any>) => {
      if (requireConfirm) {
        // 显示确认对话框
        setPendingOperation(() => operation);
        setShowConfirmDialog(true);
      } else {
        // 直接执行
        await execute(operation);
      }
    },
    [requireConfirm, execute]
  );

  /**
   * 处理确认对话框的确认
   */
  const handleConfirm = useCallback(async () => {
    setShowConfirmDialog(false);
    if (pendingOperation) {
      await execute(pendingOperation);
      setPendingOperation(null);
    }
  }, [pendingOperation, execute]);

  /**
   * 处理确认对话框的取消
   */
  const handleCancel = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingOperation(null);
  }, []);

  /**
   * 渲染触发器
   */
  const renderTriggerComponent = useCallback(() => {
    if (!renderTrigger) return null;

    return (
      <>
        {renderTrigger({
          onClick: () => handleExecute(() => Promise.resolve()),
          isLoading,
        })}
      </>
    );
  }, [renderTrigger, handleExecute, isLoading]);

  return (
    <>
      {/* 加载遮罩 */}
      <LoadingOverlay loading={isLoading} message="处理中..." />

      {/* 确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {confirmTitle}
            </DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelButtonText}
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 渲染触发器或子组件 */}
      {renderTriggerComponent()}

      {/* 如果提供了 children 且不是 renderTrigger 模式，则通过 cloneElement 传递 props */}
      {!renderTrigger && children && (
        <div className="inline-block">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              // 如果是按钮，添加 onClick 和 disabled 属性
              if (
                React.isValidElement<{
                  onClick?: () => void;
                  disabled?: boolean;
                }>(child)
              ) {
                const originalOnClick = child.props.onClick;

                return React.cloneElement(child, {
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (originalOnClick) {
                      // 如果原 onClick 返回 Promise，则使用它作为操作
                      const result = originalOnClick(e);
                      if (result && typeof result.then === 'function') {
                        handleExecute(() => result);
                      } else {
                        handleExecute(() => Promise.resolve(result));
                      }
                    } else {
                      handleExecute(() => Promise.resolve());
                    }
                  },
                  disabled: isLoading || child.props.disabled,
                });
              }
              return child;
            }
            return child;
          })}
        </div>
      )}

      {/* 如果没有提供 children 或 renderTrigger，直接渲染原始内容 */}
      {!children && !renderTrigger && null}
    </>
  );
}

/**
 * 简化的操作按钮组件
 * 快速创建带反馈的操作按钮
 */
export interface OperationButtonProps extends UseOperationOptions {
  /** 按钮文本 */
  buttonText?: string;
  /** 点击回调 */
  onClick?: () => Promise<void>;
  /** 按钮变体 */
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  /** 按钮大小 */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 需要确认 */
  requireConfirm?: boolean;
}

export function OperationButton({
  buttonText = '操作',
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  requireConfirm = false,
  ...options
}: OperationButtonProps) {
  return (
    <OperationFeedback
      requireConfirm={requireConfirm}
      {...options}
      renderTrigger={({ onClick: handleTrigger, isLoading }) => (
        <Button
          variant={variant}
          size={size}
          onClick={handleTrigger}
          disabled={disabled || isLoading}
          className={className}
        >
          {isLoading ? '处理中...' : buttonText}
        </Button>
      )}
    />
  );
}

export default OperationFeedback;
