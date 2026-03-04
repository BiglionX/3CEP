'use client';

import EventCard from '@/components/device/EventCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DEVICE_STATUS_LABELS,
  DeviceEventType,
  DeviceStatus,
  STATUS_COLORS,
} from '@/lib/constants/lifecycle';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  model: string;
  category: string;
  description: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo_url: string;
  };
  manuals: Array<{
    id: string;
    title: Record<string, string>;
    language_codes: string[];
    is_published: boolean;
  }>;
}

interface DeviceProfile {
  id: string;
  qrcodeId: string;
  productModel: string;
  productCategory?: string;
  brandName?: string;
  serialNumber?: string;
  manufacturingDate?: string;
  firstActivatedAt?: string;
  warrantyStartDate?: string;
  warrantyExpiry?: string;
  warrantyPeriod?: number;
  currentStatus: DeviceStatus;
  lastEventAt?: string;
  lastEventType?: DeviceEventType;
  totalRepairCount: number;
  totalPartReplacementCount: number;
  totalTransferCount: number;
  currentLocation?: string;
  createdAt: string;
  updatedAt: string;
}

interface LifecycleEvent {
  id: string;
  eventType: DeviceEventType;
  eventSubtype?: string;
  eventTimestamp: string;
  location?: string;
  notes?: string;
  eventData?: Record<string, any>;
  isVerified?: boolean;
}

interface DeviceDetectionResult {
  deviceType: string;
  brand: string;
  model: string;
  confidence: number;
}

