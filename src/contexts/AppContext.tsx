/**
 * 应用状态管理Provider
 * 统一管理全局状态、通知和加载状态
 */

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { NotificationContainer } from '@/components/common/Notifications'
import { useNotification } from '@/components/common/LoadingState'

interface AppContextType {
  notification: ReturnType<typeof useNotification>
}

const AppContext = createContext<AppContextType | null>(null)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const notification = useNotification()

  return (
    <AppContext.Provider value={{ notification }}>
      {children}
      <NotificationContainer />
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

// 全局状态管理Hook
export function useGlobalState() {
  const { notification } = useApp()
  
  return {
    // 通知相关
    notifications: notification.notifications,
    showSuccess: notification.showSuccess,
    showError: notification.showError,
    showWarning: notification.showWarning,
    showInfo: notification.showInfo,
    
    // 可以在这里添加其他全局状态
  }
}