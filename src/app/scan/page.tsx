'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

interface RepairShop {
  id: string;
  name: string;
  slug: string;
  contact_person: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  services: string[];
  specialties: string[];
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  distance: number;
}

interface DeviceDetectionResult {
  deviceType: string;
  brand: string;
  model: string;
  confidence: number;
}

export default function ScanLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedDevice, setDetectedDevice] = useState<DeviceDetectionResult | null>(null);
  const [showManuals, setShowManuals] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [nearbyShops, setNearbyShops] = useState<RepairShop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('zh');

  useEffect(() => {
    if (productId) {
      fetchProductInfo(productId);
      detectDeviceFromUserAgent();
      fetchNearbyShops();
    } else {
      setError('缺少产品ID参数');
      setLoading(false);
    }
  }, [productId]);

  // 获取产品信息
  const fetchProductInfo = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('产品未找到');
      }
      
      const data = await response.json();
      setProduct(data.product);
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
      confidence: 0
    };

    // iOS设备检测
    if (userAgent.includes('iphone')) {
      detectionResult.deviceType = 'smartphone';
      detectionResult.brand = 'Apple';
      detectionResult.model = 'iPhone';
      detectionResult.confidence = 90;
      
      // 尝试获取具体型号
      const iPhoneModels = [
        'iphone se', 'iphone 15', 'iphone 14', 'iphone 13', 'iphone 12',
        'iphone 11', 'iphone xs', 'iphone xr', 'iphone x'
      ];
      
      for (const model of iPhoneModels) {
        if (userAgent.includes(model.replace(' ', ''))) {
          detectionResult.model = model.toUpperCase();
          detectionResult.confidence = 95;
          break;
        }
      }
    }
    // Android设备检测
    else if (userAgent.includes('android')) {
      detectionResult.deviceType = 'smartphone';
      detectionResult.confidence = 80;
      
      // 品牌检测
      const androidBrands = [
        { brand: 'Samsung', identifiers: ['sm-', 'samsung'] },
        { brand: 'Huawei', identifiers: ['huawei', 'honor'] },
        { brand: 'Xiaomi', identifiers: ['xiaomi', 'redmi', 'poco'] },
        { brand: 'OPPO', identifiers: ['oppo'] },
        { brand: 'Vivo', identifiers: ['vivo'] }
      ];
      
      for (const brandInfo of androidBrands) {
        if (brandInfo.identifiers.some(id => userAgent.includes(id))) {
          detectionResult.brand = brandInfo.brand;
          detectionResult.confidence = 85;
          break;
        }
      }
      
      // 型号提取（简化版）
      const modelMatch = userAgent.match(/\(([^)]+)\)/);
      if (modelMatch && modelMatch[1]) {
        detectionResult.model = modelMatch[1].split(';')[0].trim();
      }
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

  // 获取附近维修店
  const fetchNearbyShops = async () => {
    try {
      setShopsLoading(true);
      
      // 获取用户当前位置
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              const response = await fetch(
                `/api/shops/nearby?lat=${latitude}&lng=${longitude}&radius=20&limit=5`
              );
              
              if (response.ok) {
                const result = await response.json();
                if (result.success) {
                  setNearbyShops(result.data);
                }
              }
            } catch (err) {
              console.error('获取附近店铺失败:', err);
            } finally {
              setShopsLoading(false);
            }
          },
          (error) => {
            console.error('获取位置失败:', error);
            setShopsLoading(false);
          }
        );
      } else {
        // 如果不支持地理位置，使用默认位置（北京）
        const response = await fetch(
          `/api/shops/nearby?lat=39.9042&lng=116.4074&radius=20&limit=5`
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setNearbyShops(result.data);
          }
        }
        setShopsLoading(false);
      }
    } catch (err) {
      console.error('获取附近店铺失败:', err);
      setShopsLoading(false);
    }
  };

  // 手动选择设备类型
  const handleDeviceSelection = (deviceType: string, brand: string, model: string) => {
    setDetectedDevice({
      deviceType,
      brand,
      model,
      confidence: 100
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
    return product.manuals.filter(manual => 
      manual.is_published && manual.language_codes.includes(currentLanguage)
    );
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

  if (error) {
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
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">FixCycle</h1>
            <div className="text-sm text-gray-500">
              产品ID: {productId}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {product && (
          <>
            {/* 产品信息卡片 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
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
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🎯 设备识别
              </h3>
              
              {detectedDevice ? (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        检测到您的设备: <span className="text-blue-600">{detectedDevice.brand} {detectedDevice.model}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        设备类型: {detectedDevice.deviceType} | 置信度: {detectedDevice.confidence}%
                      </p>
                    </div>
                    <div className="text-2xl">
                      {detectedDevice.brand === 'Apple' ? '🍎' : 
                       detectedDevice.brand === 'Samsung' ? '📱' : 
                       detectedDevice.deviceType === 'computer' ? '💻' : '📱'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">无法自动识别您的设备，请手动选择:</p>
                </div>
              )}

              {/* 手动选择设备 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'smartphone', brand: 'Apple', model: 'iPhone', icon: '🍎' },
                  { type: 'smartphone', brand: 'Samsung', model: 'Galaxy', icon: '📱' },
                  { type: 'computer', brand: 'Apple', model: 'Mac', icon: '💻' },
                  { type: 'computer', brand: 'PC', model: 'Windows', icon: '🖥️' }
                ].map((device) => (
                  <button
                    key={`${device.brand}-${device.model}`}
                    onClick={() => handleDeviceSelection(device.type, device.brand, device.model)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      detectedDevice?.brand === device.brand && detectedDevice?.model === device.model
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{device.icon}</div>
                    <div className="text-xs font-medium">{device.brand}</div>
                    <div className="text-xs text-gray-500">{device.model}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 多语言切换 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
                  <p className="text-sm text-gray-600 mb-2">当前语言可用说明书:</p>
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
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* 说明书功能 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">📖</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">查看说明书</h3>
                      <p className="text-gray-600">获取详细的产品使用指南</p>
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
                    disabled={!detectedDevice || getCurrentLanguageManuals().length === 0}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      detectedDevice && getCurrentLanguageManuals().length > 0
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {detectedDevice 
                      ? (getCurrentLanguageManuals().length > 0 ? '查看说明书' : '暂无说明书')
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
                      <h3 className="text-xl font-semibold text-gray-800">故障诊断</h3>
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

            {/* 附近维修店推荐 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">🏪</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">附近维修店推荐</h3>
                    <p className="text-gray-600">为您找到附近的优质维修服务商</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  基于您的位置推荐
                </div>
              </div>
              
              {shopsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">正在查找附近的维修店...</p>
                  </div>
                </div>
              ) : nearbyShops.length > 0 ? (
                <div className="space-y-4">
                  {nearbyShops.map((shop) => (
                    <div key={shop.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-semibold text-gray-800 mr-2">{shop.name}</h4>
                            {shop.is_verified && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                官方认证
                              </span>
                            )}
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {shop.distance.toFixed(1)}km
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="mr-4">📞 {shop.phone}</span>
                            <span>{shop.city} · {shop.province}</span>
                          </div>
                          
                          <p className="text-gray-700 text-sm mb-3">{shop.address}</p>
                          
                          <div className="flex items-center mb-2">
                            <div className="flex items-center mr-4">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i}
                                  className={`text-lg ${i < Math.floor(shop.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="ml-2 text-sm text-gray-600">
                                {shop.rating?.toFixed(1) || '暂无评分'} ({shop.review_count || 0}条评价)
                              </span>
                            </div>
                          </div>
                          
                          {shop.services && shop.services.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {shop.services.slice(0, 3).map((service, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {service}
                                </span>
                              ))}
                              {shop.services.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  +{shop.services.length - 3}项服务
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <button className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                          联系店铺
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4 border-t border-gray-200">
                    <button className="text-blue-500 hover:text-blue-700 font-medium">
                      查看更多维修店 →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🏪</div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">暂无附近维修店信息</h4>
                  <p className="text-gray-600 mb-4">您可以尝试手动搜索或扩大搜索范围</p>
                  <button 
                    onClick={fetchNearbyShops}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    重新搜索
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}