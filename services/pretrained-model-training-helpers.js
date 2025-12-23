// Default Modelfile sections we want to keep aligned across trainings
const DEFAULT_MODELFILE_SECTIONS = [
  {
    key: 'from',
    label: 'Base Model',
    description: 'Defines which Ollama/Modelfile base model Emma is built on.',
    examples: ['FROM llama3:8b']
  },
  {
    key: 'system',
    label: 'System Prompt',
    description: 'Identity + guardrails for Emma.',
    examples: ['SYSTEM """You are Emma, a grounded LightDom agent."""']
  },
  {
    key: 'template',
    label: 'Prompt Template',
    description: 'How user/system inputs are arranged.',
    examples: ['TEMPLATE """{{ .System }}\\n{{ .Prompt }}"""']
  },
  {
    key: 'parameter',
    label: 'Generation Parameters',
    description: 'Sampling + context settings (num_ctx, temperature, etc).',
    examples: ['PARAMETER num_ctx 8192', 'PARAMETER temperature 0.6']
  },
  {
    key: 'adapter',
    label: 'Adapters / LoRAs',
    description: 'Optional adapters for domain specialization.',
    examples: ['ADAPTER ./emma-adapter.gguf']
  },
  {
    key: 'message',
    label: 'Few-shot Examples',
    description: 'Seed conversation turns used during training.',
    examples: ['MESSAGE user Provide SEO audit for example.com']
  }
];

export function buildModelfileSections(providedSections = [], globalExamples = []) {
  const normalized = new Map();

  // Seed defaults
  DEFAULT_MODELFILE_SECTIONS.forEach(section => {
    normalized.set(section.key, {
      ...section,
      examples: [...section.examples]
    });
  });

  // Merge provided sections/examples
  for (const section of providedSections || []) {
    const existing = normalized.get(section.key) || {
      key: section.key,
      label: section.label || section.key,
      description: section.description || '',
      examples: []
    };

    normalized.set(section.key, {
      ...existing,
      ...section,
      examples: Array.from(new Set([...(existing.examples || []), ...(section.examples || [])]))
    });
  }

  // Ensure every section receives the shared examples if provided
  if (globalExamples?.length) {
    normalized.forEach((value, key) => {
      normalized.set(key, {
        ...value,
        examples: Array.from(new Set([...(value.examples || []), ...globalExamples]))
      });
    });
  }

  return Array.from(normalized.values());
}

export function normalizeOllamaTrainingConfig(trainingConfig = {}, defaults = {}) {
  const contextWindow =
    trainingConfig.contextWindow ||
    trainingConfig.num_ctx ||
    defaults.defaultContextWindow ||
    4096;

  const trainingExamples = Array.from(
    new Set([
      ...(trainingConfig.trainingExamples || []),
      ...(trainingConfig.examples || []),
      ...(trainingConfig.sectionExamples || [])
    ])
  );

  const modelfileSections = buildModelfileSections(
    trainingConfig.modelSections || trainingConfig.modelfileSections || [],
    trainingExamples
  );

  return {
    model: trainingConfig.ollamaModel || trainingConfig.model || defaults.defaultModel,
    contextWindow,
    modelfileSections,
    trainingExamples,
    trainAllSections: true
  };
}
