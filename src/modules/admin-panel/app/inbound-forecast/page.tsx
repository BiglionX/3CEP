"use client";

import { CreateInboundForecastForm } from "@/components/admin/CreateInboundForecastForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  INBOUND_FORECAST_STATUS_COLORS,
  INBOUND_FORECAST_STATUS_DISPLAY,
  InboundForecastStatus,
} from "@/supply-chain/models/inbound-forecast.model";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface InboundForecast {
  id: string;
  forecastNumber: string;
  warehouseId: string;
  warehouseName: string;
  supplierName: string;
  expectedArrival: string;
  actualArrival?: string;
  status: InboundForecastStatus;
  itemCount: number;
  totalForecastedQuantity: number;
  totalReceivedQuantity: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function InboundForecastPage() {
  const [forecasts, setForecasts] = useState<InboundForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    InboundForecastStatus | "all"
  >("all");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");

  // 获取唯一的仓库列表用于筛?
  const warehouses = Array.from(new Set(forecasts.map((f) => f.warehouseName)))
    .filter((name) => name)
    .map((name) => ({
      id: forecasts.find((f) => f.warehouseName === name)?.warehouseId || "",
      name: name,
    }));

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wms/inbound-forecast");
      if (response.ok) {
        const result = await response.json();
        setForecasts(result.data || []);
      } else {
        console.error("加载预报单列表失?", await response.text());
      }
    } catch (error) {
      console.error("加载预报单列表失?", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newForecast: any) => {
    setShowCreateForm(false);
    loadForecasts(); // 重新加载列表
  };

  const handleDelete = async (forecastId: string) => {
    if (!confirm("确定要删除这个预报单吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/wms/inbound-forecast/${forecastId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadForecasts(); // 重新加载列表
      } else {
        const error = await response.json();
        alert(`删除失败: ${error.error}`);
      }
    } catch (error) {
      console.error("删除预报单失?", error);
      alert("删除失败，请稍后重试");
    }
  };

  const getStatusBadge = (status: InboundForecastStatus) => {
    const displayText = INBOUND_FORECAST_STATUS_DISPLAY[status];
    const colorClass = INBOUND_FORECAST_STATUS_COLORS[status];

    const colorMap: Record<string, any> = {
      blue: "bg-blue-100 text-blue-800",
      orange: "bg-orange-100 text-orange-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colorMap[colorClass] || "bg-gray-100 text-gray-800"}>
        {displayText}
      </Badge>
    );
  };

  const filteredForecasts = forecasts.filter((forecast) => {
    const matchesSearch =
      forecast.forecastNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      forecast.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forecast.warehouseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || forecast.status === statusFilter;
    const matchesWarehouse =
      warehouseFilter === "all" || forecast.warehouseId === warehouseFilter;

    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  if (showCreateForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            �?返回列表
          </Button>
        </div>
        <CreateInboundForecastForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* 页面标题和操作按?*/}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">入库预报管理</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建预报?
        </Button>
      </div>

      {/* 筛选和搜索区域 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜索?*/}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索预报单号、供应商或仓?.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 状态筛?*/}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as InboundForecastStatus | "all")
              }
              className="border rounded-md px-3 py-2"
            >
              <option value="all">全部状?/option>
              {Object.entries(INBOUND_FORECAST_STATUS_DISPLAY).map(
                ([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                )
              )}
            </select>

            {/* 仓库筛?*/}
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">全部仓库</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">总预报单?/div>
            <div className="text-2xl font-bold">{forecasts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">预报?/div>
            <div className="text-2xl font-bold text-blue-600">
              {
                forecasts.filter(
                  (f) => f.status === InboundForecastStatus.FORECAST
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">在途中</div>
            <div className="text-2xl font-bold text-orange-600">
              {
                forecasts.filter(
                  (f) => f.status === InboundForecastStatus.IN_TRANSIT
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">已收?/div>
            <div className="text-2xl font-bold text-green-600">
              {
                forecasts.filter(
                  (f) => f.status === InboundForecastStatus.RECEIVED
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预报单列?*/}
      <Card>
        <CardHeader>
          <CardTitle>预报单列?/CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载?..</p>
            </div>
          ) : filteredForecasts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg mb-2">暂无预报单数?/p>
              <p>点击"创建预报?按钮开始创建新的入库预?/p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium">
                      预报单号
                    </th>
                    <th className="text-left py-3 px-4 font-medium">仓库</th>
                    <th className="text-left py-3 px-4 font-medium">供应?/th>
                    <th className="text-left py-3 px-4 font-medium">商品?/th>
                    <th className="text-left py-3 px-4 font-medium">
                      预报数量
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      预计到货
                    </th>
                    <th className="text-left py-3 px-4 font-medium">状?/th>
                    <th className="text-left py-3 px-4 font-medium">
                      创建时间
                    </th>
                    <th className="text-left py-3 px-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForecasts.map((forecast) => (
                    <tr key={forecast.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-blue-600">
                        {forecast.forecastNumber}
                      </td>
                      <td className="py-3 px-4">{forecast.warehouseName}</td>
                      <td className="py-3 px-4">{forecast.supplierName}</td>
                      <td className="py-3 px-4">{forecast.itemCount}</td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">
                          {forecast.totalForecastedQuantity}
                        </span>
                        {forecast.totalReceivedQuantity > 0 && (
                          <span className="text-green-600 ml-1">
                            (+{forecast.totalReceivedQuantity})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(
                          forecast.expectedArrival
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(forecast.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(forecast.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                          {forecast.status ===
                            InboundForecastStatus.FORECAST && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(forecast.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              删除
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
