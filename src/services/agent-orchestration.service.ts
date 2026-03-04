// 智能体编排核心服?import { supabase } from '@/lib/supabase';
import {
  AgentOrchestration,
  WorkflowDefinition,
  ExecutionInstance,
  CreateOrchestrationRequest,
  ExecuteOrchestrationRequest,
  OrchestrationStatus,
  ExecutionStatus,
} from '@/types/team-management.types';

export class AgentOrchestrationService {
  private supabase = supabase;

  /**
   * 创建新的智能体编?   */
  async createOrchestration(
    data: CreateOrchestrationRequest,
    teamId: string
  ): Promise<AgentOrchestration> {
    const { data: orchestration, error } = await this.supabase
      .from('team_orchestrations')
      .insert({
        team_id: teamId,
        name: data.name,
        description: data.description,
        workflow: data.workflow,
        trigger_type: data.triggerType,
        schedule_config: data.scheduleConfig,
        event_triggers: data.eventTriggers,
        status: 'draft',
        created_by: (await this.supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw new Error(`创建编排失败: ${error.message}`);
    return orchestration;
  }

  /**
   * 获取团队的所有编?   */
  async getTeamOrchestrations(
    teamId: string,
    status?: OrchestrationStatus
  ): Promise<AgentOrchestration[]> {
    let query = this.supabase
      .from('team_orchestrations')
      .select('*')
      .eq('team_id', teamId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orchestrations, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw new Error(`获取编排列表失败: ${error.message}`);
    return orchestrations || [];
  }

  /**
   * 获取编排详情
   */
  async getOrchestrationById(id: string): Promise<AgentOrchestration | null> {
    const { data: orchestration, error } = await this.supabase
      .from('team_orchestrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // 未找?      throw new Error(`获取编排详情失败: ${error.message}`);
    }
    return orchestration;
  }

  /**
   * 更新编排
   */
  async updateOrchestration(
    id: string,
    updates: Partial<
      Omit<
        AgentOrchestration,
        'id' | 'teamId' | 'createdBy' | 'createdAt' | 'updatedAt'
      >
    >
  ): Promise<AgentOrchestration> {
    const { data: orchestration, error } = await this.supabase
      .from('team_orchestrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`更新编排失败: ${error.message}`);
    return orchestration;
  }

  /**
   * 删除编排
   */
  async deleteOrchestration(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_orchestrations')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`删除编排失败: ${error.message}`);
  }

  /**
   * 执行编排
   */
  async executeOrchestration(
    orchestrationId: string,
    requestData: ExecuteOrchestrationRequest = {}
  ): Promise<ExecutionInstance> {
    // 首先获取编排信息验证状?    const orchestration = await this.getOrchestrationById(orchestrationId);
    if (!orchestration) {
      throw new Error('编排不存?);
    }

    if (orchestration.status !== 'active') {
      throw new Error('只有激活状态的编排才能执行');
    }

    // 创建执行实例
    const { data: execution, error: createError } = await this.supabase
      .from('team_execution_instances')
      .insert({
        orchestration_id: orchestrationId,
        status: 'pending',
        triggered_by: (await this.supabase.auth.getUser()).data.user?.id,
        inputs: requestData.inputs || {},
      })
      .select()
      .single();

    if (createError)
      throw new Error(`创建执行实例失败: ${createError.message}`);

    // 异步执行工作?    this.processWorkflow(
      execution.id,
      orchestration.workflow,
      requestData.inputs || {}
    ).catch(error => {
      console.error('工作流执行失?', error);
      // 更新执行状态为失败
      this.updateExecutionStatus(execution.id, 'failed', {
        code: 'WORKFLOW_ERROR',
        message: error.message,
      });
    });

    // 更新编排的最后执行时?    await this.updateOrchestration(orchestrationId, {
      lastExecutedAt: new Date().toISOString(),
      executionCount: orchestration.executionCount + 1,
    });

    return execution;
  }

  /**
   * 处理工作流执?   */
  private async processWorkflow(
    executionId: string,
    workflow: WorkflowDefinition,
    inputs: Record<string, any>
  ): Promise<void> {
    try {
      // 更新状态为运行?      await this.updateExecutionStatus(executionId, 'running');

      const startTime = Date.now();
      const logs: any[] = [];

      // 初始化变?      const variables: Record<string, any> = {
        ...inputs,
        ...Object.fromEntries(
          workflow.variables.map(v => [v.name, v.initialValue])
        ),
      };

      // 按拓扑排序执行节?      const executionOrder = this.topologicalSort(workflow);
      const nodeResults: Record<string, any> = {};

      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        try {
          logs.push({
            timestamp: new Date().toISOString(),
            nodeId: node.id,
            level: 'info',
            message: `开始执行节? ${node.name}`,
          });

          // 执行节点逻辑
          const result = await this.executeNode(node, variables, nodeResults);
          nodeResults[node.id] = result;

          logs.push({
            timestamp: new Date().toISOString(),
            nodeId: node.id,
            level: 'info',
            message: `节点执行完成: ${node.name}`,
            data: result,
          });
        } catch (error: any) {
          logs.push({
            timestamp: new Date().toISOString(),
            nodeId: node.id,
            level: 'error',
            message: `节点执行失败: ${node.name}`,
            data: { error: error.message },
          });
          throw error;
        }
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);

      // 更新执行成功
      await this.updateExecutionStatus(executionId, 'completed', null, {
        outputs: nodeResults,
        logs,
        duration,
      });
    } catch (error: any) {
      // 更新执行失败
      await this.updateExecutionStatus(executionId, 'failed', {
        code: 'EXECUTION_FAILED',
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: any,
    variables: Record<string, any>,
    nodeResults: Record<string, any>
  ): Promise<any> {
    switch (node.type) {
      case 'agent':
        return await this.executeAgentNode(node, variables, nodeResults);
      case 'condition':
        return await this.executeConditionNode(node, variables, nodeResults);
      case 'data':
        return await this.executeDataNode(node, variables, nodeResults);
      default:
        throw new Error(`不支持的节点类型: ${node.type}`);
    }
  }

  /**
   * 执行智能体节?   */
  private async executeAgentNode(
    node: any,
    variables: Record<string, any>,
    nodeResults: Record<string, any>
  ): Promise<any> {
    const agentId = node.config.agentId;
    const inputs = this.resolveNodeInputs(node, variables, nodeResults);

    // 调用智能体API执行
    const response = await fetch(`/api/agents/${agentId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs }),
    });

    if (!response.ok) {
      throw new Error(`智能体执行失? ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 执行条件节点
   */
  private async executeConditionNode(
    node: any,
    variables: Record<string, any>,
    nodeResults: Record<string, any>
  ): Promise<boolean> {
    const { condition } = node.config;
    const value = this.resolveVariable(condition.field, variables, nodeResults);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'notEquals':
        return value !== condition.value;
      case 'greaterThan':
        return value > condition.value;
      case 'lessThan':
        return value < condition.value;
      default:
        throw new Error(`不支持的比较操作? ${condition.operator}`);
    }
  }

  /**
   * 执行数据处理节点
   */
  private async executeDataNode(
    node: any,
    variables: Record<string, any>,
    nodeResults: Record<string, any>
  ): Promise<any> {
    const { operation, params } = node.config;
    const inputData = this.resolveNodeInputs(node, variables, nodeResults);

    switch (operation) {
      case 'transform':
        return this.transformData(
          Array.isArray(inputData) ? inputData : [inputData],
          params
        );
      case 'filter':
        return this.filterData(
          Array.isArray(inputData) ? inputData : [inputData],
          params
        );
      case 'aggregate':
        return this.aggregateData(
          Array.isArray(inputData) ? inputData : [inputData],
          params
        );
      default:
        throw new Error(`不支持的数据操作: ${operation}`);
    }
  }

  /**
   * 解析节点输入
   */
  private resolveNodeInputs(
    node: any,
    variables: Record<string, any>,
    nodeResults: Record<string, any>
  ): Record<string, any> {
    const inputs: Record<string, any> = {};

    for (const input of node.inputs || []) {
      inputs[input.name] = this.resolveVariable(
        input.id,
        variables,
        nodeResults
      );
    }

    return inputs;
  }

  /**
   * 解析变量引用
   */
  private resolveVariable(
    varRef: string,
    variables: Record<string, any>,
    nodeResults: Record<string, any>
  ): any {
    // 处理变量引用格式: "variables.varName" �?"nodes.nodeId.outputName"
    if (varRef.startsWith('variables.')) {
      const varName = varRef.split('.')[1];
      return variables[varName];
    } else if (varRef.startsWith('nodes.')) {
      const [, nodeId, outputName] = varRef.split('.');
      const nodeResult = nodeResults[nodeId];
      return nodeResult ? nodeResult[outputName] : undefined;
    }
    return variables[varRef];
  }

  /**
   * 拓扑排序获取执行顺序
   */
  private topologicalSort(workflow: WorkflowDefinition): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    const temp = new Set<string>();

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        throw new Error('工作流存在循环依?);
      }
      if (visited.has(nodeId)) return;

      temp.add(nodeId);
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (node) {
        // 查找所有指向此节点的连?        const incomingConnections = workflow.connections.filter(
          conn => conn.targetNodeId === nodeId
        );

        for (const conn of incomingConnections) {
          visit(conn.sourceNodeId);
        }
      }
      temp.delete(nodeId);
      visited.add(nodeId);
      result.push(nodeId);
    };

    // 从没有输入连接的节点开?    const startNodes = workflow.nodes.filter(node => {
      return !workflow.connections.some(conn => conn.targetNodeId === node.id);
    });

    for (const node of startNodes) {
      visit(node.id);
    }

    // 处理剩余节点
    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }

