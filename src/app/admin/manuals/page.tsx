'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Manual {
  id: string;
  title: string;
  productId: string;
  status: string;
}

export default function ManualsManagementPage() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取说明书列表
  const fetchManuals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/manuals');
      if (response.ok) {
        const data = await response.json();
        setManuals(data.manuals || []);
      }
    } catch (error) {
      console.error('获取说明书列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">说明书管理</h1>
          <p className="text-gray-500 mt-1">管理产品说明书和多语言内容</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加说明书
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总说明书</CardTitle>
            <Package className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manuals.length}</div>
            <p className="text-xs text-gray-500 mt-1">所有说明书</p>
          </CardContent>
        </Card>
      </div>

      {/* 列表 */}
      <Card>
        <CardHeader>
          <CardTitle>说明书列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : manuals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无说明书数据
            </div>
          ) : (
            <div className="space-y-4">
              {manuals.map(manual => (
                <div key={manual.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{manual.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    产品 ID: {manual.productId}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
