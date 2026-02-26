"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Slider 组件可能需要自定义实现或使用其他UI库
import { 
  Calculator, 
  Smartphone, 
  TrendingUp, 
  Battery, 
  Camera,
  Zap,
  Calendar,
  MapPin,
  Tag
} from "lucide-react";

interface DeviceCondition {
  screen: number; // 1-10分
  battery: number; // 1-10分
  body: number; // 1-10分
  functionality: number; // 1-10分
}

interface ValuationResult {
  baseValue: number;
  finalValue: number;
  depreciation: number;
  conditionAdjustment: number;
  breakdown: {
    screen: number;
    battery: number;
    body: number;
    functionality: number;
  };
  confidence: number;
}

export default function ValuationPage() {
  const [deviceType, setDeviceType] = useState("iphone");
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [purchaseYear, setPurchaseYear] = useState(new Date().getFullYear().toString());
  const [condition, setCondition] = useState<DeviceCondition>({
    screen: 8,
    battery: 7,
    body: 8,
    functionality: 9
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);

  // 设备类型选项
  const deviceTypes = [
    { value: "iphone", label: "iPhone", icon: Smartphone },
    { value: "android", label: "Android手机", icon: Smartphone },
    { value: "tablet", label: "平板电脑", icon: Smartphone },
    { value: "laptop", label: "笔记本电脑", icon: Smartphone },
    { value: "watch", label: "智能手表", icon: Smartphone }
  ];

  // 品牌选项
  const brands = {
    iphone: ["Apple"],
    android: ["Samsung", "Huawei", "Xiaomi", "OPPO", "vivo", "OnePlus"],
    tablet: ["Apple", "Samsung", "Huawei", "Lenovo", "Microsoft"],
    laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer"],
    watch: ["Apple", "Samsung", "Huawei", "Xiaomi"]
  };

  // 常见型号
  const commonModels = {
    "Apple|iPhone": ["iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro", "iPhone 13"],
    "Samsung|Galaxy": ["Galaxy S24", "Galaxy S23 Ultra", "Galaxy S23", "Galaxy S22", "Galaxy Note 20"],
    "Huawei|P/Mate": ["P60 Pro", "Mate 50 Pro", "P50 Pro", "Mate 40 Pro"],
    "Xiaomi|Mi/Redmi": ["Xiaomi 13 Pro", "Xiaomi 13", "Redmi Note 12 Pro", "Mi 12"],
  };

  const calculateValuation = async () => {
    setIsLoading(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 简化的估值算法
      const basePrices: Record<string, number> = {
        "iPhone 15 Pro": 8000,
        "iPhone 15": 6500,
        "iPhone 14 Pro": 7000,
        "iPhone 14": 5500,
        "Galaxy S24": 7500,
        "Galaxy S23 Ultra": 8500,
        "其他": 4000
      };

      const basePrice = basePrices[model] || basePrices["其他"];
      const yearsOld = new Date().getFullYear() - parseInt(purchaseYear);
      
      // 折旧计算
      const depreciationRate = Math.min(yearsOld * 0.15, 0.8); // 最大80%折旧
      const depreciatedValue = basePrice * (1 - depreciationRate);
      
      // 成色调整
      const avgCondition = (condition.screen + condition.battery + condition.body + condition.functionality) / 40; // 转换为0-1
      const conditionMultiplier = 0.5 + (avgCondition * 0.5); // 0.5-1.0倍
      
      const finalValue = depreciatedValue * conditionMultiplier;
      
      const resultData: ValuationResult = {
        baseValue: basePrice,
        finalValue: Math.round(finalValue),
        depreciation: Math.round(basePrice - depreciatedValue),
        conditionAdjustment: conditionMultiplier,
        breakdown: {
          screen: condition.screen,
          battery: condition.battery,
          body: condition.body,
          functionality: condition.functionality
        },
        confidence: 0.85
      };
      
      setResult(resultData);
    } catch (error) {
      console.error("估值计算失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionLabel = (score: number) => {
    if (score >= 9) return "全新";
    if (score >= 7) return "良好";
    if (score >= 5) return "一般";
    if (score >= 3) return "较差";
    return "很差";
  };

  const ConditionSlider = ({ 
    label, 
    icon: Icon, 
    value, 
    onChange 
  }: { 
    label: string; 
    icon: any; 
    value: number; 
    onChange: (value: number) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 text-blue-600" />
          <Label className="text-sm font-medium">{label}</Label>
        </div>
        <span className="text-sm text-gray-600">
          {value}分 ({getConditionLabel(value)})
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            智能设备估价
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基于AI算法和大数据分析，为您提供精准的二手设备回收价格评估
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 估价表单 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <span>设备信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 设备类型 */}
              <div className="space-y-2">
                <Label htmlFor="deviceType">设备类型</Label>
                <Select value={deviceType} onValueChange={setDeviceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择设备类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* 品牌 */}
              <div className="space-y-2">
                <Label htmlFor="brand">品牌</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择品牌" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands[deviceType as keyof typeof brands]?.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 型号 */}
              <div className="space-y-2">
                <Label htmlFor="model">型号</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="例如: iPhone 15 Pro"
                  list="models"
                />
                <datalist id="models">
                  {Object.entries(commonModels).map(([key, models]) => {
                    const [b, m] = key.split("|");
                    if (brand.includes(b) || m.includes(brand)) {
                      return models.map(model => (
                        <option key={model} value={model} />
                      ));
                    }
                    return null;
                  })}
                </datalist>
              </div>

              {/* 购买年份 */}
              <div className="space-y-2">
                <Label htmlFor="purchaseYear">购买年份</Label>
                <Select value={purchaseYear} onValueChange={setPurchaseYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 设备成色评估 */}
              <div className="space-y-6 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>设备成色评估</span>
                </h3>
                
                <ConditionSlider
                  label="屏幕状况"
                  icon={Smartphone}
                  value={condition.screen}
                  onChange={(val) => setCondition({...condition, screen: val})}
                />
                
                <ConditionSlider
                  label="电池健康"
                  icon={Battery}
                  value={condition.battery}
                  onChange={(val) => setCondition({...condition, battery: val})}
                />
                
                <ConditionSlider
                  label="外观成色"
                  icon={Camera}
                  value={condition.body}
                  onChange={(val) => setCondition({...condition, body: val})}
                />
                
                <ConditionSlider
                  label="功能完整度"
                  icon={Zap}
                  value={condition.functionality}
                  onChange={(val) => setCondition({...condition, functionality: val})}
                />
              </div>

              {/* 估价按钮 */}
              <Button 
                className="w-full py-6 text-lg"
                onClick={calculateValuation}
                disabled={isLoading || !model}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    正在计算估价...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5 mr-2" />
                    立即估价
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 估价结果 */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card className="shadow-lg border-green-200">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center space-x-2 text-green-800">
                      <TrendingUp className="w-5 h-5" />
                      <span>估价结果</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold text-green-600">
                        ¥{result.finalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        置信度: {(result.confidence * 100).toFixed(0)}%
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">原价</div>
                          <div className="font-semibold text-gray-900">¥{result.baseValue.toLocaleString()}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">折旧</div>
                          <div className="font-semibold text-red-600">-¥{result.depreciation.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">详细分析</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">屏幕状况:</span>
                        <span className="font-medium">{condition.screen}/10分</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">电池健康:</span>
                        <span className="font-medium">{condition.battery}/10分</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">外观成色:</span>
                        <span className="font-medium">{condition.body}/10分</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">功能完整度:</span>
                        <span className="font-medium">{condition.functionality}/10分</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between">
                          <span className="text-gray-600">综合成色系数:</span>
                          <span className="font-semibold">{(result.conditionAdjustment * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    下一步建议
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 可以前往附近的维修网点进行实物检测</li>
                    <li>• 联系我们的回收合作伙伴获取报价</li>
                    <li>• 参考多家回收商的价格对比</li>
                  </ul>
                </div>
              </>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    等待估价
                  </h3>
                  <p className="text-gray-600">
                    填写设备信息并点击"立即估价"按钮获取精准的价格评估
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 特色说明 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            为什么选择我们的智能估价系统？
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>AI智能算法</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  基于机器学习和大数据分析，提供行业领先的估价准确性
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>实时市场数据</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  整合最新二手市场行情，确保估价紧跟市场价格波动
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>透明公正</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  公开估价标准和计算过程，让您清楚了解价格构成
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}