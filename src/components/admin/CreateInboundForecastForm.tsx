"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateInboundForecastDTO,
  INBOUND_ITEM_DEFAULTS,
} from "@/supply-chain/models/inbound-forecast.model";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ForecastItem {
  sku: string;
  productName: string;
  forecastedQuantity: number;
  unitWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  remarks?: string;
}

interface CreateInboundForecastFormProps {
  onSuccess?: (forecast: any) => void;
  onCancel?: () => void;
}

export function CreateInboundForecastForm({
  onSuccess,
  onCancel,
}: CreateInboundForecastFormProps) {
  const [formData, setFormData] = useState({
    warehouseId: "",
    supplierName: "",
    supplierContact: "",
    supplierAddress: "",
    expectedArrival: "",
    remarks: "",
  });

  const [items, setItems] = useState<ForecastItem[]>([
    {
      sku: "",
      productName: "",
      forecastedQuantity: 1,
      remarks: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 模拟仓库数据
  const warehouses = [
    { id: "us-lax-001", name: "美国洛杉矶仓" },
    { id: "uk-lon-001", name: "英国伦敦仓" },
    { id: "de-fra-001", name: "德国法兰克福仓" },
    { id: "cn-sh-001", name: "中国上海仓" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("表单填写有误", {
        description: "请检查红色标记的字段",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const forecastData: CreateInboundForecastDTO = {
        warehouseId: formData.warehouseId,
        supplierName: formData.supplierName,
        supplierContact: formData.supplierContact,
        supplierAddress: formData.supplierAddress,
        expectedArrival: new Date(formData.expectedArrival),
        items: items
          .filter((item) => item.sku && item.forecastedQuantity > 0)
          .map((item) => ({
            sku: item.sku,
            forecastedQuantity: item.forecastedQuantity,
            unitWeight: item.unitWeight,
            dimensions:
              item.length && item.width && item.height
                ? {
                    length: item.length,
                    width: item.width,
                    height: item.height,
                  }
                : undefined,
            remarks: item.remarks,
          })),
        remarks: formData.remarks,
      };

      const response = await fetch("/api/wms/inbound-forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forecastData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "创建预报单失败");
      }

      const result = await response.json();

      toast.success("预报单创建成功", {
        description: `预报单号: ${result.data.forecastNumber}`,
      });

      // 调用成功回调
      if (onSuccess) {
        onSuccess(result.data);
      }

      // 重置表单
      resetForm();
    } catch (error) {
      console.error("创建预报单失败:", error);
      toast.error("创建失败", {
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // 基础信息验证
    if (!formData.warehouseId) {
      errors.warehouseId = "请选择目标仓库";
    }

    if (!formData.supplierName) {
      errors.supplierName = "请输入供应商名称";
    } else if (formData.supplierName.length < 2) {
      errors.supplierName = "供应商名称至少2个字符";
    }

    if (!formData.supplierContact) {
      errors.supplierContact = "请输入联系人信息";
    }

    if (!formData.supplierAddress) {
      errors.supplierAddress = "请输入供应商地址";
    }

    if (!formData.expectedArrival) {
      errors.expectedArrival = "请选择预计到货时间";
    } else {
      const arrivalDate = new Date(formData.expectedArrival);
      if (arrivalDate < new Date()) {
        errors.expectedArrival = "预计到货时间不能早于当前时间";
      }
    }

    // 商品项验证
    const validItems = items.filter(
      (item) => item.sku && item.forecastedQuantity > 0
    );
    if (validItems.length === 0) {
      errors.items = "至少需要添加一个有效的商品项";
    }

    validItems.forEach((item, index) => {
      if (!item.sku) {
        errors[`item_${index}_sku`] = "SKU不能为空";
      }

      if (item.forecastedQuantity <= 0) {
        errors[`item_${index}_quantity`] = "预报数量必须大于0";
      }

      if (item.unitWeight !== undefined && item.unitWeight < 0) {
        errors[`item_${index}_weight`] = "单位重量不能为负数";
      }

      if (
        (item.length || item.width || item.height) &&
        (!item.length ||
          !item.width ||
          !item.height ||
          item.length <= 0 ||
          item.width <= 0 ||
          item.height <= 0)
      ) {
        errors[`item_${index}_dimensions`] = "尺寸信息不完整或无效";
      }
    });

    return errors;
  };

  const resetForm = () => {
    setFormData({
      warehouseId: "",
      supplierName: "",
      supplierContact: "",
      supplierAddress: "",
      expectedArrival: "",
      remarks: "",
    });
    setItems([
      {
        sku: "",
        productName: "",
        forecastedQuantity: 1,
        remarks: "",
      },
    ]);
    setErrors({});
  };

  const addItem = () => {
    setItems([
      ...items,
      { ...INBOUND_ITEM_DEFAULTS, sku: "", productName: "" } as ForecastItem,
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ForecastItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);

    // 清除对应字段的错误
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`item_${index}_${field}`];
      return newErrors;
    });
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });

    // 清除对应字段的错误
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>创建入库预报单</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基础信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warehouseId">目标仓库 *</Label>
              <select
                id="warehouseId"
                value={formData.warehouseId}
                onChange={(e) => updateFormData("warehouseId", e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.warehouseId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">请选择仓库</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
              {errors.warehouseId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.warehouseId}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expectedArrival">预计到货时间 *</Label>
              <Input
                id="expectedArrival"
                type="datetime-local"
                value={formData.expectedArrival}
                onChange={(e) =>
                  updateFormData("expectedArrival", e.target.value)
                }
                className={errors.expectedArrival ? "border-red-500" : ""}
              />
              {errors.expectedArrival && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.expectedArrival}
                </p>
              )}
            </div>
          </div>

          {/* 供应商信息 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">供应商信息</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="supplierName">供应商名称 *</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) =>
                    updateFormData("supplierName", e.target.value)
                  }
                  className={errors.supplierName ? "border-red-500" : ""}
                  placeholder="请输入供应商名称"
                />
                {errors.supplierName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supplierName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="supplierContact">联系人 *</Label>
                <Input
                  id="supplierContact"
                  value={formData.supplierContact}
                  onChange={(e) =>
                    updateFormData("supplierContact", e.target.value)
                  }
                  className={errors.supplierContact ? "border-red-500" : ""}
                  placeholder="联系人及电话"
                />
                {errors.supplierContact && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supplierContact}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="supplierAddress">地址 *</Label>
                <Input
                  id="supplierAddress"
                  value={formData.supplierAddress}
                  onChange={(e) =>
                    updateFormData("supplierAddress", e.target.value)
                  }
                  className={errors.supplierAddress ? "border-red-500" : ""}
                  placeholder="详细地址"
                />
                {errors.supplierAddress && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supplierAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 商品清单 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">商品清单 *</h3>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                添加商品
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-2">
                    <Label>SKU *</Label>
                    <Input
                      value={item.sku}
                      onChange={(e) => updateItem(index, "sku", e.target.value)}
                      className={
                        errors[`item_${index}_sku`] ? "border-red-500" : ""
                      }
                      placeholder="商品SKU"
                    />
                    {errors[`item_${index}_sku`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`item_${index}_sku`]}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label>商品名称</Label>
                    <Input
                      value={item.productName}
                      onChange={(e) =>
                        updateItem(index, "productName", e.target.value)
                      }
                      placeholder="商品名称"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>预报数量 *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.forecastedQuantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "forecastedQuantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className={
                        errors[`item_${index}_quantity`] ? "border-red-500" : ""
                      }
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`item_${index}_quantity`]}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label>单位重量(kg)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={item.unitWeight || ""}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unitWeight",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      className={
                        errors[`item_${index}_weight`] ? "border-red-500" : ""
                      }
                    />
                    {errors[`item_${index}_weight`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`item_${index}_weight`]}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <Label>备注</Label>
                    <Input
                      value={item.remarks || ""}
                      onChange={(e) =>
                        updateItem(index, "remarks", e.target.value)
                      }
                      placeholder="商品备注"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 尺寸信息 */}
                {(item.unitWeight ||
                  item.length ||
                  item.width ||
                  item.height) && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>长(cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={item.length || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "length",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        className={
                          errors[`item_${index}_dimensions`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </div>
                    <div>
                      <Label>宽(cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={item.width || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "width",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        className={
                          errors[`item_${index}_dimensions`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </div>
                    <div>
                      <Label>高(cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={item.height || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "height",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        className={
                          errors[`item_${index}_dimensions`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`item_${index}_dimensions`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`item_${index}_dimensions`]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {errors.items && (
              <p className="text-red-500 text-sm">{errors.items}</p>
            )}
          </div>

          {/* 备注 */}
          <div>
            <Label htmlFor="remarks">备注说明</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => updateFormData("remarks", e.target.value)}
              rows={3}
              placeholder="请输入备注信息"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "创建中..." : "创建预报单"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
