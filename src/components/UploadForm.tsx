'use client';

import { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadFormProps {
  existingUrls: string[];
  onUploadSuccess?: (url: string) => void;
}

export default function UploadForm({ existingUrls, onUploadSuccess }: UploadFormProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateUrl = (input: string): boolean => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrl = (input: string): string => {
    try {
      const urlObj = new URL(input);
      return urlObj.href.toLowerCase();
    } catch {
      return input.toLowerCase();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('请输入URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('请输入有效的URL格式');
      return;
    }

    const normalizedInput = normalizeUrl(url);
    const existingNormalized = existingUrls.map(normalizeUrl);

    if (existingNormalized.includes(normalizedInput)) {
      setError('该URL已存在，请勿重复上传');
      toast.error('该URL已存在，请勿重复上传');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 模拟上传过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUploadSuccess?.(url);
      setUrl('');
      toast.success('上传成功?);
      
    } catch (err) {
      setError('上传失败，请重试');
      toast.error('上传失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium mb-2">
          内容URL
        </label>
        <div className="relative">
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/content"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="url-input"
          />
          <Upload className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm" data-testid="error-message">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        data-testid="submit-button"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            上传?..
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            上传内容
          </>
        )}
      </button>
    </form>
  );
}