export default function ScanLandingPage() {
  const params = useParams();
  const router = useRouter();
  const qrcodeId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile | null>(
    null
  );
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedDevice, setDetectedDevice] =
    useState<DeviceDetectionResult | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  const [activeTab, setActiveTab] = useState('manuals');

  useEffect(() => {
    if (qrcodeId) {
      fetchProductInfo();
      detectDeviceFromUserAgent();
    } else {
      setError('缺少二维码ID参数');
      setLoading(false);
    }
  }, [qrcodeId]);

  // 获取产品信息
  const fetchProductInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/by-qrcode/${qrcodeId}`);

      if (!response.ok) {
        // 如果通过二维码找不到产品，尝试通过产品ID查找
        const fallbackResponse = await fetch(`/api/products/${qrcodeId}`);
        if (!fallbackResponse.ok) {
          throw new Error('产品未找到');
        }
        const fallbackData = await fallbackResponse.json();
        setProduct(fallbackData.product);
      } else {
        const data = await response.json();
        setProduct(data.product);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取产品信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 从User-Agent检测设备信息
  const detectDeviceFromUserAgent = () => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const detectionResult: DeviceDetectionResult = {
      deviceType: 'unknown',
      brand: 'unknown',
      model: 'unknown',
      confidence: 0,
    };

    // iOS设备检测
    if (userAgent.includes('iphone')) {
      detectionResult.deviceType = 'smartphone';
      detectionResult.brand = 'Apple';
      detectionResult.model = 'iPhone';
      detectionResult.confidence = 90;
    }
    // Android设备检测
    else if (userAgent.includes('android')) {
      detectionResult.deviceType = 'smartphone';
      detectionResult.confidence = 80;
      detectionResult.brand = 'Android设备';
      detectionResult.model = '智能手机';
    }
    // Windows设备检测
    else if (userAgent.includes('windows')) {
      detectionResult.deviceType = 'computer';
      detectionResult.brand = 'PC';
      detectionResult.model = 'Windows PC';
      detectionResult.confidence = 70;
    }
    // Mac设备检测
    else if (userAgent.includes('macintosh')) {
      detectionResult.deviceType = 'computer';
      detectionResult.brand = 'Apple';
      detectionResult.model = 'Mac';
      detectionResult.confidence = 85;
    }

    setDetectedDevice(detectionResult);
  };

  // 加载设备档案
  const loadDeviceProfile = async () => {
    try {
      setProfileLoading(true);
      setError(null);

      const response = await fetch(
        `/api/lifecycle/profile?qrcodeId=${qrcodeId}`,
        {
          headers: {
            Authorization: `Bearer ${
              process.env.NEXT_PUBLIC_LIFECYCLE_API_KEY || 'dev-key'
            }`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setDeviceProfile(result.data.profile);
        setLifecycleEvents(result.data.events || []);
      } else {
        setError(result.error || '获取设备档案失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setProfileLoading(false);
      setEventsLoading(false);
    }
  };

  // 手动选择设备类型
  const handleDeviceSelection = (
    deviceType: string,
    brand: string,
    model: string
  ) => {
    setDetectedDevice({
      deviceType,
      brand,
      model,
      confidence: 100,
    });
  };

  // 跳转到说明书页面
  const goToManuals = () => {
    if (product) {
      router.push(`/manuals/${product.id}`);
    }
  };

  // 跳转到诊断页面
  const goToDiagnosis = () => {
    if (product) {
      router.push(`/diagnosis/${product.id}`);
    }
  };

  // 切换语言
  const switchLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  // 获取当前语言的说明书
  const getCurrentLanguageManuals = () => {
    if (!product?.manuals) return [];
    return product.manuals.filter(
      manual =>
        manual.is_published && manual.language_codes.includes(currentLanguage)
    );
  };

  // Tab切换时加载数据
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'archive' && !deviceProfile) {
      loadDeviceProfile();
    }
  };

  // 格式化日期
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '无';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载产品信息...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">加载失败</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">FixCycle</h1>
              <div className="hidden sm:block">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  二维码: {qrcodeId}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              返回
            </button>
          </div>

          {/* 设备状态标识 */}
          {deviceProfile && (
            <div className="mt-3 flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  STATUS_COLORS[deviceProfile.currentStatus]
                }`}
              >
                {DEVICE_STATUS_LABELS[deviceProfile.currentStatus]}
              </span>
              <span className="text-sm text-gray-500">
                最后更新: {formatDate(deviceProfile.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {product && (
          <Tabs
            defaultValue="manuals"
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="manuals">说明书/AI诊断</TabsTrigger>
              <TabsTrigger value="archive">设备档案</TabsTrigger>
            </TabsList>

            {/* 说明书/AI诊断 Tab */}
            <TabsContent value="manuals">
              <div className="space-y-8">
                {/* 产品信息卡片 */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {product.brand.logo_url && (
                        <img
                          src={product.brand.logo_url}
                          alt={product.brand.name}
                          className="w-16 h-16 rounded-lg object-contain"
                        />
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {product.name}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {product.brand.name}
                          </span>
                          {product.model && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {product.model}
                            </span>
                          )}
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {product.category}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-gray-600">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 设备检测区域 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    🎯 设备识别
                  </h3>

                  {detectedDevice ? (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            检测到您的设备:{' '}
                            <span className="text-blue-600">
                              {detectedDevice.brand} {detectedDevice.model}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            设备类型: {detectedDevice.deviceType} | 置信度:{' '}
                            {detectedDevice.confidence}%
                          </p>
                        </div>
                        <div className="text-2xl">
                          {detectedDevice.brand === 'Apple'
                            ? '🍎'
                            : detectedDevice.brand === 'Samsung'
                              ? '📱'
                              : detectedDevice.deviceType === 'computer'
                                ? '💻'
                                : '📱'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700">
                        无法自动识别您的设备，请手动选择:
                      </p>
                    </div>
                  )}

                  {/* 手动选择设备 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        type: 'smartphone',
                        brand: 'Apple',
                        model: 'iPhone',
                        icon: '🍎',
                      },
                      {
                        type: 'smartphone',
                        brand: 'Samsung',
                        model: 'Galaxy',
                        icon: '📱',
                      },
                      {
                        type: 'computer',
                        brand: 'Apple',
                        model: 'Mac',
                        icon: '💻',
                      },
                      {
                        type: 'computer',
                        brand: 'PC',
                        model: 'Windows',
                        icon: '🖥️',
                      },
                    ].map(device => (
                      <button
                        key={`${device.brand}-${device.model}`}
                        onClick={() =>
                          handleDeviceSelection(
                            device.type,
                            device.brand,
                            device.model
                          )
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          detectedDevice?.brand === device.brand &&
                          detectedDevice?.model === device.model
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{device.icon}</div>
                        <div className="text-xs font-medium">
                          {device.brand}
                        </div>
                        <div className="text-xs text-gray-500">
                          {device.model}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 多语言切换 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    🌐 语言选择
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => switchLanguage('zh')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentLanguage === 'zh'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      中文
                    </button>
                    <button
                      onClick={() => switchLanguage('en')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentLanguage === 'en'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      English
                    </button>
                  </div>

                  {getCurrentLanguageManuals().length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        当前语言可用说明书:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getCurrentLanguageManuals().map(manual => (
                          <span
                            key={manual.id}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                          >
                            {manual.title[currentLanguage]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 功能选择区域 */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 说明书功能 */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="text-3xl mr-3">📖</div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            查看说明书
                          </h3>
                          <p className="text-gray-600">
                            获取详细的产品使用指南
                          </p>
                        </div>
                      </div>

                      {getCurrentLanguageManuals().length > 0 ? (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {getCurrentLanguageManuals().map(manual => (
                              <span
                                key={manual.id}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                              >
                                {manual.title[currentLanguage]}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            当前语言暂无说明书
                          </span>
                        </div>
                      )}

                      <button
                        onClick={goToManuals}
                        disabled={
                          !detectedDevice ||
                          getCurrentLanguageManuals().length === 0
                        }
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          detectedDevice &&
                          getCurrentLanguageManuals().length > 0
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {detectedDevice
                          ? getCurrentLanguageManuals().length > 0
                            ? '查看说明书'
                            : '暂无说明书'
                          : '请先识别设备'}
                      </button>
                    </div>
                  </div>

                  {/* 故障诊断功能 */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="text-3xl mr-3">🔧</div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            故障诊断
                          </h3>
                          <p className="text-gray-600">AI智能诊断设备问题</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          AI智能分析
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          多轮对话支持
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          解决方案推荐
                        </div>
                      </div>

                      <button
                        onClick={goToDiagnosis}
                        disabled={!detectedDevice}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          detectedDevice
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {detectedDevice ? '开始诊断' : '请先识别设备'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 设备档案 Tab */}
            <TabsContent value="archive">
              <div className="space-y-6">
                {profileLoading ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在加载设备档案...</p>
                  </div>
                ) : error ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      加载失败
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={loadDeviceProfile}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      重新加载
                    </button>
                  </div>
                ) : deviceProfile ? (
                  <>
                    {/* 设备档案摘要 */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">
                          设备档案摘要
                        </h2>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">
                              基本信息
                            </h3>
                            <dl className="space-y-2">
                              <div>
                                <dt className="text-sm text-gray-600">
                                  产品型号
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {deviceProfile.productModel}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-600">品牌</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {deviceProfile.brandName || '未知'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-600">
                                  序列号
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {deviceProfile.serialNumber || '无'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-600">
                                  制造日期
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {formatDate(deviceProfile.manufacturingDate)}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">
                              状态信息
                            </h3>
                            <dl className="space-y-2">
                              <div>
                                <dt className="text-sm text-gray-600">
                                  当前状态
                                </dt>
                                <dd>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      STATUS_COLORS[deviceProfile.currentStatus]
                                    }`}
                                  >
                                    {
                                      DEVICE_STATUS_LABELS[
                                        deviceProfile.currentStatus
                                      ]
                                    }
                                  </span>
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-600">
                                  首次激活
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {formatDate(deviceProfile.firstActivatedAt)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-600">
                                  最后事件
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {formatDate(deviceProfile.lastEventAt)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-600">
                                  当前位置
                                </dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {deviceProfile.currentLocation || '未知'}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                        {/* 统计信息 */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h3 className="text-sm font-medium text-gray-500 mb-3">
                            维护统计
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {deviceProfile.totalRepairCount}
                              </div>
                              <div className="text-xs text-blue-500">
                                维修次数
                              </div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">
                                {deviceProfile.totalPartReplacementCount}
                              </div>
                              <div className="text-xs text-green-500">
                                换件次数
                              </div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">
                                {deviceProfile.totalTransferCount}
                              </div>
                              <div className="text-xs text-purple-500">
                                转移次数
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 生命周期事件列表 */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold text-gray-800">
                            生命周期事件
                          </h2>
                          <span className="text-sm text-gray-500">
                            {lifecycleEvents.length} 个事件
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        {lifecycleEvents.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                              <svg
                                className="mx-auto h-16 w-16"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-500 font-medium">
                              暂无生命周期记录
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              该设备还没有任何生命周期事件
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {lifecycleEvents.map(event => (
                              <EventCard
                                key={event.id}
                                event={{
                                  ...event,
                                  eventTimestamp: new Date(
                                    event.eventTimestamp
                                  ),
                                }}
                                onDetailClick={eventId => {
                                  // TODO: 实现查看维修工单详情功能
                                  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('查看工单详情:', eventId)}}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="mx-auto h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.324-.17.157-.32.327-.45.512-.13.185-.24.384-.33.597-.09.213-.16.436-.21.667-.05.231-.08.467-.08.703V21a1 1 0 102 0v-.793c0-.236.03-.472.08-.703.05-.231.12-.454.21-.667.09-.213.2-.412.33-.597.13-.185.28-.355.45-.512A7.962 7.962 0 0112 15c2.34 0 4.47-.881 6.08-2.324z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      未找到设备档案
                    </h3>
                    <p className="text-gray-600 mb-6">该设备尚未创建档案</p>
                    <button
                      onClick={loadDeviceProfile}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      加载档案
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
