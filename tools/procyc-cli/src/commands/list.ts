interface Template {
  name: string;
  description: string;
  category: string;
  tags: string[];
}

export async function listTemplates(options: {
  category?: string;
}): Promise<Template[]> {
  const templates: Template[] = [
    {
      name: 'typescript',
      description: 'TypeScript 技能模板（推荐）',
      category: 'GENERAL',
      tags: ['typescript', 'nodejs', 'type-safe'],
    },
    {
      name: 'javascript',
      description: 'JavaScript 技能模板',
      category: 'GENERAL',
      tags: ['javascript', 'nodejs'],
    },
    {
      name: 'python',
      description: 'Python 技能模板',
      category: 'GENERAL',
      tags: ['python', 'ai-ml'],
    },
    {
      name: 'diagnosis-typescript',
      description: '诊断类技能 TypeScript 模板',
      category: 'DIAGNOSIS',
      tags: ['typescript', 'diagnosis', 'ai-powered'],
    },
    {
      name: 'estimation-python',
      description: '估价类技能 Python 模板（适合 ML 模型）',
      category: 'ESTIMATION',
      tags: ['python', 'estimation', 'machine-learning'],
    },
  ];

  if (options.category) {
    return templates.filter(
      t =>
        t.category === options.category ||
        t.tags.includes(options.category!.toLowerCase())
    );
  }

  return templates;
}
