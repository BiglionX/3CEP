'use client';

import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  ExternalLink, 
  BookOpen, 
  FileText,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface HelpLinkProps {
  href: string;
  children?: React.ReactNode;
  topic?: string;
  variant?: 'inline' | 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  external?: boolean;
  anchor?: string;
}

export function HelpLink({
  href,
  children,
  topic,
  variant = 'inline',
  size = 'md',
  className = '',
  external = false,
  anchor
}: HelpLinkProps) {
  const helpHref = anchor ? `${href}#${anchor}` : href;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (external) {
      window.open(helpHref, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = helpHref;
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full hover:bg-gray-100 ${className}`}
        aria-label="帮助信息"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${className}`}
        aria-label="查看帮助文档"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        {children || '查看帮助'}
        {external && <ExternalLink className="w-3 h-3 ml-1" />}
      </button>
    );
  }

  // inline variant (default)
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline ${className}`}
      aria-label={`查看关于${topic || '此功能'}的帮助`}
    >
      <HelpCircle className="w-4 h-4 mr-1" />
      {children || '帮助'}
    </button>
  );
}

export function ContextualHelp({
  section,
  feature,
  className = ''
}: {
  section: string;
  feature: string;
  className?: string;
}) {
  const helpPaths: Record<string, string> = {
    'user-management': '/docs/guides/user-management-guide.md',
    'rbac-permissions': '/docs/guides/rbac-permissions-guide.md',
    'data-center': '/docs/guides/data-center-user-guide.md',
    'n8n-workflows': '/docs/technical-docs/n8n-integration-scenarios.md',
    'audit-logs': '/docs/role-guides/admin.md#审计日志管理',
    'monitoring': '/docs/deployment/performance-monitoring-setup.md',
    'backup': '/docs/guides/backup-strategy-guide.md'
  };

  const helpHref = helpPaths[section] || '/docs/guides/quick-start-guide.md';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <HelpLink 
        href={helpHref} 
        variant="inline"
        topic={feature}
      >
        <BookOpen className="w-4 h-4 mr-1" />
        {feature} 帮助
      </HelpLink>
      <span className="text-gray-400">|</span>
      <HelpLink 
        href="/docs/INDEX.md" 
        variant="inline"
        topic="文档中心"
      >
        <FileText className="w-4 h-4 mr-1" />
        文档中心
      </HelpLink>
    </div>
  );
}

export function PageHelpNavigation({
  pageTitle,
  sections
}: {
  pageTitle: string;
  sections: Array<{ id: string; title: string; icon?: React.ReactNode }>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg bg-gray-50 p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
          {pageTitle} 帮助指南
        </h3>
        <button
          className="p-1 rounded-md hover:bg-gray-200"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <ChevronRight 
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} 
          />
        </button>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-600 mb-3">
            选择您需要帮助的主题：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((section) => (
              <HelpLink
                key={section.id}
                href={`/docs/guides/${section.id}.md`}
                variant="button"
                size="sm"
                className="justify-start"
              >
                {section.icon}
                <span className="ml-2">{section.title}</span>
              </HelpLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function QuickHelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 space-y-2">
          <HelpLink 
            href="/docs/INDEX.md" 
            variant="button"
            size="sm"
            className="bg-white shadow-lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            文档中心
          </HelpLink>
          <HelpLink 
            href="/docs/guides/quick-start-guide.md" 
            variant="button"
            size="sm"
            className="bg-white shadow-lg"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            快速开始
          </HelpLink>
        </div>
      )}
      
      <button
        className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="帮助菜单"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}