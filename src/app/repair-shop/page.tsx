'use client';

import { useState } from 'react';
import { Wrench, Search, Phone, Star, MapPin, Calendar, MessageSquare } from 'lucide-react';

interface RepairShop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  services: string[];
  priceRange: string;
  distance?: string;
}

export default function RepairShopPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟数据
  const mockShops: RepairShop[] = [
    {
      id: '1',
      name: '极速手机维修',
      rating: 4.8,
      reviewCount: 256,
      address: '朝阳区建国路88号',
      phone: '010-12345678',
      services: ['iPhone维修', '屏幕更换', '电池更换'],
      priceRange: '100-500元',
      distance: '1.2km',
    },
    {
      id: '2',
      name: '专业手机服务中心',
      rating: 4.6,
      reviewCount: 189,
      address: '海淀区中关村大街',
      phone: '010-87654321',
      services: ['安卓维修', 'iPhone维修', '主板维修'],
      priceRange: '80-400元',
      distance: '2.5km',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Wrench className="w-8 h-8 mr-3 text-blue-600" />
            维修店铺
          </h1>
          <p className="text-gray-600">
            附近的专业手机维修服务，品质保障，价格透明
          </p>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索店铺名称或服务项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 店铺列表 */}
        <div className="space-y-4">
          {mockShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* 店铺信息 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-5 h-5 fill-current mr-1" />
                      <span className="font-semibold">{shop.rating}</span>
                      <span className="text-gray-400 ml-1">({shop.reviewCount}条评价)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{shop.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{shop.phone}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">服务项目:</span>
                      <div className="flex flex-wrap gap-2">
                        {shop.services.map((service, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 价格和操作 */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-lg font-semibold text-gray-900">
                    {shop.priceRange}
                  </div>
                  {shop.distance && (
                    <div className="text-sm text-gray-500">{shop.distance}</div>
                  )}
                  <div className="flex gap-2">
                    <a href={`tel:${shop.phone}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      致电
                    </a>
                    <a href="/contact" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      咨询
                    </a>
                    <a href="/repair-shop/appointment" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      预约
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
