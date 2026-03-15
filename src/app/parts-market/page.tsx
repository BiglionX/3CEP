'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Star, Package } from 'lucide-react';

interface Part {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  category: string;
  compatibleDevices: string[];
  description: string;
}

export default function PartsMarketPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('price');

  // 模拟数据
  useEffect(() => {
    setTimeout(() => {
      setParts([
        {
          id: '1',
          name: 'iPhone 14 屏幕总成',
          brand: '原装',
          model: 'iPhone 14',
          price: 899,
          originalPrice: 1299,
          image: '/images/parts/screen.jpg',
          rating: 4.8,
          reviewCount: 128,
          inStock: true,
          category: '屏幕',
          compatibleDevices: ['iPhone 14', 'iPhone 14 Plus'],
          description: '原装品质屏幕总成，支持原彩显示',
        },
        {
          id: '2',
          name: '华为P50 电池',
          brand: '原厂',
          model: 'P50',
          price: 299,
          image: '/images/parts/battery.jpg',
          rating: 4.6,
          reviewCount: 89,
          inStock: true,
          category: '电池',
          compatibleDevices: ['华为P50', '华为P50 Pro'],
          description: '4000mAh大容量电池，续航持久',
        },
        {
          id: '3',
          name: '小米13 摄像头模组',
          brand: '原装',
          model: '小米13',
          price: 459,
          originalPrice: 599,
          image: '/images/parts/camera.jpg',
          rating: 4.7,
          reviewCount: 67,
          inStock: false,
          category: '摄像头',
          compatibleDevices: ['小米13', '小米13 Pro'],
          description: '5000万像素主摄，光学防抖',
        },
        {
          id: '4',
          name: '三星S23 后盖',
          brand: '原装',
          model: 'Galaxy S23',
          price: 199,
          image: '/images/parts/back-cover.jpg',
          rating: 4.5,
          reviewCount: 45,
          inStock: true,
          category: '外壳',
          compatibleDevices: ['Galaxy S23', 'Galaxy S23+'],
          description: '原装后盖，完美贴合',
        },
        {
          id: '5',
          name: 'OPPO Find X5 充电头',
          brand: '官方',
          model: 'SuperVOOC',
          price: 159,
          image: '/images/parts/charger.jpg',
          rating: 4.9,
          reviewCount: 156,
          inStock: true,
          category: '充电器',
          compatibleDevices: ['OPPO Find X5', 'OPPO Find X5 Pro'],
          description: '80W超级闪充，快速补电',
        },
        {
          id: '6',
          name: 'iPhone 13 电池',
          brand: '原装',
          model: 'iPhone 13',
          price: 249,
          image: '/images/parts/battery-iphone.jpg',
          rating: 4.7,
          reviewCount: 203,
          inStock: true,
          category: '电池',
          compatibleDevices: ['iPhone 13', 'iPhone 13 Pro', 'iPhone 13 mini'],
          description: '3240mAh容量，续航更持久',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredParts = parts.filter(part => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedParts = [...filteredParts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">配件商城</h1>
          <p className="text-gray-600">精选优质手机配件，品质保障，价格实惠</p>
        </div>

        {/* 搜索和筛选区域 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="搜索配件名称或品牌..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* 分类筛选 */}
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">全部分类</option>
                  <option value="屏幕">屏幕</option>
                  <option value="电池">电池</option>
                  <option value="摄像头">摄像头</option>
                  <option value="外壳">外壳</option>
                  <option value="充电器">充电器</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="price">价格排序</option>
                  <option value="rating">评分排序</option>
                  <option value="reviews">评论数排序</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 配件列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedParts.map(part => (
            <Card key={part.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* 商品图片 */}
                <div className="relative mb-4">
                  <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>

                  {!part.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">缺货</span>
                    </div>
                  )}

                  {part.originalPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      特惠
                    </div>
                  )}
                </div>

                {/* 商品信息 */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {part.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {part.brand} · {part.model}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ¥{part.price}
                      </span>
                      {part.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ¥{part.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {part.rating}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({part.reviewCount})
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {part.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {part.compatibleDevices.slice(0, 2).map((device, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {device}
                      </span>
                    ))}
                    {part.compatibleDevices.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{part.compatibleDevices.length - 2} 更多
                      </span>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={!part.inStock}
                    variant={part.inStock  'default' : 'outline'}
                  >
                    {part.inStock  (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        加入购物车
                      </>
                    ) : (
                      '暂时缺货'
                    )}
                  </Button>

                  <Button variant="outline" size="icon">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedParts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              没有找到相关配件
            </h3>
            <p className="text-gray-600">请尝试调整搜索条件或筛选选项</p>
          </div>
        )}
      </div>
    </div>
  );
}
