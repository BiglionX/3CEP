'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUnifiedAuth } from '@/hooks/use-unified-auth'
import { UnifiedLogin } from '@/components/auth/UnifiedLogin'

export default function EnhancedLoginPage() {
  const { isAuthenticated, is_admin } = useUnifiedAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') || undefined

  useEffect(() => {
    // 检查是否已经登录
    if (isAuthenticated) {
      // 已登录，根据redirect参数决定跳转位置
      if (redirect?.startsWith('/admin')) {
        router.push(redirect)
      } else if (is_admin) {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [isAuthenticated, is_admin, redirect, router])

  const handleLoginSuccess = (user: any) => {
    // 登录成功后的处理已在UnifiedLogin组件中处理
    console.log('登录成功:', user)
  }

  return (
    <UnifiedLogin 
      isOpen={true}
      onClose={() => router.push('/')}
      onLoginSuccess={handleLoginSuccess}
      redirectUrl={redirect}
      mode="page"
    />
  )
}