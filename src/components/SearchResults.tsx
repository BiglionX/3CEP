'use client';

import { Search, AlertCircle, Lightbulb } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  excerpt: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  searchTerm: string;
  isLoading?: boolean;
}

export default function SearchResults({
  results,
  searchTerm,
  isLoading,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-results">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          未找到相关内?        </h3>
        <p className="text-gray-500 mb-6">
          抱歉，没有找到与"{searchTerm}"相关的结?        </p>

        <div className="max-w-md mx-auto" data-testid="suggestions">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h4 className="font-medium text-gray-700">您可以尝试：</h4>
          </div>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">�?/span>
              <span>检查拼写是否正?/span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">�?/span>
              <span>使用更常见的关键?/span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">�?/span>
              <span>减少关键词数?/span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">�?/span>
              <span>浏览热门标签</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500" data-testid="search-stats">
        找到 {results.length} 个相关结?      </div>

      <div className="grid gap-4">
        {results.map(result => (
          <div
            key={result.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-lg mb-2">{result.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{result.excerpt}</p>
            <a
              href={result.url}
              className="text-blue-600 hover:underline text-sm"
            >
              {result.url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
