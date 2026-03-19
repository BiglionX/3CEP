'use client';

import Link from 'next/link';

export default function SkillStorePage() {
  const featuredSkills = [
    {
      name: 'procyc-find-shop',
      title: '附近维修店查询',
      category: '定位服务',
      icon: '📍',
      description: '基于地理位置快速查找附近的 3C 维修服务',
      link: '/skill-store/find-shop',
    },
    {
      name: 'procyc-fault-diagnosis',
      title: '设备故障诊断',
      category: '诊断分析',
      icon: '🔍',
      description: '基于大模型的 3C 设备故障智能诊断',
      link: '/skill-store/fault-diagnosis',
    },
    {
      name: 'procyc-part-lookup',
      title: '配件兼容性查询',
      category: '配件服务',
      icon: '🔧',
      description: '根据设备型号查询兼容的配件信息',
      link: '/skill-store/part-lookup',
    },
    {
      name: 'procyc-estimate-value',
      title: '设备智能估价',
      category: '估值定价',
      icon: '💰',
      description: '基于设备档案和市场数据的智能估价服务',
      link: '/skill-store/estimate-value',
    },
    {
      name: 'procyc-part-price',
      title: '配件价格查询',
      category: '配件服务',
      icon: '🏷️',
      description: '查询配件市场价格、库存情况和最优供应商',
      link: '/skill-store/part-price',
    },
    {
      name: 'procyc-battery-version',
      title: '电池版本查询',
      category: '配件服务',
      icon: '🔋',
      description: '根据设备型号查询原装电池版本和兼容替代型号',
      link: '/skill-store/battery-version',
    },
  ];

  const categories = [
    { name: '诊断类', code: 'DIAG', icon: '🔍', count: 1 },
    { name: '估价类', code: 'ESTM', icon: '💰', count: 1 },
    { name: '定位类', code: 'LOCA', icon: '📍', count: 1 },
    { name: '配件类', code: 'PART', icon: '🔧', count: 3 },
    { name: '数据类', code: 'DATA', icon: '📊', count: 0 },
    { name: '通讯类', code: 'COMM', icon: '💬', count: 0 },
    { name: '自动化类', code: 'AUTO', icon: '🤖', count: 0 },
    { name: '集成类', code: 'INTEG', icon: '🔗', count: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              ProCyc Skill 商店
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              发现、安装和使用面向 3C 维修领域的专业智能技能
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/skill-store/skills"
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                浏览所有技能
              </Link>
              <Link
                href="/docs/quickstart"
                className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                开发者指南
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Skills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">热门技能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSkills.map(skill => (
            <Link
              key={skill.name}
              href={skill.link}
              className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6"
            >
              <div className="text-4xl mb-4">{skill.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {skill.title}
              </h3>
              <p className="text-sm text-indigo-600 font-medium mb-2">
                {skill.category}
              </p>
              <p className="text-gray-600 text-sm">{skill.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">技能分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(category => (
            <Link
              key={category.code}
              href={`/skill-store/skills?category=${category.code}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{category.code}</p>
              <p className="text-xs text-gray-400 mt-2">
                {category.count} 个技能
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-indigo-600 rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            开始使用 CLI 工具
          </h2>
          <div className="space-y-4">
            <div className="bg-black bg-opacity-20 rounded-lg p-4">
              <code className="text-green-300 font-mono">
                npm install -g @procyc/cli
              </code>
            </div>
            <div className="bg-black bg-opacity-20 rounded-lg p-4">
              <code className="text-green-300 font-mono">
                procyc-skill init my-skill
              </code>
            </div>
            <div className="bg-black bg-opacity-20 rounded-lg p-4">
              <code className="text-green-300 font-mono">
                procyc-skill validate
              </code>
            </div>
          </div>
          <Link
            href="/docs/quickstart"
            className="inline-block mt-8 px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
          >
            查看完整文档 →
          </Link>
        </div>
      </div>

      {/* Resources */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">开发者资源</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/docs/spec"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📄 技能规范
            </h3>
            <p className="text-gray-600">完整的 Skill 元数据和技术标准</p>
          </Link>
          <Link
            href="/docs/api"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📖 API 参考
            </h3>
            <p className="text-gray-600">详细的接口调用文档</p>
          </Link>
          <Link
            href="/examples"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💡 示例代码
            </h3>
            <p className="text-gray-600">丰富的实践案例和模板</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
