/**
 * 通知组件
 * 统一的通知显示和管? */

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/components/common/LoadingState';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

function Toast({ id, type, title, message, onClose }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icon = icons[type];

  return (
    <div
      className={`flex items-start p-4 border rounded-lg shadow-lg ${colors[type]} animate-in slide-in-from-top-2 duration-300`}
    >
      <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 ml-2"
        onClick={() => onClose(id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
}

// 使用示例Hook
export function useToast() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
  };
}
