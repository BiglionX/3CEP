'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Eye, EyeOff, Info } from 'lucide-react'

export default function AutomationPage() {
  const [n8nUrl, setN8nUrl] = useState<string>('https://n8n.yourdomain.com')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // 从环境变量获?n8n URL
    const urlFromEnv = process.env.NEXT_PUBLIC_N8N_URL
    if (urlFromEnv) {
      setN8nUrl(urlFromEnv)
    }
    
    // 检?URL 可访问?
    checkUrlAccessibility(urlFromEnv || 'https://n8n.yourdomain.com')
  }, [])

  const checkUrlAccessibility = async (url: string) => {
    try {
      setIsLoading(true)
      // 简单的可达性检?
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors' // 避免 CORS 问题
      })
      clearTimeout(timeoutId)
      
      setIsLoading(false)
      setError(null)
    } catch (err) {
      setIsLoading(false)
      setError('无法连接 n8n 服务，请检查服务状态')
      console.warn('n8n 服务连接检查失败', err)
    }
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError('iframe 加载失败，请检?n8n 服务配置')
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <div className="h-full min-h-[800px] flex flex-col">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">自动化工作流？</h1>
            <p className="text-muted-foreground mt-1">
              通过 n8n 平台管理和执行自动化工作?
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            需要登录?
          </Badge>
        </div>
      </div>

      {/* 登录指引卡片 */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔑 n8n 登录指引</span>
          </CardTitle>
          <CardDescription>
            首次使用需要登录?n8n 平台才能访问工作流编辑器器
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">在 iframe 中打开 n8n 界面需要独立登录。请使用以下预配置账号:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">用户</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value="1055603323@qq.com" 
                    readOnly 
                    className="flex-1 px-3 py-2 border rounded-md bg-muted text-muted-foreground font-mono text-sm"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => copyToClipboard('1055603323@qq.com', 'username')}
                    className="flex items-center gap-1"
                  >
                    {copiedField === 'username' ? (
                      <span className="text-xs">已复制</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">复制</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">密码</label>
                <div className="flex items-center gap-2">
                  <input 
                    type={showCredentials ? "text" : "password"} 
                    value="N8n_105!^-^" 
                    readOnly 
                    className="flex-1 px-3 py-2 border rounded-md bg-muted text-muted-foreground font-mono text-sm"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => copyToClipboard('N8n_105!^-^', 'password')}
                    className="flex items-center gap-1"
                  >
                    {copiedField === 'password' ? (
                      <span className="text-xs">已复制</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">复制</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="flex items-center gap-1"
                  >
                    {showCredentials ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>💡 使用提示</strong>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                <li>在 iframe 中首次访问时会跳转到 n8n 登录页面</li>
                <li>使用上方提供的账号信息登录</li>
                <li>登录后即可访问工作流编辑器</li>
                <li>会话期间无需重复登录</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在加载 n8n 界面...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="text-center p-6">
            <div className="text-destructive mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-destructive mb-2">连接错误</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => checkUrlAccessibility(n8nUrl)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              重新连接
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex-1 relative rounded-lg overflow-hidden border bg-background">
          <iframe
            ref={iframeRef}
            src={n8nUrl}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              minHeight: '700px'
            }}
            title="n8n 自动化工作流？"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className="w-full"
          />
          
          {/* 加载指示器覆盖层 */}
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center pointer-events-none opacity-0 transition-opacity">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">页面加载?..</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <div>
            当前连接: <span className="font-mono text-foreground">{n8nUrl}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`flex items-center ${isLoading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isLoading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`}></span>
              {isLoading ? '连接中' : error ? '连接失败' : '已连接'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
