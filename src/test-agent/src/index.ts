import { BaseAgent, Agent } from '@fixcycle/agent-sdk';
import {
  AgentInput,
  AgentOutput,
  AgentConfig,
  AgentInfo,
} from '@fixcycle/agent-sdk/types';

@Agent({
  name: 'test-agent',
  version: '1.0.0',
  description: '我的第一个 FixCycle 智能体',
  category: 'sales',
})
export class MyAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    const info: AgentInfo = {
      id: 'test-agent',
      name: 'test-agent',
      description: '我的第一个 FixCycle 智能体',
      version: '1.0.0',
      category: 'sales',
      tags: ['示例'],
      author: 'Developer',
    };

    super(info, config);
  }

  protected async onInitialize(): Promise<void> {
    // TODO: 移除调试日志
    console.log('test-agent 初始化完成');
  }

  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    return {
      content: `收到消息：${input.content}`,
      metadata: { processed: true },
    };
  }

  protected async onDestroy(): Promise<void> {
    // TODO: 移除调试日志
    console.log('test-agent 清理完成');
  }
}
