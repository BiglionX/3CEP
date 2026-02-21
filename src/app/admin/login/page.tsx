'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import GoogleLoginButton from '@/components/GoogleLoginButton'
import Link from 'next/link'

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') || '/admin/dashboard'

  useEffect(() => {
    // 检查是否已经登录且是管理员
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check-session')
        if (response.ok) {
          const data = await response.json()
          // 如果已经是管理员，直接跳转到管理后台
          if (data.is_admin) {
            router.push(redirect)
          }
        }
      } catch (error) {
        console.log('未登录状态')
      }
    }
    
    checkAuth()
  }, [router, redirect])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.545-.82 3.72-1.385 5.617-1.385a1.724 1.724 0 011.385 1.724v10.317a1.724 1.724 0 01-1.385 1.724c-1.897 0-4.072-.565-5.617-1.385a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.545.82-3.72 1.385-5.617 1.385a1.724 1.724 0 01-1.385-1.724V5.682a1.724 1.724 0 011.385-1.724c1.897 0 4.072.565 5.617 1.385a1.724 1.724 0 002.573-1.066z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">管理后台登录</h1>
          <p className="text-gray-600 mt-2">
            请输入您的管理员凭证
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <GoogleLoginButton redirect={redirect} />
            <p className="text-xs text-gray-500 mt-3 text-center">
              使用您的Google账户登录管理后台
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或者</span>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">登录须知</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>仅限授权管理员账户登录</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>登录后将进入管理后台首页</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>如无管理员权限将跳转至未授权页面</span>
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← 返回网站首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}