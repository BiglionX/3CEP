/**
 * GitHub 数据 React Hook
 *
 * 用于?React 组件中方便地获取和展?GitHub 仓库元数? *
 * @module lib/github/hooks
 */

'use client';

import { useState, useEffect } from 'react';
import { getOrFetchRepoData, getCachedRepoData } from './cache';
import type { GitHubRepoData } from './api';

/**
 * Hook 状态接? */
interface UseGitHubRepoState {
  /** 仓库数据 */
  data: GitHubRepoData | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 重新获取数据的函?*/
  refetch: () => Promise<void>;
}

/**
 * 获取单个仓库数据?Hook
 *
 * @param repo - 仓库名称
 * @param options - 配置选项
 * @returns 仓库数据、加载状态和错误信息
 *
 * @example
 * ```tsx
 * function SkillCard({ skillName }: { skillName: string }) {
 *   const { data, loading, error } = useGitHubRepo(skillName);
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *   if (!data) return null;
 *
 *   return (
 *     <div>
 *       <span>�?{data.stargazers_count}</span>
 *       <span>🍴 {data.forks_count}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGitHubRepo(
  repo: string,
  options?: {
    /** 缓存时间（毫秒），默?5 分钟 */
    cacheTTL?: number;
    /** 是否在组件挂载时自动获取数据，默?true */
    autoFetch?: boolean;
  }
): UseGitHubRepoState {
  const [state, setState] = useState<Omit<UseGitHubRepoState, 'refetch'>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getOrFetchRepoData(repo, options?.cacheTTL);
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchData();
    }
  }, [repo]);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * 批量获取多个仓库数据?Hook
 *
 * @param repos - 仓库名称列表
 * @param options - 配置选项
 * @returns 仓库数据映射表、加载状态和错误信息
 *
 * @example
 * ```tsx
 * function SkillsPage() {
 *   const skills = ['procyc-find-shop', 'procyc-fault-diagnosis'];
 *   const { data, loading, error } = useGitHubMultipleRepos(skills);
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <div>
 *       {skills.map(name => (
 *         <SkillCard key={name} stats={data[name]} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGitHubMultipleRepos(
  repos: string[],
  options?: {
    /** 缓存时间（毫秒），默?5 分钟 */
    cacheTTL?: number;
    /** 是否在组件挂载时自动获取数据，默?true */
    autoFetch?: boolean;
  }
): {
  data: Record<string, GitHubRepoData>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<{
    data: Record<string, GitHubRepoData>;
    loading: boolean;
    error: string | null;
  }>({
    data: {},
    loading: false,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { getOrFetchMultipleRepoData } = await import('./cache');
      const data = await getOrFetchMultipleRepoData(repos, options?.cacheTTL);
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        data: {},
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchData();
    }
  }, [repos.join(',')]); // 依赖数组变化时重新获?
  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * SSR 安全的缓存检?Hook
 *
 * 在服务端渲染时直接从缓存读取数据，避免在 SSR 时调?API
 *
 * @param repo - 仓库名称
 * @returns 缓存的仓库数据（如果有）
 */
export function useGitHubRepoFromCache(repo: string): GitHubRepoData | null {
  const [data, setData] = useState<GitHubRepoData | null>(null);

  useEffect(() => {
    // 只在客户端尝试从缓存读取
    const cached = getCachedRepoData(repo);
    setData(cached);
  }, [repo]);

  return data;
}
