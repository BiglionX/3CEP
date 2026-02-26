'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  QrCode
} from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const contactMethods = [
    {
      icon: Phone,
      title: '电话咨询',
      content: '400-888-9999',
      subtitle: '工作日 9:00-18:00',
      action: 'tel:400-888-9999'
    },
    {
      icon: Mail,
      title: '邮件联系',
      content: 'support@fixcycle.com',
      subtitle: '24小时内回复',
      action: 'mailto:support@fixcycle.com'
    },
    {
      icon: MessageSquare,
      title: '在线客服',
      content: '点击联系客服',
      subtitle: '实时在线服务',
      action: '#'
    },
    {
      icon: QrCode,
      title: '微信客服',
      content: '扫描二维码关注',
      subtitle: '微信在线咨询',
      action: '#'
    },
    {
      icon: Clock,
      title: '紧急维修',
      content: '400-999-8888',
      subtitle: '24小时紧急热线',
      action: 'tel:400-999-8888'
    },
    {
      icon: Building,
      title: '企业合作',
      content: 'biz@fixcycle.com',
      subtitle: 'B2B商务合作',
      action: 'mailto:biz@fixcycle.com'
    }
  ]

  const companyAddresses = [
    {
      city: '北京总部',
      address: '北京市朝阳区建国路88号现代城A座1501室',
      phone: '010-88889999'
    },
    {
      city: '上海分公司',
      address: '上海市浦东新区陆家嘴环路1000号恒生大厦2808室',
      phone: '021-66668888'
    },
    {
      city: '广州办事处',
      address: '广州市天河区珠江新城华夏路10号富力中心3205室',
      phone: '020-77776666'
    },
    {
      city: '深圳研发中心',
      address: '深圳市南山区科技园南区高新南一道001号',
      phone: '0755-55553333'
    }
  ]

  const socialMedia = [
    {
      platform: '微信公众号',
      icon: '📱',
      account: 'FixCycle官方',
      qrCode: '/images/wechat-qrcode.jpg'
    },
    {
      platform: '微博',
      icon: '💬',
      account: '@FixCycle官方',
      qrCode: '#'
    },
    {
      platform: '抖音',
      icon: '🎵',
      account: '@FixCycle科技',
      qrCode: '#'
    }
  ]

  const serviceChannels = [
    {
      channel: '技术支持',
      description: '设备维修技术问题咨询',
      responseTime: '30分钟内响应',
      available: true
    },
    {
      channel: '商务合作',
      description: '商户入驻和战略合作',
      responseTime: '1个工作日内响应',
      available: true
    },
    {
      channel: '媒体采访',
      description: '新闻媒体合作联系',
      responseTime: '2个工作日内响应',
      available: false
    },
    {
      channel: '投资者关系',
      description: '投资和融资相关咨询',
      responseTime: '3个工作日内响应',
      available: true
    }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入您的姓名'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = '请选择咨询主题'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = '请输入留言内容'
    } else if (formData.message.length < 10) {
      newErrors.message = '留言内容至少10个字符'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      
      // 3秒后重置成功状态
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      alert('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData({ ...formData, [field]: value })
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          联系我们
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          我们随时为您提供专业的技术支持和服务，期待与您的沟通
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 左侧：联系信息和表单 */}
        <div className="space-y-8">
          {/* 联系方式卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                    <a 
                      href={method.action} 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {method.content}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">{method.subtitle}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 联系表单 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                在线留言
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">提交成功</h3>
                  <p className="text-gray-600">我们已收到您的留言，将在24小时内回复您。</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={errors.name ? 'border-red-500' : ''}
                        placeholder="请输入您的姓名"
                      />
                      {errors.name && (
                        <div className="flex items-center text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱 *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                        placeholder="请输入您的邮箱"
                      />
                      {errors.email && (
                        <div className="flex items-center text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">电话</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="请输入您的电话"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">咨询主题 *</Label>
                      <select
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.subject ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">请选择咨询主题</option>
                        <option value="technical">技术支持</option>
                        <option value="business">商务合作</option>
                        <option value="complaint">投诉建议</option>
                        <option value="other">其他问题</option>
                      </select>
                      {errors.subject && (
                        <div className="flex items-center text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.subject}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">留言内容 *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className={`min-h-[120px] ${errors.message ? 'border-red-500' : ''}`}
                      placeholder="请详细描述您的问题或需求..."
                    />
                    <div className="flex justify-between items-center">
                      {errors.message && (
                        <div className="flex items-center text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.message}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 ml-auto">
                        {formData.message.length}/500
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        提交留言
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：公司地址信息 */}
        <div className="space-y-8">
          {/* 公司地址 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                公司地址
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {companyAddresses.map((address, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">
                      {address.city.substring(0, 1)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{address.city}</h3>
                    <p className="text-gray-600 text-sm mt-1">{address.address}</p>
                    <a 
                      href={`tel:${address.phone}`} 
                      className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                    >
                      📞 {address.phone}
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 工作时间 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                服务时间
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">工作日</span>
                  <span className="font-medium">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">周末</span>
                  <span className="font-medium">10:00 - 17:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">节假日</span>
                  <span className="font-medium text-orange-600">预约服务</span>
                </div>
                <div className="pt-4 text-sm text-gray-500">
                  <p>📞 紧急维修服务：24小时热线 400-888-9999</p>
                  <p className="mt-1">💬 在线客服：全天候为您服务</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 社交媒体 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2 text-blue-600" />
                关注我们
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialMedia.map((social, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{social.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{social.platform}</h3>
                      <p className="text-sm text-gray-600">{social.account}</p>
                    </div>
                    {social.qrCode !== '#' && (
                      <Button size="sm" variant="outline">
                        查看二维码
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 服务中心渠道 */}
          <Card>
            <CardHeader>
              <CardTitle>服务中心</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceChannels.map((channel, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{channel.channel}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${channel.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {channel.available ? '在线' : '离线'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{channel.description}</p>
                    <p className="text-xs text-gray-500">⏱️ 响应时间：{channel.responseTime}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ快速链接 */}
          <Card>
            <CardHeader>
              <CardTitle>常见问题</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  '如何预约上门维修服务？',
                  '维修费用如何计算？',
                  '保修期内免费维修吗？',
                  '如何查询维修进度？'
                ].map((question, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{question}</span>
                      <span className="text-blue-600 text-lg">›</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}