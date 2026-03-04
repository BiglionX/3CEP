import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Flag,
  Search,
  Filter,
} from 'lucide-react';

interface ReviewTask {
  id: string;
  content: string;
  contentType: 'text' | 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  reviewer?: string;
  reason?: string;
}

export class ManualReviewTool {
  private tasks: ReviewTask[] = [];

  constructor() {
    // 初始化示例任?    this.tasks = [
      {
        id: 'task-001',
        content: '这是一个测试内容，需要人工审核确认是否符合社区规范?,
        contentType: 'text',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-002',
        content: '另一个待审核的内容示例，包含一些敏感词汇需要仔细检查?,
        contentType: 'text',
        status: 'pending',
        priority: 'high',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }

  getPendingTasks(): ReviewTask[] {
    return this.tasks.filter(task => task.status === 'pending');
  }

  getCompletedTasks(): ReviewTask[] {
    return this.tasks.filter(task => task.status !== 'pending');
  }

  approveTask(taskId: string, reviewer: string, comment: string = ''): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.status === 'pending') {
      task.status = 'approved';
      task.reviewer = reviewer;
      task.reason = comment;
      return true;
    }
    return false;
  }

  rejectTask(taskId: string, reviewer: string, comment: string = ''): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.status === 'pending') {
      task.status = 'rejected';
      task.reviewer = reviewer;
      task.reason = comment;
      return true;
    }
    return false;
  }

  addTask(
    content: string,
    contentType: 'text' | 'image' | 'video',
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): string {
    const taskId = `task-${Date.now()}`;
    this.tasks.push({
      id: taskId,
      content,
      contentType,
      status: 'pending',
      priority,
      createdAt: new Date().toISOString(),
    });
    return taskId;
  }

  getTaskStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  } {
    return {
      total: this.tasks.length,
      pending: this.tasks.filter(t => t.status === 'pending').length,
      approved: this.tasks.filter(t => t.status === 'approved').length,
      rejected: this.tasks.filter(t => t.status === 'rejected').length,
    };
  }
}

// 导出全局实例
export const manualReviewTool = new ManualReviewTool();
