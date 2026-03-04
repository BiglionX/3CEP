'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GitHubStats } from '@/lib/github';

export default function SkillsPage() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const skills = [
    {
      name: 'procyc-find-shop',
      title: '附近维修店查?,
      category: 'LOCA',
      categoryName: '定位?,
      icon: '📍',
      description: '基于地理位置的附近维修店查询，亚毫秒级响?,
      version: '1.0.0',
      downloads: '1.2k',
      rating: 4.9,
      link: '/skill-store/find-shop',
    },
    {
      name: 'procyc-fault-diagnosis',
      title: '设备故障诊断',
      category: 'DIAG',
      categoryName: '诊断?,
      icon: '🔍',
      description: '基于大模型的 3C 设备故障智能诊断，内?14+ 故障案例',
      version: '1.0.0',
      downloads: '856',
      rating: 4.8,
      link: '/skill-store/fault-diagnosis',
    },
    {
      name: 'procyc-part-lookup',
      title: '配件兼容性查?,
      category: 'PART',
      categoryName: '配件?,
      icon: '🔧',
      description: '根据设备型号查询兼容配件，支持多维度筛?,
      version: '1.0.0',
      downloads: '623',
      rating: 4.7,
      link: '/skill-store/part-lookup',
    },
    {
      name: 'procyc-estimate-value',
      title: '设备智能估价',
      category: 'ESTM',
      categoryName: '估价?,
      icon: '💰',
      description: '基于设备档案和市场数据的智能估价，准确率 >85%',
      version: '1.0.0',
      downloads: '445',
      rating: 4.9,
      link: '/skill-store/estimate-value',
    },
  ];

  const categories = [
    { code: 'ALL', name: '全部', icon: '📦' },
    { code: 'DIAG', name: '诊断?, icon: '🔍' },
    { code: 'ESTM', name: '估价?, icon: '💰' },
    { code: 'LOCA', name: '定位?, icon: '📍' },
    { code: 'PART', name: '配件?, icon: '🔧' },
    { code: 'DATA', name: '数据?, icon: '📊' },
    { code: 'COMM', name: '通讯?, icon: '💬' },
    { code: 'AUTO', name: '自动化类', icon: '🤖' },
    { code: 'INTEG', name: '集成?, icon: '🔗' },
  ];

  const filteredSkills =
    selectedCategory && selectedCategory !== 'ALL'
      ? skills.filter(skill => skill.category === selectedCategory)
      : skills;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/skill-store"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                �?返回商店首页
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                所有技?              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <Link
              key={cat.code}
              href={`/skill-store/skills${cat.code === 'ALL' ? '' : `?category=${cat.code}`}`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (!selectedCategory && cat.code === 'ALL') ||
                selectedCategory === cat.code
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map(skill => (
            <Link
              key={skill.name}
              href={skill.link}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{skill.icon}</div>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  {skill.categoryName}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {skill.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {skill.description}
              </p>

              {/* GitHub 统计信息 */}
              <div className="mb-4">
                <GitHubStats repoName={skill.name} />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>v{skill.version}</span>
                <div className="flex items-center gap-4">
                  <span>�?{skill.rating}</span>
                  <span>⬇️ {skill.downloads}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              暂无技?            </h3>
            <p className="text-gray-600">更多技能正在开发中，敬请期待！</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              想贡献自己的技能？
            </h2>
            <p className="text-indigo-100 mb-6">
              查看我们的开发者指南，了解如何开发和发布技?            </p>
            <Link
              href="/docs/how-to-develop"
              className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
            >
              开始开发技?�?            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

