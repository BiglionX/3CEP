/**
 * GitHub 统计信息展示组件
 *
 * 用于在技能卡片和详情页中展示 GitHub 仓库统计数据
 */

'use client';

import { useGitHubRepo } from '@/lib/github/hooks';
import { formatNumber, formatDate } from '@/lib/github/api';

interface GitHubStatsProps {
  /** 仓库名称（不包含 owner�?*/
  repoName: string;
  /** 是否显示详细统计，默?false */
  detailed?: boolean;
  /** 自定义类?*/
  className?: string;
}

/**
 * GitHub 统计徽章组件
 */
export function GitHubStats({
  repoName,
  detailed = false,
  className = '',
}: GitHubStatsProps) {
  const { data, loading, error } = useGitHubRepo(repoName);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !data) {
    // API 失败时不显示任何内容，避免影响用户体?    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* 星标 */}
      <div
        className="flex items-center gap-1 text-sm text-gray-600"
        title="GitHub Stars"
      >
        <svg
          className="w-4 h-4 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="font-medium">
          {formatNumber(data.stargazers_count)}
        </span>
      </div>

      {/* Fork */}
      <div
        className="flex items-center gap-1 text-sm text-gray-600"
        title="Forks"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H2a2 2 0 01-2-2V5a2 2 0 012-2h4.586a1 1 0 01.707-.293l4.414-4.414a1 1 0 01.293-.707V5a2 2 0 012 2"
          />
        </svg>
        <span className="font-medium">{formatNumber(data.forks_count)}</span>
      </div>

      {/* 详细统计信息 */}
      {detailed && (
        <>
          {/* 订阅?*/}
          <div
            className="flex items-center gap-1 text-sm text-gray-600"
            title="Watchers"
          >
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="font-medium">
              {formatNumber(data.subscribers_count)}
            </span>
          </div>

          {/* 最后更新时?*/}
          <div
            className="flex items-center gap-1 text-sm text-gray-600"
            title="Last Updated"
          >
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{formatDate(data.updated_at)}</span>
          </div>

          {/* 主要语言 */}
          {data.language && (
            <div
              className="flex items-center gap-1 text-sm text-gray-600"
              title="Primary Language"
            >
              <span className="font-medium">{data.language}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * GitHub 徽章组件（使?shields.io�? */
export function GitHubBadge({
  repoName,
  type = 'stars',
}: {
  repoName: string;
  type?: 'stars' | 'forks' | 'issues' | 'last-update';
}) {
  const badgeUrl = {
    stars: `https://img.shields.io/github/stars/procyc-skills/${repoName}?style=social`,
    forks: `https://img.shields.io/github/forks/procyc-skills/${repoName}?style=social`,
    issues: `https://img.shields.io/github/issues/procyc-skills/${repoName}`,
    'last-update': `https://img.shields.io/github/last-commit/procyc-skills/${repoName}`,
  };

  return (
    <img
      src={badgeUrl[type]}
      alt={`${type} badge`}
      className="h-5 inline-block"
      loading="lazy"
    />
  );
}

/**
 * GitHub 话题标签组件
 */
export function GitHubTopics({ topics }: { topics: string[] }) {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {topics.map((topic, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors cursor-default"
        >
          #{topic}
        </span>
      ))}
    </div>
  );
}
