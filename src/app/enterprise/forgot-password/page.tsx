/**
 * 忘记密码页面
 * 企业服务门户的密码重置功能
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// 表单验证模式
const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址')
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsSubmitting(true)
      setErrorMessage('')
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 这里应该调用实际的密码重置API
      console.log('发送密码重置邮件到:', data.email)
      
      setSubmitStatus('success')
    } catch (error) {
      console.error('密码重置失败:', error)
      setErrorMessage('发送密码重置邮件失败，请稍后重试')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">邮件已发送</CardTitle>
            <CardDescription>
              密码重置链接已发送到您的邮箱
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">
              请检查您的邮箱 {errors.email?.message || ''} 并点击邮件中的链接重置密码。
            </p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                邮件可能需要几分钟时间到达，请检查垃圾邮件文件夹。
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleBackToLogin} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回登录
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">忘记密码</CardTitle>
          <CardDescription>
            输入您的邮箱地址，我们将发送密码重置链接
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {submitStatus === 'error' && errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入您的邮箱地址"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              我们将向您的邮箱发送密码重置链接，请确保输入正确的邮箱地址。
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  发送重置链接
                </>
              )}
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              className="w-full"
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回登录
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}