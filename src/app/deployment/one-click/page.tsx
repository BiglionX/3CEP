'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Rocket,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Zap,
  Star,
  ArrowLeft,
  Play,
  Settings,
} from 'lucide-react';
import { OneClickDeploymentService } from '@/services/one-click-deployment.service';
import { DeploymentTemplate, DeploymentConfig } from '@/types/deployment.types';

export default function OneClickDeploymentPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<DeploymentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DeploymentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [config, setConfig] = useState<DeploymentConfig>({
    teamName: '',
    adminEmail: '',
    description: '',
  });

  const deploymentService = new OneClickDeploymentService();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templateList = await deploymentService.getDeploymentTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('加载模板失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: DeploymentTemplate) => {
    setSelectedTemplate(template);
    setConfig({
      teamName: `${template.name}团队`,
      adminEmail: '',
      description: template.description,
    });
    setShowConfigForm(true);
  };

  const handleDeploy = async () => {
    if (!selectedTemplate) return;

    // 验证配置
    const validation = deploymentService.validateDeploymentConfig(config);
    if (!validation.valid) {
      alert(`配置错误:\n${validation.errors.join('\n')}`);
      return;
    }

    setDeploying(true);
    setDeploymentProgress(0);
    setCurrentStep('开始部署..');

    try {
      // 这里应该传入实际的团队ID
      const teamId = 'temp-team-id'; // 实际使用时需要获取当前用户的团队ID

      const result = await deploymentService.deployTemplate(
        selectedTemplate.id,
        teamId,
        config
      );

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setDeploymentProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              setDeploying(false);
              alert('部署完成);
              router.push('/team'); // 跳转到团队页面            }, 1000);
            return 100;
          }
          return newProgress;
        });
      }, 500);

      // 模拟步骤更新
      const steps = [
        '初始化环境配置..',
        '部署智能体组件..',
        '配置编排流程...',
        '设置权限管理...',
        '执行最终验证..',
      ];

      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          stepIndex++;
        } else {
          clearInterval(stepInterval);
        }
      }, 1000);
    } catch (error: any) {
      setDeploying(false);
      alert(`部署失败: ${error.message}`);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business':
        return '💼';
      case 'technical':
        return '💻';
      case 'analytics':
        return '📊';
      case 'creative':
        return '🎨';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载部署模板..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </button>
            <div className="flex items-center">
              <Rocket className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">一键部署/h1>
                <p className="text-gray-600">快速部署完整的智能体解决方案/p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showConfigForm  (
          <>
            {/* 模板选择界面 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                选择部署模板
              </h2>

              {templates.length === 0  (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无可用模板
                  </h3>
                  <p className="text-gray-600">请稍后再试或联系管理员/p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">
                              {getCategoryIcon(template.category)}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {template.name}
                            </h3>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">
                              {template.popularity}%
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {template.description}
                        </p>

                        {/* 模板信息 */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {template.agents.length}个智能体
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {template.orchestrations.length}个编                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {template.estimatedSetupTime}分钟
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Settings className="w-4 h-4 text-gray-400 mr-2" />
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getComplexityColor(template.complexity)}`}
                            >
                              {template.complexity === 'low'
                                 '简
                                : template.complexity === 'medium'
                                   '中等'
                                  : '复杂'}
                            </span>
                          </div>
                        </div>

                        <button
                          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectTemplate(template);
                          }}
                        >
                          立即部署
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 使用说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                💡 部署说明
              </h3>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>选择适合您业务场景的预设模板</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    一键部署包含智能体、编排流程和权限设置的完整解决方                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>部署完成后可直接使用，无需额外配置</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>支持随时调整和自定义配置</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          /* 配置表单界面 */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="mr-4 p-3 bg-blue-100 rounded-lg">
                  <Rocket className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    部署 {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-600">
                    预计耗时 {selectedTemplate.estimatedSetupTime} 分钟
                  </p>
                </div>
              </div>

              {deploying  (
                /* 部署进度显示 */
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto relative">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                      <div
                        className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
                        style={{ animationDuration: '1s' }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {Math.round(deploymentProgress)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    正在部署..
                  </h3>
                  <p className="text-gray-600 mb-6">{currentStep}</p>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${deploymentProgress}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => setDeploying(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    取消部署
                  </button>
                </div>
              ) : (
                /* 配置表单 */
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleDeploy();
                  }}
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        团队名称 *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={config.teamName}
                        onChange={e =>
                          setConfig({ ...config, teamName: e.target.value })
                        }
                        placeholder="请输入团队名
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        管理员邮*
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={config.adminEmail}
                        onChange={e =>
                          setConfig({ ...config, adminEmail: e.target.value })
                        }
                        placeholder="admin@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        团队描述
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={config.description}
                        onChange={e =>
                          setConfig({ ...config, description: e.target.value })
                        }
                        placeholder="简要描述团队的主要职能和目
                      />
                    </div>

                    {/* 模板包含内容预览 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        将部署以下内
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>
                            {selectedTemplate.agents.length} 个智能体
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          <span>
                            {selectedTemplate.orchestrations.length} 个编排流程                          </span>
                        </div>
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          <span>完整的权限管理体系/span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowConfigForm(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      返回选择
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      开始部署                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

