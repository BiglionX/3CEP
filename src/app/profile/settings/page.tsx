'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Camera, Save, X, AlertCircle } from 'lucide-react';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  location: string;
  bio: string;
  avatar: string;
}

export default function ProfileSettingsPage() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    gender: '',
    location: '',
    bio: '',
    avatar: '',
  });

  const [originalInfo, setOriginalInfo] = useState<PersonalInfo>(
    {} as PersonalInfo
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 模拟获取用户数据
    setTimeout(() => {
      const mockData: PersonalInfo = {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '138****8888',
        birthday: '1990-01-01',
        gender: 'male',
        location: '北京市朝阳区',
        bio: '热爱科技产品的数码爱好者，专注于手机和平板设备的维修保养',
        avatar: '',
      };
      setPersonalInfo(mockData);
      setOriginalInfo({ ...mockData });
      setLoading(false);
    }, 500);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!personalInfo.name.trim()) {
      newErrors.name = '姓名不能为空';
    }

    if (!personalInfo.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (
      personalInfo.phone &&
      !/^1[3-9]\d{9}$/.test(personalInfo.phone.replace(/\*/g, ''))
    ) {
      newErrors.phone = '请输入有效的手机号码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('请检查表单填写是否正确');
      return;
    }

    setSaving(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOriginalInfo({ ...personalInfo });
      alert('个人资料更新成功');
    } catch (error) {
      alert('更新失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPersonalInfo({ ...originalInfo });
    setErrors({});
    alert('已撤销更改');
  };

  const hasChanges =
    JSON.stringify(personalInfo) !== JSON.stringify(originalInfo);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">"
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return ("
    <div className="space-y-6">
      {/* 页面标题 */}"
      <div className="flex items-center justify-between">
        <div>"
          <h1 className="text-2xl font-bold text-gray-900">账户设置</h1>"
          <p className="text-gray-600 mt-1">管理您的个人信息</p>
        </div>
        {hasChanges && ("
          <div className="flex items-center space-x-3">"
            <Button variant="outline" onClick={handleCancel}>"
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>"
              <Save className="w-4 h-4 mr-2" />
              {saving  '保存中...' : '保存更改'}
            </Button>
          </div>
        )}
      </div>
"
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：头像上传 */}"
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>"
              <CardTitle className="text-lg">头像</CardTitle>
            </CardHeader>"
            <CardContent className="text-center">"
              <div className="relative inline-block">"
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  {personalInfo.avatar  (
                    <img
                      src={personalInfo.avatar}"
                      alt="头像""
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : ("
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>"
                <button className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 transition-colors">"
                  <Camera className="w-4 h-4" />
                </button>
              </div>"
              <p className="text-sm text-gray-600 mt-2">
                点击相机图标上传新头像
              </p>"
              <Button variant="outline" size="sm" className="mt-3">
                选择文件
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：个人信息表单 */}"
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>"
              <CardTitle className="text-lg">基本信息</CardTitle>
            </CardHeader>"
            <CardContent className="space-y-6">
              {/* 姓名 */}"
              <div className="space-y-2">"
                <Label htmlFor="name">姓名 *</Label>
                <Input"
                  id="name"
                  value={personalInfo.name}
                  onChange={e =>
                    setPersonalInfo({ ...personalInfo, name: e.target.value })
                  }
                  className={errors.name  'border-red-500' : ''}
                />
                {errors.name && (
                  <div className="flex items-center text-red-500 text-sm">"
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* 邮箱 */}"
              <div className="space-y-2">"
                <Label htmlFor="email">邮箱 *</Label>
                <Input"
                  id="email""
                  type="email"
                  value={personalInfo.email}
                  onChange={e =>
                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                  }
                  className={errors.email  'border-red-500' : ''}
                />
                {errors.email && (
                  <div className="flex items-center text-red-500 text-sm">"
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* 手机号 */}"
              <div className="space-y-2">"
                <Label htmlFor="phone">手机号</Label>
                <Input"
                  id="phone""
                  type="tel"
                  value={personalInfo.phone}
                  onChange={e =>
                    setPersonalInfo({ ...personalInfo, phone: e.target.value })
                  }
                  className={errors.phone  'border-red-500' : ''}
                  placeholder="请输入手机号"
                />
                {errors.phone && ("
                  <div className="flex items-center text-red-500 text-sm">"
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* 生日和性别 */}"
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">"
                <div className="space-y-2">"
                  <Label htmlFor="birthday">生日</Label>
                  <Input"
                    id="birthday""
                    type="date"
                    value={personalInfo.birthday}
                    onChange={e =>
                      setPersonalInfo({
                        ...personalInfo,
                        birthday: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">"
                  <Label htmlFor="gender">性别</Label>
                  <select"
                    id="gender"
                    value={personalInfo.gender}
                    onChange={e =>
                      setPersonalInfo({
                        ...personalInfo,
                        gender: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >"
                    <option value="">请选择</option>"
                    <option value="male">男</option>"
                    <option value="female">女</option>"
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>

              {/* 地址 */}"
              <div className="space-y-2">"
                <Label htmlFor="location">所在地</Label>
                <Input"
                  id="location"
                  value={personalInfo.location}
                  onChange={e =>
                    setPersonalInfo({
                      ...personalInfo,
                      location: e.target.value,
                    })
                  }
                  placeholder="请输入所在地"
                />
              </div>

              {/* 个人简介 */}"
              <div className="space-y-2">"
                <Label htmlFor="bio">个人简介</Label>
                <Textarea"
                  id="bio"
                  value={personalInfo.bio}
                  onChange={e =>
                    setPersonalInfo({ ...personalInfo, bio: e.target.value })
                  }
                  placeholder="简单介绍一下自己..."
                  rows={4}
                />"
                <p className="text-sm text-gray-500">
                  {personalInfo.bio.length}/200 字符
                </p>
              </div>

              {/* 固定保存按钮（移动端） */}"
              <div className="md:hidden pt-4 border-t">"
                <div className="flex space-x-3">
                  <Button"
                    variant="outline""
                    className="flex-1"
                    onClick={handleCancel}
                  >
                    取消
                  </Button>
                  <Button"
                    className="flex-1"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                  >
                    {saving  '保存中...' : '保存更改'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'"