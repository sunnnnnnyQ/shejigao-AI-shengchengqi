export enum DeviceType {
  IPHONE = 'iPhone',
  ANDROID = 'Android',
  PC = 'PC 网页'
}

// 语言类型
export enum Language {
  CHINESE = 'zh-CN',
  ENGLISH = 'en-US'
}

// 语言显示名称
export const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.CHINESE]: '中文',
  [Language.ENGLISH]: 'English'
};

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

// 参考图接口
export interface ReferenceImage {
  id: string;
  name: string;
  base64: string; // data:image/xxx;base64,xxxx
  previewUrl: string; // 用于显示的URL（通常是base64或blob URL）
  size: number; // 文件大小（字节）
  type: string; // MIME类型，如 'image/jpeg'
}

// 参考图相关常量
export const MAX_REFERENCE_IMAGES = 3;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export interface GeneratedDesign {
  id: string;
  url: string;
  prompt: string;
  variant: string;
  model: ModelType;
  timestamp: number;
  device: DeviceType;
  isFavorite: boolean;
  referenceImages?: ReferenceImage[]; // 可选：生成时使用的参考图
  language?: Language; // 可选：生成时使用的语言
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
