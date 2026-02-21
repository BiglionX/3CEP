'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ConfigService, type SystemConfig } from '@/services/config-service';
import {
  Mail,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ConfigManager() {
  const [configs, setConfigs] = useState<Record<string, SystemConfig[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    category: 'system',
    type: 'string' as 'string' | 'number' | 'boolean' | 'json',
  });

  // 加载配置数据
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const groupedConfigs = await ConfigService.getConfigsByCategory();
      setConfigs(groupedConfigs);
    } catch (error) {
      console.error('加载配置失败:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存配置更改
  const saveConfig = async (key: string, value: any) => {
    setSaving(true);
    try {
      const success = await ConfigService.updateConfig(key, value);
      if (success) {
        toast.success('配置保存成功');
        loadConfigs(); // 重新加载配置
      } else {
        toast.error('配置保存失败');
      }
    } catch (error) {
      console.error('保存配置错误:', error);
      toast.error('保存配置时发生错误');
    } finally {
      setSaving(false);
    }
  };

  // 添加新配置
  const addNewConfig = async () => {
    if (!newConfig.key || !newConfig.value) {
      toast.error('请填写必填字段');
      return;
    }

    try {
      const success = await ConfigService.createConfig(newConfig);
      if (success) {
        toast.success('新配置添加成功');
        setNewConfig({
          key: '',
          value: '',
          description: '',
          category: 'system',
          type: 'string',
        });
        loadConfigs();
      } else {
        toast.error('添加配置失败');
      }
    } catch (error) {
      console.error('添加配置错误:', error);
      toast.error('添加配置时发生错误');
    }
  };

  // 删除配置
  const deleteConfig = async (key: string) => {
    if (confirm('确定要删除这个配置项吗？')) {
      try {
        const success = await ConfigService.deleteConfig(key);
        if (success) {
          toast.success('配置删除成功');
          loadConfigs();
        } else {
          toast.error('配置删除失败');
        }
      } catch (error) {
        console.error('删除配置错误:', error);
        toast.error('删除配置时发生错误');
      }
    }
  };

  // 渲染配置输入组件
  const renderConfigInput = (config: SystemConfig) => {
    const handleChange = (value: any) => {
      saveConfig(config.key, value);
    };

    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.value === 'true'}
              onCheckedChange={(checked: boolean) =>
                handleChange(checked.toString())
              }
            />
            <span className="text-sm text-muted-foreground">
              {config.value === 'true' ? '开启' : '关闭'}
            </span>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={config.value}
            onChange={e => handleChange(e.target.value)}
            className="max-w-32"
          />
        );

      case 'json':
        return (
          <Textarea
            value={config.value}
            onChange={e => handleChange(e.target.value)}
            rows={4}
            placeholder="JSON格式配置"
          />
        );

      default:
        return (
          <Input
            value={config.value}
            onChange={e => handleChange(e.target.value)}
            placeholder={config.description}
          />
        );
    }
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'upload':
        return <Upload className="w-4 h-4" />;
      case 'api':
        return <Server className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        加载配置中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统配置管理</h1>
          <p className="text-muted-foreground">管理系统的各项配置参数</p>
        </div>
        <Button onClick={loadConfigs} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新配置
        </Button>
      </div>

      {/* 配置标签页 */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList>
          {Object.keys(configs).map(category => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex items-center"
            >
              {getCategoryIcon(category)}
              <span className="ml-2 capitalize">{category}</span>
            </TabsTrigger>
          ))}
          <TabsTrigger value="add" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            添加配置
          </TabsTrigger>
        </TabsList>

        {/* 各分类配置内容 */}
        {Object.entries(configs).map(([category, categoryConfigs]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {categoryConfigs.map(config => (
                <Card
                  key={config.key}
                  className={config.is_system ? 'border-primary' : ''}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {config.key}
                        {config.is_system && (
                          <Badge variant="secondary" className="ml-2">
                            系统配置
                          </Badge>
                        )}
                      </CardTitle>
                      {!config.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteConfig(config.key)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {renderConfigInput(config)}
                      <div className="text-xs text-muted-foreground">
                        类型: {config.type} | 最后更新:{' '}
                        {new Date(config.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}

        {/* 添加新配置 */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>添加新配置项</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-key">配置键名 *</Label>
                  <Input
                    id="new-key"
                    value={newConfig.key}
                    onChange={e =>
                      setNewConfig({ ...newConfig, key: e.target.value })
                    }
                    placeholder="例如: custom_setting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-category">配置分类</Label>
                  <Select
                    value={newConfig.category}
                    onValueChange={v =>
                      setNewConfig({ ...newConfig, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">系统</SelectItem>
                      <SelectItem value="email">邮件</SelectItem>
                      <SelectItem value="security">安全</SelectItem>
                      <SelectItem value="upload">上传</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="custom">自定义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-type">值类型</Label>
                  <Select
                    value={newConfig.type}
                    onValueChange={(v: any) =>
                      setNewConfig({ ...newConfig, type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">字符串</SelectItem>
                      <SelectItem value="number">数字</SelectItem>
                      <SelectItem value="boolean">布尔值</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-value">配置值 *</Label>
                  <Input
                    id="new-value"
                    value={newConfig.value}
                    onChange={e =>
                      setNewConfig({ ...newConfig, value: e.target.value })
                    }
                    placeholder="配置值"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-description">配置描述</Label>
                <Textarea
                  id="new-description"
                  value={newConfig.description}
                  onChange={e =>
                    setNewConfig({ ...newConfig, description: e.target.value })
                  }
                  placeholder="配置项的说明描述"
                />
              </div>

              <Button onClick={addNewConfig} disabled={saving}>
                <Plus className="w-4 h-4 mr-2" />
                {saving ? '添加中...' : '添加配置'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
