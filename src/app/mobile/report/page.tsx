'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Smartphone, 
  Wrench, 
  MapPin, 
  Camera,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Tablet,
  Laptop,
  Monitor
} from 'lucide-react'

interface ReportFormData {
  deviceType: string
  brand: string
  model: string
  issue: string
  description: string
  location: string
  contact: string
  images: string[]
}

export default function MobileReportPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ReportFormData>({
    deviceType: '',
    brand: '',
    model: '',
    issue: '',
    description: '',
    location: '',
    contact: '',
    images: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const deviceTypes = [
    { id: 'phone', name: '手机', icon: Smartphone },
    { id: 'tablet', name: '平板', icon: Tablet },
    { id: 'laptop', name: '笔记本', icon: Laptop },
    { id: 'desktop', name: '台式机', icon: Monitor }
  ]

  const commonIssues = [
    '屏幕问题',
    '电池问题', 
    '无法开机',
    '系统故障',
    '摄像头故障',
    '扬声器问题',
    '充电问题',
    '其他问题'
  ]

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1:
        if (!formData.deviceType) newErrors.deviceType = '请选择设备类型'
        if (!formData.brand) newErrors.brand = '请输入品牌'
        if (!formData.model) newErrors.model = '请输入型号'
        break
      case 2:
        if (!formData.issue) newErrors.issue = '请选择故障类型'
        if (!formData.description.trim()) newErrors.description = '请描述具体问题'
        break
      case 3:
        if (!formData.location) newErrors.location = '请输入服务地址'
        if (!formData.contact) newErrors.contact = '请输入联系方式'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(Math.max(1, step - 1))
  }

  const handleInputChange = (field: keyof ReportFormData, value: string | string[]) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).slice(0, 3 - formData.images.length)
      const imageUrls = newImages.map(file => URL.createObjectURL(file))
      setFormData({
        ...formData,
        images: [...formData.images, ...imageUrls]
      })
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...formData.images]
    URL.revokeObjectURL(newImages[index])
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    setIsSubmitting(true)
    try {
      // 模拟提交API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('报修申请提交成功！')
      // 重置表单
      setFormData({
        deviceType: '',
        brand: '',
        model: '',
        issue: '',
        description: '',
        location: '',
        contact: '',
        images: []
      })
      setStep(1)
    } catch (error) {
      alert('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= num 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-300 text-gray-600'
          }`}>
            {step > num ? <CheckCircle className="w-4 h-4" /> : num}
          </div>
          {num < 3 && (
            <div className={`w-12 h-1 mx-2 ${
              step > num ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center">
        {step > 1 && (
          <button 
            onClick={prevStep}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900">快速报修</h1>
          <p className="text-sm text-gray-500">第 {step} 步，共 3 步</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="p-4">
        {renderStepIndicator()}

        {/* 步骤1: 设备信息 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">设备信息</h2>
              <p className="text-gray-600">请填写您的设备基本信息</p>
            </div>

            {/* 设备类型选择 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                设备类型 *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {deviceTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleInputChange('deviceType', type.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.deviceType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${
                        formData.deviceType === type.id 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        formData.deviceType === type.id 
                          ? 'text-blue-600' 
                          : 'text-gray-700'
                      }`}>
                        {type.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.deviceType && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.deviceType}
                </div>
              )}
            </div>

            {/* 品牌和型号 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  品牌 *
                </label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="如：苹果、华为、小米..."
                  className={errors.brand ? 'border-red-500' : ''}
                />
                {errors.brand && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.brand}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  型号 *
                </label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="如：iPhone 14 Pro、Mate 50..."
                  className={errors.model ? 'border-red-500' : ''}
                />
                {errors.model && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.model}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 步骤2: 故障描述 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">故障描述</h2>
              <p className="text-gray-600">请详细描述您遇到的问题</p>
            </div>

            {/* 常见问题选择 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                故障类型 *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {commonIssues.map((issue) => (
                  <button
                    key={issue}
                    onClick={() => handleInputChange('issue', issue)}
                    className={`p-3 rounded-lg text-sm text-left transition-colors ${
                      formData.issue === issue
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
              {errors.issue && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.issue}
                </div>
              )}
            </div>

            {/* 详细描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                详细描述 *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="请详细描述设备的具体问题、出现时间、使用情况等..."
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.description && (
                  <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </div>
                )}
                <span className="text-sm text-gray-500 ml-auto">
                  {formData.description.length}/300
                </span>
              </div>
            </div>

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                问题照片
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image} 
                          alt={`故障照片 ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                
                {formData.images.length < 3 && (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center py-4 cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-600">
                        上传照片 ({3 - formData.images.length}张剩余)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 步骤3: 服务信息 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">服务信息</h2>
              <p className="text-gray-600">请提供服务地址和联系方式</p>
            </div>

            {/* 服务地址 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                服务地址 *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="请输入详细地址"
                  className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.location && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.location}
                </div>
              )}
            </div>

            {/* 联系方式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系方式 *
              </label>
              <Input
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="请输入手机号码"
                type="tel"
                className={errors.contact ? 'border-red-500' : ''}
              />
              {errors.contact && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.contact}
                </div>
              )}
            </div>

            {/* 预估信息 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">服务预估</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 响应时间：30分钟内联系</li>
                <li>• 到达时间：2小时内上门</li>
                <li>• 服务费用：根据检测结果确定</li>
              </ul>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            {step < 3 ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  className="flex-1"
                  disabled={step === 1}
                >
                  上一步
                </Button>
                <Button 
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  下一步
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '提交报修'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}