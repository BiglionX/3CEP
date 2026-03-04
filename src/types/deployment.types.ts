// 部署相关类型定义

export interface DeploymentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'technical' | 'analytics' | 'creative' | 'other';
  agents: Array<{
    id: string;
    name: string;
  }>;
  orchestrations: Array<{
    id: string;
    name: string;
  }>;
  estimatedSetupTime: number; // 分钟
  complexity: 'low' | 'medium' | 'high';
  popularity: number; // 0-100
}

export interface DeploymentConfig {
  teamName: string;
  adminEmail: string;
  description?: string;
  customSettings?: {
    maxMembers?: number;
    budget?: number;
    notificationEmail?: string;
    autoScaling?: boolean;
  };
}

export type DeploymentStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface DeploymentResult {
  deploymentId: string;
  status: DeploymentStatus;
  templateName: string;
  estimatedCompletionTime: number; // 毫秒
}

export interface DeploymentHistory {
  id: string;
  teamId: string;
  templateId: string;
  status: DeploymentStatus;
  progress: number;
  currentStep?: string;
  config: DeploymentConfig;
  metadata?: any;
  createdBy: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
