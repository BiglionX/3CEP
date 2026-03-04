// 一键部署服?import { supabase } from '@/lib/supabase';
import {
  DeploymentTemplate,
  DeploymentConfig,
  DeploymentStatus,
  DeploymentResult,
} from '@/types/deployment.types';

export class OneClickDeploymentService {
  /**
   * 获取可用的部署模?   */
  async getDeploymentTemplates(): Promise<DeploymentTemplate[]> {
    // 模拟模板数据
    const templates: DeploymentTemplate[] = [
      {
        id: 'sales-assistant-template',
        name: '销售助手全套解决方?,
        description: '包含客户接待、销售跟进、订单处理等完整销售流?,
        category: 'business',
        agents: [
          { id: 'customer-reception', name: '客户接待智能? },
          { id: 'sales-followup', name: '销售跟进智能体' },
          { id: 'order-processing', name: '订单处理智能? },
        ],
        orchestrations: [
          { id: 'customer-onboarding', name: '客户入职流程' },
          { id: 'sales-pipeline', name: '销售漏斗管? },
        ],
        estimatedSetupTime: 30, // 分钟
        complexity: 'medium',
        popularity: 95,
      },
      {
        id: 'tech-support-template',
        name: '技术支持专家系?,
        description: '自动化处理技术咨询、故障诊断和解决方案推荐',
        category: 'technical',
        agents: [
          { id: 'tech-consultant', name: '技术咨询智能体' },
          { id: 'diagnostic-expert', name: '故障诊断专家' },
          { id: 'solution-recommender', name: '解决方案推荐? },
        ],
        orchestrations: [
          { id: 'support-ticket', name: '支持工单处理' },
          { id: 'knowledge-base', name: '知识库检索流? },
        ],
        estimatedSetupTime: 45,
        complexity: 'high',
        popularity: 88,
      },
      {
        id: 'data-analysis-template',
        name: '数据分析工作?,
        description: '数据收集、清洗、分析和可视化的一站式解决方案',
        category: 'analytics',
        agents: [
          { id: 'data-collector', name: '数据采集智能? },
          { id: 'data-cleaner', name: '数据清洗专家' },
          { id: 'analyzer', name: '数据分析引擎' },
          { id: 'visualizer', name: '数据可视化工? },
        ],
        orchestrations: [
          { id: 'etl-pipeline', name: 'ETL数据管道' },
          { id: 'report-generator', name: '自动报告生成' },
        ],
        estimatedSetupTime: 60,
        complexity: 'high',
        popularity: 92,
      },
    ];

    return templates;
  }

  /**
   * 部署模板到指定团?   */
  async deployTemplate(
    templateId: string,
    teamId: string,
    config: DeploymentConfig
  ): Promise<DeploymentResult> {
    try {
      // 1. 验证模板存在
      const templates = await this.getDeploymentTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        throw new Error(`模板 ${templateId} 不存在`);
      }

      // 2. 验证团队权限
      const hasPermission = await this.verifyTeamPermission(teamId);
      if (!hasPermission) {
        throw new Error('无权在此团队部署');
      }

      // 3. 创建部署记录
      const deploymentId = `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data: deployment, error: deploymentError } = await supabase
        .from('team_deployments')
        .insert({
          id: deploymentId,
          team_id: teamId,
          template_id: templateId,
          status: 'pending',
          config: config,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (deploymentError) {
        throw new Error(`创建部署记录失败: ${deploymentError.message}`);
      }

      // 4. 异步执行部署
      this.executeDeployment(deploymentId, template, config).catch(error => {
        console.error('部署执行失败:', error);
        this.updateDeploymentStatus(deploymentId, 'failed', {
          error: error.message,
        });
      });

      return {
        deploymentId,
        status: 'pending',
        templateName: template.name,
        estimatedCompletionTime: template.estimatedSetupTime * 60 * 1000, // 转换为毫?      };
    } catch (error: any) {
      throw new Error(`部署失败: ${error.message}`);
    }
  }

  /**
   * 执行部署流程
   */
  private async executeDeployment(
    deploymentId: string,
    template: DeploymentTemplate,
    config: DeploymentConfig
  ): Promise<void> {
    try {
      // 更新状态为进行?      await this.updateDeploymentStatus(deploymentId, 'in_progress');

      const steps = [
        { name: '初始化环?, weight: 10 },
        { name: '部署智能?, weight: 40 },
        { name: '配置编排流程', weight: 30 },
        { name: '设置权限和通知', weight: 10 },
        { name: '最终验?, weight: 10 },
      ];

      let completedWeight = 0;
      const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);

      for (const step of steps) {
        // 模拟执行步骤
        await this.simulateDeploymentStep(step.name, step.weight);

        completedWeight += step.weight;
        const progress = Math.round((completedWeight / totalWeight) * 100);

        // 更新进度
        await this.updateDeploymentProgress(deploymentId, progress, step.name);
      }

      // 部署完成
      await this.updateDeploymentStatus(deploymentId, 'completed', {
        deployedAgents: template.agents.length,
        deployedOrchestrations: template.orchestrations.length,
        completionTime: new Date().toISOString(),
      });
    } catch (error: any) {
      await this.updateDeploymentStatus(deploymentId, 'failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 模拟部署步骤执行
   */
  private async simulateDeploymentStep(
    stepName: string,
    durationSeconds: number
  ): Promise<void> {
    // 模拟执行时间
    await new Promise(resolve => setTimeout(resolve, durationSeconds * 100));

    // 模拟可能的随机失败（5%概率?    if (Math.random() < 0.05) {
      throw new Error(`步骤 "${stepName}" 执行失败`);
    }
  }

  /**
   * 验证团队权限
   */
  private async verifyTeamPermission(teamId: string): Promise<boolean> {
    try {
      const { data: member, error } = await supabase
        .from('team_members')
        .select('role, permissions')
        .eq('team_id', teamId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error || !member) return false;

      // 检查是否有部署权限
      return (
        member.role === 'admin' ||
        member.role === 'editor' ||
        (member.permissions as any)?.team?.deploy === true
      );
    } catch (error) {
      console.error('权限验证失败:', error);
      return false;
    }
  }

  /**
   * 更新部署状?   */
  private async updateDeploymentStatus(
    deploymentId: string,
    status: DeploymentStatus,
    metadata: any = null
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (metadata) {
      updateData.metadata = { ...updateData.metadata, ...metadata };
    }

    const { error } = await supabase
      .from('team_deployments')
      .update(updateData)
      .eq('id', deploymentId);

    if (error) {
      console.error('更新部署状态失?', error);
    }
  }

  /**
   * 更新部署进度
   */
  private async updateDeploymentProgress(
    deploymentId: string,
    progress: number,
    currentStep: string
  ): Promise<void> {
    const { error } = await supabase
      .from('team_deployments')
      .update({
        progress,
        current_step: currentStep,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deploymentId);

    if (error) {
      console.error('更新部署进度失败:', error);
    }
  }

  /**
   * 获取部署历史
   */
  async getDeploymentHistory(
    teamId: string,
    limit: number = 20
  ): Promise<any[]> {
    const { data: deployments, error } = await supabase
      .from('team_deployments')
      .select(
        `
        *,
        template:template_id (
          name,
          description
        )
      `
      )
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取部署历史失败:', error);
      return [];
    }

    return deployments || [];
  }

  /**
   * 获取部署详情
   */
  async getDeploymentDetails(deploymentId: string): Promise<any | null> {
    const { data: deployment, error } = await supabase
      .from('team_deployments')
      .select(
        `
        *,
        team:team_id (name),
        creator:created_by (email, name)
      `
      )
      .eq('id', deploymentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`获取部署详情失败: ${error.message}`);
    }

    return deployment;
  }

  /**
   * 取消部署
   */
  async cancelDeployment(deploymentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_deployments')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', deploymentId);

      if (error) {
        throw new Error(`取消部署失败: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('取消部署出错:', error);
      return false;
    }
  }

  /**
   * 验证部署配置
   */
  validateDeploymentConfig(config: DeploymentConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 验证必需字段
    if (!config.teamName?.trim()) {
      errors.push('团队名称不能为空');
    }

    if (!config.adminEmail?.trim()) {
      errors.push('管理员邮箱不能为?);
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (config.adminEmail && !emailRegex.test(config.adminEmail)) {
      errors.push('管理员邮箱格式不正确');
    }

    // 验证自定义配置（如果提供?    if (config.customSettings) {
      const settings = config.customSettings;

      if (settings.maxMembers && settings.maxMembers < 1) {
        errors.push('最大成员数必须大于0');
      }

      if (settings.budget && settings.budget < 0) {
        errors.push('预算不能为负?);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
