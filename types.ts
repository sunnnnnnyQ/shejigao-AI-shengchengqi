export enum DeviceType {
  IPHONE = 'iPhone',
  ANDROID = 'Android',
  PC = 'PC 网页'
}

export enum ModelType {
  // 所有模型都通过 OpenRouter
  GEMINI_FLASH_IMAGE = 'google/gemini-2.5-flash-image',
  FLUX_PRO = 'black-forest-labs/flux.2-pro',
}

export enum ModelProvider {
  OPENROUTER = 'openrouter',
}

export interface ModelMetadata {
  id: ModelType;
  provider: ModelProvider;
  displayName: string;
  description: string;
  isAvailable: boolean;
}

export interface OptimizedPrompt {
  id: string;
  type: 'A' | 'B' | 'C' | 'D';
  label: string;
  content: string;
}

export interface GeneratedDesign {
  id: string;
  url: string;
  prompt: string;
  variant: string;
  model: ModelType;
  timestamp: number;
  device: DeviceType;
  isFavorite: boolean;
}

export interface GenerationGroup {
  model: ModelType;
  designs: GeneratedDesign[];
}

// 辅助函数：获取模型提供商（现在都是OpenRouter）
export function getModelProvider(model: ModelType): ModelProvider {
  return ModelProvider.OPENROUTER;
}

// 模型元数据配置
export const MODEL_CONFIGS: Record<ModelType, ModelMetadata> = {
  [ModelType.GEMINI_FLASH_IMAGE]: {
    id: ModelType.GEMINI_FLASH_IMAGE,
    provider: ModelProvider.OPENROUTER,
    displayName: 'Gemini 2.5 Flash',
    description: 'Google Gemini - 快速生成，性价比高',
    isAvailable: true,
  },
  [ModelType.FLUX_PRO]: {
    id: ModelType.FLUX_PRO,
    provider: ModelProvider.OPENROUTER,
    displayName: 'Flux.2 Pro',
    description: 'Black Forest Labs - 顶级画质，细节丰富',
    isAvailable: true,
  },
};
