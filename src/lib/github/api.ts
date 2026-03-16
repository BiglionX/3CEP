/**
 * GitHub API 服务
 * 用于获取技能仓库的元数据（星标、下载量、更新时间等）
 * @module lib/github/api
 */
export interface GitHubRepoData {
  /** 仓库名称 */
  name: string;
  /** 完整仓库路径 (owner/repo) */
  fullName: string;
  /** 描述信息 */
  description: string | null;
  /** 星标数量 */
  stargazers_count: number;
  /** Fork 数量 */
  forks_count: number;
  /** 订阅数（watchers） */
  subscribers_count: number;
  /** 最后更新时间 */
  updated_at: string;
  /** 创建时间 */
  created_at: string;
  /** 主页地址 */
  homepage: string | null;
  /** 主要编程语言 */
  language: string | null;
  /** 主题标签 */
  topics: string[];
  /** 默认分支 */
  default_branch: string;
  /** 是否私有 */
  private: boolean;
  /** 许可证信息 */
  license?: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
}

export interface GitHubAPIError {
  status: number;
  message: string;
  documentation_url?: string;
}

/**
 * GitHub API 基础配置
 */
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_OWNER = 'procyc-skills';

/**
 * 速率限制信息
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

let rateLimit: RateLimitInfo | null = null;

/**
 * 检查是否需要担心速率限制
 */
function checkRateLimit(): void {
  if (rateLimit && rateLimit.remaining < 10) {
    console.warn(
      `⚠️  GitHub API 速率限制警告：剩余 ${rateLimit.remaining}/${rateLimit.limit}`
    );
  }
}

/**
 * 更新速率限制信息
 */
function updateRateLimit(headers: Headers): void {
  const limit = parseInt(headers.get('X-RateLimit-Limit') || '60', 10);
  const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '0', 10);
  const reset = parseInt(headers.get('X-RateLimit-Reset') || '0', 10);

  rateLimit = { limit, remaining, reset };
  checkRateLimit();
}

/**
 * 处理 GitHub API 错误
 */
function handleGitHubError(status: number, data: any): never {
  const error: GitHubAPIError = {
    status,
    message: data.message || 'Unknown GitHub API error',
    documentation_url: data.documentation_url,
  };

  if (status === 403) {
    error.message = `GitHub API 速率限制已用尽。请等待 ${new Date((rateLimit?.reset || 0) * 1000).toLocaleString()} 后重试，或配置认证 Token。`;
  } else if (status === 404) {
    error.message = `仓库未找到。请确认仓库名称正确且公开可访问。`;
  }

  throw new Error(error.message);
}

/**
 * 从 GitHub 获取仓库数据
 *
 * @param repo - 仓库名称（不包含 owner）
 * @returns 仓库元数据
 * @example
 * ```typescript
 * const data = await fetchRepoData('procyc-find-shop');
 * console.log(`Stars: ${data.stargazers_count}`);
 * ```
 */
export async function fetchRepoData(repo: string): Promise<GitHubRepoData> {
  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${repo}`;

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ProCyc-Skill-Store/2.0',
  };

  // 如果配置了 GitHub Token，则使用认证请求
  const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      handleGitHubError(response.status, errorData);
    }

    updateRateLimit(response.headers);

    const data = await response.json();

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      subscribers_count: data.subscribers_count,
      updated_at: data.updated_at,
      created_at: data.created_at,
      homepage: data.homepage,
      language: data.language,
      topics: data.topics || [],
      default_branch: data.default_branch,
      private: data.private,
      license: data.license,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`获取 GitHub 数据失败: ${String(error)}`);
  }
}

/**
 * 批量获取多个仓库的数据
 * @param repos - 仓库名称列表
 * @returns 仓库元数据映射表
 *
 * @example
 * ```typescript
 * const allData = await fetchMultipleRepoData(['procyc-find-shop', 'procyc-fault-diagnosis']);
 * console.log(`Stars: ${allData['procyc-find-shop'].stargazers_count}`);
 * ```
 */
export async function fetchMultipleRepoData(
  repos: string[]
): Promise<Record<string, GitHubRepoData>> {
  const results: Record<string, GitHubRepoData> = {};
  const errors: Array<{ repo: string; error: string }> = [];

  // 并发获取所有仓库数据
  const promises = repos.map(async repo => {
    try {
      const data = await fetchRepoData(repo);
      results[repo] = data;
    } catch (error) {
      errors.push({
        repo,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  await Promise.all(promises);

  // 报告错误（但不抛出异常，保证部分成功）
  if (errors.length > 0) {
    console.warn('部分仓库数据获取失败:', errors);
  }

  return results;
}

/**
 * 获取当前速率限制状态
 */
export function getRateLimitInfo(): RateLimitInfo | null {
  return rateLimit;
}

/**
 * 格式化数字（添加千位分隔符）
 */
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

/**
 * 格式化日期（相对时间格式）
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}个月前`;
  } else {
    return `${Math.floor(diffDays / 365)}年前`;
  }
}
