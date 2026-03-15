'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SkillOption {
  name: string;
  title: string;
  icon: string;
}

const SKILLS: SkillOption[] = [
  { name: 'procyc-find-shop', title: '附近维修店查询', icon: '📍' },
  { name: 'procyc-fault-diagnosis', title: '设备故障诊断', icon: '🔍' },
  { name: 'procyc-part-lookup', title: '配件兼容性查询', icon: '🔧' },
  { name: 'procyc-estimate-value', title: '设备智能估价', icon: '💰' },
];

const DEFAULT_PARAMS: Record<string, any> = {
  'procyc-find-shop': {
    latitude: 39.9042,
    longitude: 116.4074,
    radius: 10,
    limit: 5,
  },
  'procyc-fault-diagnosis': {
    deviceType: 'phone',
    deviceBrand: 'Apple',
    symptoms: ['无法开机', '黑屏'],
  },
  'procyc-part-lookup': {
    deviceModel: 'iPhone 14',
    deviceBrand: 'Apple',
    partCategory: '屏幕',
  },
  'procyc-estimate-value': {
    deviceQrcodeId: 'device_001',
    includeBreakdown: true,
    useMarketData: true,
    currency: 'CNY',
  },
};

export default function SandboxPage() {
  const [selectedSkill, setSelectedSkill] = useState<string>(SKILLS[0].name);
  const [params, setParams] = useState<any>(DEFAULT_PARAMS[SKILLS[0].name]);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    Array<{ skill: string; time: string; success: boolean }>
  >([]);

  const handleSkillChange = (skillName: string) => {
    setSelectedSkill(skillName);
    setParams(DEFAULT_PARAMS[skillName]);
    setResult(null);
    setError(null);
  };

  const handleParamChange = (key: string, value: any) => {
    setParams((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleExecute = async () => {
    if (!apiKey) {
      setError('请输入 API Key');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const startTime = Date.now();

      // 模拟 API 调用（实际应该调用后端 API）
      const response = await fetch(`/api/v1/skills/${selectedSkill}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          version: '1.0.0',
          parameters: params,
          context: {
            timestamp: Date.now(),
            traceId: `req_${Math.random().toString(36).substring(2, 15)}`,
          },
        }),
      });

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (response.ok) {
        setResult({
          ...data,
          metadata: {
            ...data.metadata,
            executionTimeMs: executionTime,
          },
        });
        setHistory(prev => [
          ...prev.slice(-9),
          {
            skill: selectedSkill,
            time: new Date().toLocaleTimeString(),
            success: data.success,
          },
        ]);
      } else {
        setError(data.error.message || '执行失败');
      }
    } catch (err) {
      setError(err instanceof Error  err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const renderParamForm = () => {
    return Object.entries(params).map(([key, value]) => (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {key}
        </label>
        {typeof value === 'boolean' ? (
          <input
            type="checkbox"
            checked={value}
            onChange={e => handleParamChange(key, e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        ) : typeof value === 'number' ? (
          <input
            type="number"
            value={value}
            onChange={e => handleParamChange(key, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        ) : Array.isArray(value)  (
          <textarea
            value={value.join(', ')}
            onChange={e =>
              handleParamChange(
                key,
                e.target.value.split(',').map((s: string) => s.trim())
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          />
        ) : (
          <input
            type="text"
            value={value as string}
            onChange={e => handleParamChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/skill-store"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← 返回商店首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            🔬 技能测试沙盒
          </h1>
          <p className="text-gray-600 mt-2">
            在线测试 ProCyc 技能，实时查看执行结果
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Configuration */}
          <div className="space-y-6">
            {/* Skill Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1️⃣ 选择技能
              </h2>
              <select
                value={selectedSkill}
                onChange={e => handleSkillChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {SKILLS.map(skill => (
                  <option key={skill.name} value={skill.name}>
                    {skill.icon} {skill.title} ({skill.name})
                  </option>
                ))}
              </select>
            </div>

            {/* API Key Input */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2️⃣ API Key 配置
              </h2>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk_xxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-2">
                需要 API Key 才能执行技能。{' '}
                <a
                  href="/dashboard/api-keys"
                  className="text-indigo-600 hover:underline"
                >
                  获取 API Key →
                </a>
              </p>
            </div>

            {/* Parameters */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3️⃣ 配置参数
              </h2>
              {renderParamForm()}

              <button
                onClick={handleExecute}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  loading
                     'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading  '⏳ 执行中...' : '🚀 执行技能'}
              </button>
            </div>

            {/* Execution History */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📜 执行历史
                </h2>
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg ${item.success  '✅' : '❌'}`}
                        ></span>
                        <span className="text-sm font-medium text-gray-700">
                          {item.skill}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-red-800 mb-2">
                  ❌ 执行失败
                </h2>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  ✅ 执行结果
                </h2>

                {/* Metadata */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    元数据
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">执行时间:</span>
                      <span className="ml-2 font-medium">
                        {result.metadata.executionTimeMs} ms
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">版本:</span>
                      <span className="ml-2 font-medium">
                        {result.metadata.version}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">时间戳:</span>
                      <span className="ml-2 font-medium">
                        {new Date(result.metadata.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {result.metadata.traceId && (
                      <div>
                        <span className="text-gray-600">追踪 ID:</span>
                        <span className="ml-2 font-medium">
                          {result.metadata.traceId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data Output */}
                {result.data && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      输出数据
                    </h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Billing Info */}
                {result.metadata.billing && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">
                      💰 计费信息
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">已计费:</span>
                        <span className="ml-2 font-medium">
                          {result.metadata.billing.charged  '是' : '否'}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700">费用:</span>
                        <span className="ml-2 font-medium">
                          {result.metadata.billing.cost}{' '}
                          {result.metadata.billing.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!result && !error && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center py-12">
                  <span className="text-6xl">🧪</span>
                  <h3 className="text-xl font-medium text-gray-900 mt-4">
                    准备就绪
                  </h3>
                  <p className="text-gray-600 mt-2">
                    配置好技能和参数后，点击"执行技能"开始测试
                  </p>
                </div>
              </div>
            )}

            {/* Documentation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📖 使用说明
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <p className="text-sm">选择一个要测试的技能</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <p className="text-sm">输入您的 API Key（需要有效的密钥）</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <p className="text-sm">配置技能参数</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </span>
                  <p className="text-sm">点击"执行技能"查看实时结果</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
