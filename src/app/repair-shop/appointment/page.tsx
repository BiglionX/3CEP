'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, User, Wrench, CheckCircle } from 'lucide-react';

export default function AppointmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deviceBrand: '',
    deviceModel: '',
    faultType: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    shop: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const faultTypes = [
    { value: 'screen', label: '屏幕故障' },
    { value: 'battery', label: '电池问题' },
    { value: 'charging', label: '充电异常' },
    { value: 'speaker', label: '扬声器/麦克风' },
    { value: 'camera', label: '摄像头故障' },
    { value: 'water', label: '进水维修' },
    { value: 'unlock', label: '解锁/ID问题' },
    { value: 'other', label: '其他问题' },
  ];

  const timeSlots = [
    { value: '09:00', label: '09:00 - 10:00' },
    { value: '10:00', label: '10:00 - 11:00' },
    { value: '11:00', label: '11:00 - 12:00' },
    { value: '14:00', label: '14:00 - 15:00' },
    { value: '15:00', label: '15:00 - 16:00' },
    { value: '16:00', label: '16:00 - 17:00' },
    { value: '17:00', label: '17:00 - 18:00' },
  ];

  const shops = [
    { id: '1', name: '极速手机维修', address: '朝阳区建国路88号' },
    { id: '2', name: '专业手机服务中心', address: '海淀区中关村大街' },
    { id: '3', name: '苹果授权维修点', address: '西城区金融街' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">预约成功</h2>
            <p className="text-gray-600 mb-6">
              您的维修预约已提交，我们将在24小时内与您确认
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                预约编号：AP{Date.now().toString().slice(-8)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                预约时间：{formData.preferredDate} {formData.preferredTime}
              </p>
            </div>
            <Button onClick={() => (window.location.href = '/repair-shop')}>
              返回店铺列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            预约维修
          </h1>
          <p className="text-gray-600 mt-2">
            填写以下信息，我们将为您安排专业的维修服务
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 联系人信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  联系人信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      placeholder="请输入您的姓名"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">联系电话</Label>
                    <Input
                      id="phone"
                      placeholder="请输入您的手机号"
                      value={formData.phone}
                      onChange={e =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 设备信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  设备信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>品牌</Label>
                    <Select
                      value={formData.deviceBrand}
                      onValueChange={value =>
                        setFormData({ ...formData, deviceBrand: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择设备品牌" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apple">Apple 苹果</SelectItem>
                        <SelectItem value="samsung">Samsung 三星</SelectItem>
                        <SelectItem value="huawei">华为</SelectItem>
                        <SelectItem value="xiaomi">小米</SelectItem>
                        <SelectItem value="oppo">OPPO</SelectItem>
                        <SelectItem value="vivo">vivo</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">型号</Label>
                    <Input
                      id="model"
                      placeholder="例如：iPhone 14 Pro"
                      value={formData.deviceModel}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          deviceModel: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>故障类型</Label>
                  <Select
                    value={formData.faultType}
                    onValueChange={value =>
                      setFormData({ ...formData, faultType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择故障类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {faultTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">故障描述</Label>
                  <Textarea
                    id="description"
                    placeholder="请详细描述设备故障情况，以便我们更好地为您服务"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 预约信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  预约信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>选择门店</Label>
                  <Select
                    value={formData.shop}
                    onValueChange={value =>
                      setFormData({ ...formData, shop: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择预约门店" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map(shop => (
                        <SelectItem key={shop.id} value={shop.id}>
                          <div>
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-xs text-gray-500">
                              {shop.address}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">预约日期</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.preferredDate}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          preferredDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>预约时间</Label>
                    <Select
                      value={formData.preferredTime}
                      onValueChange={value =>
                        setFormData({ ...formData, preferredTime: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择时间段" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(slot => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                取消
              </Button>
              <Button type="submit">提交预约</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
