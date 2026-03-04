/**
 * 使用Zustand状态管理的维修店列表组? * 展示现代化状态管理的优势
 */

'use client';

import React, { useEffect } from 'react';
import {
  useShops,
  useShopActions,
  useUser,
  useUI,
  useUIActions,
} from '@/stores/repair-shop-store';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, Star, MapPin, Phone } from 'lucide-react';

const ShopListWithZustand: React.FC = () => {
  // 使用选择器获取状?  const { list: shops, loading, error, filters, pagination } = useShops();
  const user = useUser();
  const ui = useUI();

  // 使用选择器获取actions
  const { loadShops, setFilters, setLoading, setError } = useShopActions();

  const { toggleSidebar, setTheme } = useUIActions();

  // 组件挂载时加载数?  useEffect(() => {
    loadShops(pagination.currentPage, filters);
  }, []);

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setFilters({ search: searchValue });

    // 防抖搜索
    const timer = setTimeout(() => {
      loadShops(1, { ...filters, search: searchValue });
    }, 300);

    return () => clearTimeout(timer);
  };

  // 处理筛?  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    loadShops(1, newFilters);
  };

  // 处理分页
  const handlePageChange = (newPage: number) => {
    loadShops(newPage, filters);
  };

  // 处理刷新
  const handleRefresh = () => {
    setLoading(true);
    loadShops(pagination.currentPage, filters);
  };

  if (loading && shops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载?..</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <div className="text-red-500 text-xl mb-2">�?/div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">加载失败</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        ui.theme === 'dark'
          ? 'bg-gray-900 text-white'
          : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* 顶部导航 */}
      <header
        className={`sticky top-0 z-10 shadow-md transition-colors ${
          ui.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleSidebar()}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter size={20} />
              </button>
              <h1 className="text-xl font-bold">维修店列?/h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="搜索维修?.."
                  onChange={handleSearch}
                  defaultValue={filters.search}
                  className={`pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    ui.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors ${
                  loading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <RefreshCw
                  size={20}
                  className={loading ? 'animate-spin' : ''}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 筛选器 */}
      <div
        className={`border-b transition-colors ${
          ui.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                ui.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="">所有分?/option>
              <option value="phone">手机维修</option>
              <option value="computer">电脑维修</option>
              <option value="appliance">家电维修</option>
            </select>

            <select
              value={filters.rating}
              onChange={e =>
                handleFilterChange('rating', Number(e.target.value))
              }
              className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                ui.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value={0}>所有评?/option>
              <option value={4}>4星以?/option>
              <option value={4.5}>4.5星以?/option>
              <option value={5}>5�?/option>
            </select>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {shops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold mb-2">暂无维修?/h3>
            <p className="text-gray-500">没有找到符合条件的维修店</p>
          </div>
        ) : (
          <>
            {/* 维修店列?*/}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {shops.map((shop, index) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                    ui.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {shop.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin size={16} className="mr-1" />
                          {shop.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone size={16} className="mr-1" />
                          {shop.phone}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span className="font-medium">{shop.rating}</span>
                      </div>
                    </div>

                    <p
                      className={`text-sm mb-4 line-clamp-2 ${
                        ui.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {shop.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {shop.services
                        ?.slice(0, 3)
                        .map((service: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-full text-xs ${
                              ui.theme === 'dark'
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {service}
                          </span>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className={`font-semibold ${
                          ui.theme === 'dark'
                            ? 'text-green-400'
                            : 'text-green-600'
                        }`}
                      >
                        ¥{shop.priceRange}
                      </span>
                      <button
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          ui.theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        联系商家
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pagination.currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  上一?                </button>

                <span className="px-4 py-2">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pagination.currentPage === pagination.totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  下一?                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ShopListWithZustand;