    return result;
  }

  /**
   * 数据转换操作
   */
  private transformData(data: any, params: any): any {
    const { mapping } = params;
    if (Array.isArray(data)) {
      return data.map(item => this.applyMapping(item, mapping));
    } else {
      return this.applyMapping(data, mapping);
    }
  }

  /**
   * 数据过滤操作
   */
  private filterData(data: any[], params: any): any[] {
    const { condition } = params;
    return data.filter(item => {
      const value = item[condition.field];
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'contains':
          return String(value).includes(condition.value);
        default:
          return true;
      }
    });
  }

  /**
   * 数据聚合操作
   */
  private aggregateData(data: any[], params: any): any {
    const { groupBy, aggregations } = params;
    const grouped: Record<string, any[]> = {};

    // 分组
    data.forEach(item => {
      const key = groupBy.map((field: string) => item[field]).join('|');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    // 聚合
    const result: any[] = [];
    Object.entries(grouped).forEach(([key, group]) => {
      const aggregated: Record<string, any> = {};

      // 设置分组字段
      const groupValues = key.split('|');
      groupBy.forEach((field: string, index: number) => {
        aggregated[field] = groupValues[index];
      });

      // 执行聚合操作
      Object.entries(aggregations).forEach(([field, aggFunc]) => {
        switch (aggFunc) {
          case 'count':
            aggregated[field] = group.length;
            break;
          case 'sum':
            aggregated[field] = group.reduce(
              (sum, item) => sum + (item[field] || 0),
              0
            );
            break;
          case 'avg':
            aggregated[field] =
              group.reduce((sum, item) => sum + (item[field] || 0), 0) /
              group.length;
            break;
        }
      });

      result.push(aggregated);
    });

    return result;
  }

  /**
   * 应用字段映射
   */
  private applyMapping(obj: any, mapping: Record<string, string>): any {
    const result: Record<string, any> = {};
    Object.entries(mapping).forEach(([newKey, oldKey]) => {
      result[newKey] = obj[oldKey];
    });
    return result;
  }

  /**
   * 更新执行状?   */
  private async updateExecutionStatus(
    executionId: string,
    status: ExecutionStatus,
    error: any = null,
    additionalData: any = {}
  ): Promise<void> {
    const updateData: any = {
      status,
      ...(status === 'completed' || status === 'failed'
        ? {
            completed_at: new Date().toISOString(),
          }
        : {}),
      ...(error ? { error } : {}),
      ...additionalData,
    };

    const { error: updateError } = await this.supabase
      .from('team_execution_instances')
      .update(updateData)
      .eq('id', executionId);

    if (updateError) {
      console.error('更新执行状态失?', updateError);
    }
  }

  /**
   * 获取执行实例详情
   */
  async getExecutionInstance(id: string): Promise<ExecutionInstance | null> {
    const { data: execution, error } = await this.supabase
      .from('team_execution_instances')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`获取执行实例失败: ${error.message}`);
    }
    return execution;
  }

  /**
   * 获取编排的执行历?   */
  async getOrchestrationExecutions(
    orchestrationId: string,
    limit: number = 50
  ): Promise<ExecutionInstance[]> {
    const { data: executions, error } = await this.supabase
      .from('team_execution_instances')
      .select('*')
      .eq('orchestration_id', orchestrationId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`获取执行历史失败: ${error.message}`);
    return executions || [];
  }
}
