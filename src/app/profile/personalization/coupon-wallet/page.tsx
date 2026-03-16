"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Gift,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount: number;
  minAmount: number;
  type: 'percentage' | 'fixed';
  category: 'all' | 'shipping' | 'product' | 'special';
  status: 'available' | 'used' | 'expired';
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  description: string;
}

export default function CouponWalletPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const coupons: Coupon[] = [
    {
      id: '1',
      code: 'NEW50',
      name: '新人专享券',
      discount: 50,
      minAmount: 200,
      type: 'fixed',
      category: 'special',
      status: 'available',
      validUntil: '2026-04-30',
      usageLimit: 1,
      usageCount: 0,
      description: '仅限新用户使用，全品类可用',
    },
    {
      id: '2',
      code: 'SHIPFREE',
      name: '免运费券',
      discount: 15,
      minAmount: 0,
      type: 'fixed',
      category: 'shipping',
      status: 'available',
      validUntil: '2026-03-31',
      usageLimit: 3,
      usageCount: 1,
      description: '订单满15元可用',
    },
    {
      id: '3',
      code: 'SALE20',
      name: '春季特惠',
      discount: 20,
      minAmount: 100,
      type: 'percentage',
      category: 'product',
      status: 'available',
      validUntil: '2026-04-15',
      usageLimit: 2,
      usageCount: 0,
      description: '全品类适用，最高减100元',
    },
    {
      id: '4',
      code: 'VIP30',
      name: '会员专享',
      discount: 30,
      minAmount: 150,
      type: 'fixed',
      category: 'special',
      status: 'used',
      validUntil: '2026-02-28',
      usageLimit: 1,
      usageCount: 1,
      description: '会员专享优惠券',
    },
    {
      id: '5',
      code: 'OLD10',
      name: '老用户优惠',
      discount: 10,
      minAmount: 50,
      type: 'fixed',
      category: 'all',
      status: 'expired',
      validUntil: '2026-01-31',
      usageLimit: 1,
      usageCount: 0,
      description: '已过期优惠券',
    },
  ];

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || coupon.status === selectedStatus;
    const matchesCategory =
      selectedCategory === 'all' || coupon.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.discount}%`;
    }
    return `¥${coupon.discount}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">可用</Badge>;
      case 'used':
        return <Badge variant="secondary">已使用</Badge>;
      case 'expired':
        return <Badge variant="destructive">已过期</Badge>;
      default:
        return null;
    }
  };

  const availableCount = coupons.filter((c) => c.status === 'available').length;
  const usedCount = coupons.filter((c) => c.status === 'used').length;
  const expiredCount = coupons.filter((c) => c.status === 'expired').length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Gift className="w-8 h-8 text-purple-500" />
        <h1 className="text-3xl font-bold">优惠券包</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">可用优惠券</p>
              <p className="text-2xl font-bold">{availableCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已使用</p>
              <p className="text-2xl font-bold">{usedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已过期</p>
              <p className="text-2xl font-bold">{expiredCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索优惠券名称或码"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">全部状态</option>
            <option value="available">可用</option>
            <option value="used">已使用</option>
            <option value="expired">已过期</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">全部分类</option>
            <option value="special">特殊优惠</option>
            <option value="shipping">运费券</option>
            <option value="product">商品券</option>
          </select>
        </div>
      </div>

      {/* 优惠券列表 */}
      <div className="space-y-4">
        {filteredCoupons.map((coupon) => (
          <Card
            key={coupon.id}
            className={`overflow-hidden ${
              coupon.status === 'available'
                ? 'border-green-200 bg-green-50'
                : coupon.status === 'used'
                ? 'border-blue-200 bg-blue-50 opacity-75'
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* 左侧折扣区域 */}
                <div className="md:w-48 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">
                    {getDiscountDisplay(coupon)}
                  </span>
                  <span className="text-sm mt-1">
                    {coupon.minAmount > 0
                      ? `满${coupon.minAmount}元可用`
                      : '无门槛'}
                  </span>
                </div>

                {/* 右侧信息区域 */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{coupon.name}</h3>
                      <p className="text-sm text-gray-500">{coupon.description}</p>
                    </div>
                    {getStatusBadge(coupon.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>码: {coupon.code}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>有效期至: {coupon.validUntil}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm text-gray-500">
                      已使用: {coupon.usageCount}/{coupon.usageLimit} 次
                    </span>
                    {coupon.status === 'available' && (
                      <Button size="sm">立即使用</Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无优惠券</p>
          </div>
        )}
      </div>
    </div>
  );
}
