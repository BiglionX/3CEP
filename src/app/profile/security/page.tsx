'use client

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label
import { 
  Key, 
  Shield, 
  Smartphone, 
  Mail, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react
export default function SecuritySettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '
  })
  const [saving, setSaving] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // 密码强度检查
  const checkPasswordStrength = (password: string): { strength: number; suggestions: string[] } => {
    const suggestions: string[] = []
    let strength = 0

    // 长度检查
    if (password.length >= 8) strength += 1
    else suggestions.push('密码长度至少8位')

    // 大小写字母检查
    if (/[a-z]/.test(password)) strength += 1
    else suggestions.push('包含小写字母')
    
    if (/[A-Z]/.test(password)) strength += 1
    else suggestions.push('包含大写字母')

    // 数字检查
    if (/\d/.test(password)) strength += 1
    else suggestions.push('包含数字')

    // 特殊字符检查
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1
    else suggestions.push('包含特殊字符')

    return { strength, suggestions }
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return '弱'
    if (strength <= 3) return '中等'
    if (strength <= 4) return '强'
    return '很强
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm({ ...passwordForm, [field]: value })
    
    // 实时验证确认密码
    if (field === 'confirmPassword' && value !== passwordForm.newPassword) {
      setPasswordErrors(['两次输入的密码不一致'])
    } else if (field === 'newPassword') {
      const { suggestions } = checkPasswordStrength(value)
      setPasswordErrors(suggestions)
    } else {
      setPasswordErrors([])
    }
  }

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    const errors: string[] = []
    const { strength, suggestions } = checkPasswordStrength(passwordForm.newPassword)
    
    if (!passwordForm.currentPassword) {
      errors.push('请输入当前密码')
    }
    
    if (!passwordForm.newPassword) {
      errors.push('请输入新密码')
    } else if (strength < 3) {
      errors.push(...suggestions)
    }
    
    if (!passwordForm.confirmPassword) {
      errors.push('请确认新密码')
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.push('两次输入的密码不一致')
    }
    
    if (errors.length > 0) {
      setPasswordErrors(errors)
      alert('请检查密码设置：\n' + errors.join('\n'))
      return
    }

    setSaving(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('密码修改成功')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordErrors([])
    } catch (error) {
      alert('密码修改失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const toggleTwoFactorAuth = () => {
    alert('两步验证功能即将上线')
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>"
        <h1 className="text-2xl font-bold text-gray-900">安全设置</h1>"
        <p className="text-gray-600 mt-1">保护您的账户安全</p>
      </div>
"
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：密码设置 */}
        <div>
          <Card>
            <CardHeader>"
              <CardTitle className="flex items-center">"
                <Key className="w-5 h-5 mr-2 text-blue-600" />
                修改密码
              </CardTitle>
            </CardHeader>
            <CardContent>"
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                {/* 当前密码 */}"
                <div className="space-y-2">"
                  <Label htmlFor="currentPassword">当前密码</Label>"
                  <div className="relative">
                    <Input"
                      id="currentPassword""
                      type={showPassword  "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="请输入当前密码"
                    />
                    <button"
                      type="button""
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword  ("
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : ("
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 新密码 */}"
                <div className="space-y-2">"
                  <Label htmlFor="newPassword">新密码</Label>"
                  <div className="relative">
                    <Input"
                      id="newPassword""
                      type={showNewPassword  "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="请输入新密码"
                    />
                    <button"
                      type="button""
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword  ("
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : ("
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  
                  {/* 密码强度指示器 */}
                  {passwordForm.newPassword && ("
                    <div className="pt-2">"
                      <div className="flex items-center justify-between mb-1">"
                        <span className="text-sm text-gray-600">密码强度</span>
                        <span className={`text-sm font-medium ${
                          checkPasswordStrength(passwordForm.newPassword).strength <= 2  'text-red-600' :
                          checkPasswordStrength(passwordForm.newPassword).strength <= 3  'text-yellow-600' :
                          checkPasswordStrength(passwordForm.newPassword).strength <= 4  'text-blue-600' :
                          'text-green-600'`
                        }`}>
                          {getPasswordStrengthText(checkPasswordStrength(passwordForm.newPassword).strength)}
                        </span>
                      </div>"
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div `
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(checkPasswordStrength(passwordForm.newPassword).strength)}`}
                          style={{ `
                            width: `${(checkPasswordStrength(passwordForm.newPassword).strength / 5) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 确认密码 */}"
                <div className="space-y-2">"
                  <Label htmlFor="confirmPassword">确认新密码</Label>"
                  <div className="relative">
                    <Input"
                      id="confirmPassword""
                      type={showConfirmPassword  "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="请再次输入新密码"
                    />
                    <button"
                      type="button""
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword  ("
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : ("
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 提交按钮 */}
                <Button "
                  type="submit" "
                  className="w-full" 
                  disabled={saving}
                >
                  {saving  '正在保存...' : '修改密码'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：安全功能 */}"
        <div className="space-y-6">
          {/* 两步验证 */}
          <Card>
            <CardHeader>"
              <CardTitle className="flex items-center justify-between">"
                <div className="flex items-center">"
                  <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                  两步验证
                </div>"
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  未开启
                </span>
              </CardTitle>
            </CardHeader>"
            <CardContent className="space-y-4">"
              <p className="text-gray-600 text-sm">
                为您的账户添加额外的安全保护层，即使密码泄露也能防止未授权访问
              </p>"
              <div className="flex items-center space-x-2 text-sm text-gray-500">"
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>短信验证</span>
              </div>"
              <div className="flex items-center space-x-2 text-sm text-gray-500">"
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>身份验证器应用</span>
              </div>"
              <div className="flex items-center space-x-2 text-sm text-gray-500">"
                <XCircle className="w-4 h-4 text-gray-300" />
                <span>备用恢复码</span>
              </div>
              <Button 
                onClick={toggleTwoFactorAuth}"
                className="w-full""
                variant="outline"
              >
                开启两步验证
              </Button>
            </CardContent>
          </Card>

          {/* 登录活动 */}
          <Card>
            <CardHeader>"
              <CardTitle className="flex items-center">"
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                最近登录活动
              </CardTitle>
            </CardHeader>
            <CardContent>"
              <div className="space-y-3">
                {[
                  { device: 'Windows Chrome', location: '北京', time: '今天 14:30', status: 'success' },
{ device: 'iPhone Safari', location: '上海', time: '昨天 16:45', status: 'success' },
{ device: 'Android Chrome', location: '广州', time: '3天前 09:12', status: 'warning' }
                ].map((login, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">"
                    <div className="flex-1">"
                      <div className="flex items-center">"
                        <span className="font-medium text-gray-900">{login.device}</span>
                        {login.status === 'warning' && ("
                          <AlertTriangle className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                      </div>"
                      <div className="text-sm text-gray-600 mt-1">
                        {login.location} · {login.time}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      login.status === 'success'  'bg-green-500' : 'bg-yellow-500'`
                    }`}></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
'"`