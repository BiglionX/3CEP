import { MyAgent } from '../src/index';

describe('test-agent Tests', () => {
  let agent: MyAgent;

  beforeEach(async () => {
    agent = new MyAgent({ apiKey: 'test-key' });
    await agent.initialize();
  });

  afterEach(async () => {
    await agent.destroy();
  });

  test('应该正确处理输入', async () => {
    const result = await agent.process({
      content: 'Hello World',
    });

    expect(result.content).toContain('Hello World');
    expect(result.metadata?.processed).toBe(true);
  });
});
