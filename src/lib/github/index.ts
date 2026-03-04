/**
 * GitHub API 模块统一导出
 */

export {
  fetchRepoData,
  fetchMultipleRepoData,
  getRateLimitInfo,
  formatNumber,
  formatDate,
  type GitHubRepoData,
  type GitHubAPIError,
} from './api';

export {
  getCachedRepoData,
  setCachedRepoData,
  getOrFetchRepoData,
  getOrFetchMultipleRepoData,
  clearCache,
  getCacheStats,
  cleanupExpiredCache,
} from './cache';

export {
  useGitHubRepo,
  useGitHubMultipleRepos,
  useGitHubRepoFromCache,
} from './hooks';

export {
  GitHubStats,
  GitHubBadge,
  GitHubTopics,
} from '@/components/github/GitHubStats';
