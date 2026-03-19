'use client';
'
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit3,
  Save,
  X,
  BadgeCheck,
  AlertCircle,
  Calendar,
  FileText,
} from 'lucide-react';

interface BrandProfile {
  id: string;
  companyName: string;
  businessLicense: string;
  legalRepresentative: string;
  industry: string;
  companySize: string;
  establishmentDate: string;
  registeredCapital: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description: string;
  logo: string;
  certificationStatus: 'pending' | 'verified' | 'rejected';
  certificationDate: string | null;
}

export default function BrandProfilePage() {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [originalBrand, setOriginalBrand] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 模拟获取品牌商数    setTimeout(() => {
      const mockData: BrandProfile = {
        id: 'brand_123',
        companyName: '科技创新有限公司',
        businessLicense: '91110108MA01XXXXXX',
        legalRepresentative: '李明',
        industry: '电子信息',
        companySize: '50-100,
        establishmentDate: '2020-03-15',
        registeredCapital: '1000万人民币',
        website: 'https://www.techinnovate.com',
        contactEmail: 'contact@techinnovate.com',
        contactPhone: '010-12345678',
        address: '北京市海淀区中关村大街1,
        description:
          '专注于智能硬件和物联网解决方案的高科技企业，致力于为客户提供创新的技术产品和服务,
        logo: '',
        certificationStatus: 'verified',
        certificationDate: '2024-01-10',
      };
      setBrand(mockData);
      setOriginalBrand({ ...mockData });
      setLoading(false);
    }, 500);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!brand.companyName.trim()) {
      newErrors.companyName = '公司名称不能为空';
    }

    if (!brand.businessLicense.trim()) {'
      newErrors.businessLicense = '营业执照号码不能为空';
    }

    if (!brand.legalRepresentative.trim()) {'
      newErrors.legalRepresentative = '法定代表人不能为;
    }

    if (!brand.contactEmail.trim()) {'
      newErrors.contactEmail = '联系邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(brand.contactEmail)) {'
      newErrors.contactEmail = '请输入有效的邮箱地址';
    }

    if (!brand.contactPhone.trim()) {'
      newErrors.contactPhone = '联系电话不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!brand || !validateForm()) {'
      alert('请检查表单填写是否正);
      return;
    }

    setSaving(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOriginalBrand({ ...brand });
      setEditing(false);
      alert('品牌信息更新成功');
    } catch (error) {'
      alert('更新失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setBrand(originalBrand  { ...originalBrand } : null);
    setEditing(false);
    setErrors({});
    alert('已撤销更改');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {'
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">"
            <BadgeCheck className="w-3 h-3 mr-1" />
            已认          </span>
        );
      case 'pending':
        return ("
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">"
            <AlertCircle className="w-3 h-3 mr-1" />
            审核          </span>
        );
      case 'rejected':
        return ("
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">"
            <X className="w-3 h-3 mr-1" />
            已拒          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return ("
      <div className="flex items-center justify-center h-64">"
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!brand) return null;

  return ("
    <div className="space-y-6">
      {/* 页面标题和操作按*/}"
      <div className="flex items-center justify-between">
        <div>"
          <h1 className="text-2xl font-bold text-gray-900">品牌商资/h1>"
          <p className="text-gray-600 mt-1">管理您的企业信息和认证状/p>
        </div>"
        <div className="flex items-center space-x-3">
          {editing  (
            <>"
              <Button variant="outline" onClick={handleCancel}>"
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving}>"
                <Save className="w-4 h-4 mr-2" />'
                {saving ? '保存..' : '保存'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>"
              <Edit3 className="w-4 h-4 mr-2" />
              编辑资料
            </Button>
          )}
        </div>
      </div>
"
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：企业基本信息卡*/}"
        <div className="lg:col-span-1 space-y-6">
          {/* 企业Logo和认证状*/}
          <Card>
            <CardHeader>"
              <CardTitle className="flex items-center justify-between">
                企业信息
                {getStatusBadge(brand.certificationStatus)}
              </CardTitle>
            </CardHeader>"
            <CardContent className="text-center">"
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                {brand.logo  (
                  <img
                    src={brand.logo}
                    alt={brand.companyName}"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : ("
                  <Building2 className="w-12 h-12 text-gray-400" />
                )}
              </div>"
              <h3 className="text-lg font-semibold text-gray-900">
                {brand.companyName}
              </h3>"
              <p className="text-sm text-gray-600 mt-1">统一社会信用代码</p>"
              <p className="text-sm font-mono text-gray-800">
                {brand.businessLicense}
              </p>

              {brand.certificationDate && ("
                <div className="mt-4 pt-4 border-t border-gray-200">"
                  <p className="text-xs text-gray-500">认证日期</p>"
                  <p className="text-sm text-gray-900">
                    {brand.certificationDate}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 联系信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>联系信息</CardTitle>
            </CardHeader>"
            <CardContent className="space-y-3">"
              <div className="flex items-center text-gray-600">"
                <Mail className="w-4 h-4 mr-3" />"
                <span className="text-sm">{brand.contactEmail}</span>
              </div>"
              <div className="flex items-center text-gray-600">"
                <Phone className="w-4 h-4 mr-3" />"
                <span className="text-sm">{brand.contactPhone}</span>
              </div>"
              <div className="flex items-center text-gray-600">"
                <MapPin className="w-4 h-4 mr-3" />"
                <span className="text-sm">{brand.address}</span>
              </div>"
              <div className="flex items-center text-gray-600">"
                <Globe className="w-4 h-4 mr-3" />'"
                <span className="text-sm">{brand.website || '暂无网站'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：详细信息表*/}"
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>企业详细信息</CardTitle>
            </CardHeader>"
            <CardContent className="space-y-6">"
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 公司名称 */}"
                <div className="space-y-2">"
                  <Label htmlFor="companyName">公司名称 *</Label>
                  <Input"
                    id="companyName"
                    value={brand.companyName}
                    onChange={e =>
                      setBrand({ ...brand, companyName: e.target.value })
                    }
                    className={errors.companyName ? 'border-red-500' : ''}
                    disabled={!editing}
                  />
                  {errors.companyName && (
                    <div className="flex items-center text-red-500 text-sm">"
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.companyName}
                    </div>
                  )}
                </div>

                {/* 营业执照号码 */}"
                <div className="space-y-2">"
                  <Label htmlFor="businessLicense">营业执照号码 *</Label>
                  <Input"
                    id="businessLicense"
                    value={brand.businessLicense}
                    onChange={e =>
                      setBrand({ ...brand, businessLicense: e.target.value })
                    }
                    className={errors.businessLicense ? 'border-red-500' : ''}
                    disabled={!editing}
                  />
                  {errors.businessLicense && (
                    <div className="flex items-center text-red-500 text-sm">"
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.businessLicense}
                    </div>
                  )}
                </div>

                {/* 法定代表*/}"
                <div className="space-y-2">"
                  <Label htmlFor="legalRepresentative">法定代表*</Label>
                  <Input"
                    id="legalRepresentative"
                    value={brand.legalRepresentative}
                    onChange={e =>
                      setBrand({
                        ...brand,
                        legalRepresentative: e.target.value,
                      })
                    }
                    className={
                      errors.legalRepresentative ? 'border-red-500' : ''
                    }
                    disabled={!editing}
                  />
                  {errors.legalRepresentative && (
                    <div className="flex items-center text-red-500 text-sm">"
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.legalRepresentative}
                    </div>
                  )}
                </div>

                {/* 所属行*/}"
                <div className="space-y-2">"
                  <Label htmlFor="industry">所属行/Label>
                  <select"
                    id="industry"
                    value={brand.industry}
                    onChange={e =>
                      setBrand({ ...brand, industry: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!editing}
                  >"
                    <option value="">请选择行业</option>"
                    <option value="电子信息">电子信息</option>"
                    <option value="机械制>机械制/option>"
                    <option value="生物医药">生物医药</option>"
                    <option value="新材>新材/option>"
                    <option value="新能>新能/option>"
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 公司规模 */}"
                <div className="space-y-2">"
                  <Label htmlFor="companySize">公司规模</Label>
                  <select"
                    id="companySize"
                    value={brand.companySize}
                    onChange={e =>
                      setBrand({ ...brand, companySize: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!editing}
                  >"
                    <option value="">请选择规模</option>"
                    <option value="1-10>1-10/option>"
                    <option value="10-50>10-50/option>"
                    <option value="50-100>50-100/option>"
                    <option value="100-500>100-500/option>"
                    <option value="500人以>500人以/option>
                  </select>
                </div>

                {/* 成立日期 */}"
                <div className="space-y-2">"
                  <Label htmlFor="establishmentDate">成立日期</Label>
                  <Input"
                    id="establishmentDate""
                    type="date"
                    value={brand.establishmentDate}
                    onChange={e =>
                      setBrand({ ...brand, establishmentDate: e.target.value })
                    }
                    disabled={!editing}
                  />
                </div>

                {/* 注册资本 */}
                <div className="space-y-2">"
                  <Label htmlFor="registeredCapital">注册资本</Label>
                  <Input"
                    id="registeredCapital"
                    value={brand.registeredCapital}
                    onChange={e =>
                      setBrand({ ...brand, registeredCapital: e.target.value })
                    }
                    placeholder="如：1000万人民币"
                    disabled={!editing}
                  />
                </div>

                {/* 联系电话 */}"
                <div className="space-y-2">"
                  <Label htmlFor="contactPhone">联系电话 *</Label>
                  <Input"
                    id="contactPhone"
                    value={brand.contactPhone}
                    onChange={e =>
                      setBrand({ ...brand, contactPhone: e.target.value })
                    }
                    className={errors.contactPhone ? 'border-red-500' : ''}
                    disabled={!editing}
                  />
                  {errors.contactPhone && (
                    <div className="flex items-center text-red-500 text-sm">"
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.contactPhone}
                    </div>
                  )}
                </div>

                {/* 联系邮箱 */}"
                <div className="space-y-2">"
                  <Label htmlFor="contactEmail">联系邮箱 *</Label>
                  <Input"
                    id="contactEmail""
                    type="email"
                    value={brand.contactEmail}
                    onChange={e =>
                      setBrand({ ...brand, contactEmail: e.target.value })
                    }
                    className={errors.contactEmail ? 'border-red-500' : ''}
                    disabled={!editing}
                  />
                  {errors.contactEmail && (
                    <div className="flex items-center text-red-500 text-sm">"
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.contactEmail}
                    </div>
                  )}
                </div>

                {/* 公司网址 */}"
                <div className="space-y-2">"
                  <Label htmlFor="website">公司网址</Label>
                  <Input"
                    id="website""
                    type="url"
                    value={brand.website}
                    onChange={e =>
                      setBrand({ ...brand, website: e.target.value })
                    }
                    placeholder="https://"
                    disabled={!editing}
                  />
                </div>

                {/* 公司地址 */}"
                <div className="md:col-span-2 space-y-2">"
                  <Label htmlFor="address">公司地址</Label>
                  <Input"
                    id="address"
                    value={brand.address}
                    onChange={e =>
                      setBrand({ ...brand, address: e.target.value })
                    }
                    placeholder="请输入详细地址"
                    disabled={!editing}
                  />
                </div>

                {/* 公司简*/}"
                <div className="md:col-span-2 space-y-2">"
                  <Label htmlFor="description">公司简/Label>
                  <Textarea"
                    id="description"
                    value={brand.description}
                    onChange={e =>
                      setBrand({ ...brand, description: e.target.value })
                    }
                    placeholder="简单介绍一下您的公.."
                    rows={4}
                    disabled={!editing}
                  />"
                  <p className="text-sm text-gray-500">
                    {brand.description.length}/500 字符
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"