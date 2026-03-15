'use client';
'
import { useState, useMemo, useRef } from 'react';
import { useRepairShops } from '@/hooks/useRepairShopData';
import { useRepairShopInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useRepairShopErrorHandler } from '@/hooks/useRepairShopErrorHandler';
import { EnhancedErrorBoundary } from '@/components/enhanced-error-boundary';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Wrench,
  Search,
  Filter,
  MapPin,
  Phone,
  Star,
  Clock,
  Award,
  MessageSquare,
  Calendar,
  User,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

interface RepairShop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  services: string[];
  priceRange: string;
  distance: string;
  image: string;
  isFavorite: boolean;
}

function RepairShopPageContent() {'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 初始化错误处理Hook
  const { addError, clearErrors, hasCriticalError, errors } =
    useRepairShopErrorHandler({
      maxRetries: 2,
      retryDelay: 1500,
      autoRetry: true,
      showUserNotifications: true,
      logToConsole: true,
    });

  // 使用传统的分页方式
  const {
    data: paginatedData,
    isLoading: isPaginatedLoading,
    isError: isPaginatedError,
    error: paginatedError,
    refetch: refetchPaginated,
  } = useRepairShops({
    page: 1,
    pageSize: 20,
    search: searchTerm,
    service: selectedService !== 'all'  selectedService : undefined,
    lat: 39.9042,
    lng: 116.4074,
  });

  // 使用无限滚动方式
  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    refresh: refreshInfinite,
    error: infiniteError,
  } = useRepairShopInfiniteScroll(
    {
      search: searchTerm,
      service: selectedService !== 'all'  selectedService : undefined,
      lat: 39.9042,
      lng: 116.4074,
    },
{
      initialPage: 1,
      pageSize: 10,
      threshold: 100,
    }
  );

  // 根据模式选择数据源
  const currentData = enableInfiniteScroll
     (infiniteData as RepairShop[])
    : paginatedData.data || [];
  const isLoading = enableInfiniteScroll
     isInfiniteLoading
    : isPaginatedLoading;
  const error = enableInfiniteScroll  infiniteError : paginatedError;

  // 错误处理
  if (error) {
    addError(error, {
      component: 'RepairShopPage',
      operation: enableInfiniteScroll  'infinite-scroll' : 'pagination',
      searchTerm,
      selectedService,
    });
  }

  // 计算统计数据
  const stats = useMemo(() => {
    return {
      total: paginatedData.count || 0,
      currentPage: paginatedData.currentPage || 1,
      totalPages: paginatedData.totalPages || 1,
      showing: currentData.length,
    };
  }, [paginatedData, currentData]);

  // 包装刷新函数
  const handleRefresh = () => {
    clearErrors(); // 清除之前的错误
    if (enableInfiniteScroll) {
      refreshInfinite();
    } else {
      refetchPaginated();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">"
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return ("
    <div className="min-h-screen bg-gray-50 py-8">"
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 错误状态显示 */}
        {hasCriticalError && ("
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">"
            <div className="flex justify-between items-start">
              <div>"
                <h3 className="font-medium text-red-800 mb-2">遇到一些问题</h3>"
                <div className="space-y-1">
                  {errors.slice(0, 2).map(err => (
                    <p key={err.id} className="text-sm text-red-700">
                      {err.userMessage}
                    </p>
                  ))}
                </div>
              </div>"
              <div className="flex gap-2">
                <Button
                  onClick={handleRefresh}"
                  size="sm""
                  variant="outline""
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  重试
                </Button>
                <Button
                  onClick={clearErrors}"
                  size="sm""
                  variant="ghost""
                  className="text-red-600 hover:bg-red-100"
                >
                  清除
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* 页面标题 */}"
        <div className="mb-8">"
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">"
            <Wrench className="w-8 h-8 mr-3 text-blue-600" />
            维修店铺
          </h1>"
          <p className="text-gray-600">
            附近的专业手机维修服务，品质保障，价格透明
          </p>
        </div>

        {/* 搜索和筛选区域 */}"
        <Card className="mb-8">"
          <CardContent className="p-6">"
            <div className="space-y-4">"
              <div className="flex flex-col md:flex-row gap-4">
                {/* 搜索框 */}"
                <div className="flex-1 relative">"
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input"
                    type="text""
                    placeholder="搜索店铺名称或服务项..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}"
                    className="pl-10 w-full"
                  />
                </div>

                {/* 服务筛选 */}"
                <div className="flex gap-2">
                  <select
                    value={selectedService}
                    onChange={e => setSelectedService(e.target.value)}"
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >"
                    <option value="all">全部服务</option>"
                    <option value="iPhone维修">iPhone维修</option>"
                    <option value="安卓维修">安卓维修</option>"
                    <option value="屏幕更换">屏幕更换</option>"
                    <option value="电池更换">电池更换</option>
                  </select>
                </div>
              </div>

              {/* 加载模式切换 */}"
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">"
                <div className="flex items-center space-x-4">"
                  <span className="text-sm text-gray-600">加载模式:</span>"
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setEnableInfiniteScroll(false)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        !enableInfiniteScroll
                           'bg-white text-gray-900 shadow-sm''
                          : 'text-gray-600 hover:text-gray-900'`
                      }`}
                    >
                      传统分页
                    </button>
                    <button
                      onClick={() => setEnableInfiniteScroll(true)}`
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        enableInfiniteScroll'
                           'bg-white text-gray-900 shadow-sm''
                          : 'text-gray-600 hover:text-gray-900'`
                      }`}
                    >
                      无限滚动
                    </button>
                  </div>
                </div>
"
                <div className="flex items-center space-x-2">
                  <Button"
                    variant="outline""
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw'`
                      className={`w-4 h-4 mr-2 ${isLoading  'animate-spin' : ''}`}
                    />
                    刷新
                  </Button>
"
                  <div className="text-sm text-gray-600">
                    共 {stats.total} 家店铺
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 店铺列表 */}"
        <div className="space-y-6">
          {currentData.map((shop: RepairShop) => ("
            <Card key={shop.id} className="hover:shadow-lg transition-shadow">"
              <CardContent className="p-6">"
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* 店铺图片 */}"
                  <div className="flex-shrink-0">"
                    <div className="bg-gray-200 w-32 h-32 rounded-lg flex items-center justify-center">"
                      <Wrench className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>

                  {/* 店铺信息 */}"
                  <div className="flex-1">"
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>"
                        <div className="flex items-center space-x-3 mb-2">"
                          <h3 className="text-xl font-bold text-gray-900">
                            {shop.name}
                          </h3>
                          {shop.isFavorite && ("
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              收藏
                            </span>
                          )}
                        </div>
"
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">"
                          <div className="flex items-center">"
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span>{shop.rating}</span>"
                            <span className="mx-1">·</span>
                            <span>{shop.reviewCount}条评价</span>
                          </div>"
                          <div className="flex items-center">"
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{shop.distance}</span>
                          </div>
                        </div>
                      </div>
"
                      <div className="flex items-center space-x-2 mt-2 sm:mt-0">"
                        <span className="text-lg font-semibold text-gray-900">
                          {shop.priceRange}
                        </span>
                      </div>
                    </div>
"
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">"
                      <div className="flex items-center text-gray-600">"
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />"
                        <span className="text-sm">{shop.address}</span>
                      </div>"
                      <div className="flex items-center text-gray-600">"
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />"
                        <span className="text-sm">{shop.phone}</span>
                      </div>
                    </div>
"
                    <div className="mb-4">"
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        提供的服务
                      </h4>"
                      <div className="flex flex-wrap gap-2">
                        {shop.services.map((service: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}"
                  <div className="flex flex-col space-y-2 md:w-32">"
                    <Button className="w-full">"
                      <Phone className="w-4 h-4 mr-2" />
                      致电
                    </Button>"
                    <Button variant="outline" className="w-full">"
                      <MessageSquare className="w-4 h-4 mr-2" />
                      咨询
                    </Button>"
                    <Button variant="outline" className="w-full">"
                      <Calendar className="w-4 h-4 mr-2" />
                      预约
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 无限滚动加载指示器 */}
        {enableInfiniteScroll && ("
          <div className="py-8">
            {isFetchingNextPage && ("
              <div className="flex items-center justify-center py-4">"
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>"
                <span className="text-gray-600">加载更多店铺...</span>
              </div>
            )}

            {!hasNextPage && currentData.length > 0 && ("
              <div className="text-center py-6 text-gray-500">
                <p>已加载全部 {currentData.length} 家店铺</p>
              </div>
            )}
"
            <div ref={loadMoreRef} className="h-1"></div>
          </div>
        )}

        {/* 传统分页控制 */}
        {!enableInfiniteScroll && stats.totalPages > 1 && ("
          <div className="flex items-center justify-between px-4 py-3 border-t mt-8">"
            <div className="text-sm text-gray-700">
              显示第 1 到 {Math.min(20, stats.total)} 条，共 {stats.total}{' '}
              条记录
            </div>
            <div className="flex gap-2">"
              <Button variant="outline" size="sm" disabled={true}>
                上一页
              </Button>"
              <Button variant="outline" size="sm" disabled={true}>
                下一页
              </Button>
            </div>
          </div>
        )}

        {currentData.length === 0 && !hasCriticalError && ("
          <div className="text-center py-12">"
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />"
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              没有找到相关店铺
            </h3>"
            <p className="text-gray-600">请尝试调整搜索条件或筛选选项</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 主组件，包装错误边界
export default function RepairShopPage() {
  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo) => {
        console.error('维修店页面错误', error, errorInfo);
      }}
      showDetails={false}
    >
      <RepairShopPageContent />
    </EnhancedErrorBoundary>
  );
}
