import { GeneratedDesign, ModelType, DeviceType, OptimizedPrompt } from '../../../types';

/**
 * 创建单个模拟设计稿
 */
export function createMockDesign(overrides?: Partial<GeneratedDesign>): GeneratedDesign {
    const baseId = `design-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return {
        id: baseId,
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        prompt: 'Mock UI design prompt for automated testing',
        variant: 'A',
        model: ModelType.GEMINI_FLASH_IMAGE,
        timestamp: Date.now(),
        device: DeviceType.IPHONE,
        isFavorite: false,
        ...overrides,
    };
}

/**
 * 创建多个模拟设计稿
 */
export function createMockDesigns(count: number, baseOverrides?: Partial<GeneratedDesign>): GeneratedDesign[] {
    const variants = ['A', 'B', 'C', 'D'];

    return Array.from({ length: count }, (_, i) =>
        createMockDesign({
            id: `design-${i}-${Date.now()}`,
            variant: variants[i % 4],
            timestamp: Date.now() - (count - i) * 1000, // 递减的时间戳
            ...baseOverrides,
        })
    );
}

/**
 * 创建模拟的优化提示词
 */
export function createMockOptimizedPrompts(basePrompt: string = '测试UI设计'): OptimizedPrompt[] {
    return [
        {
            id: 'prompt-a',
            type: 'A',
            label: '方案 A - 经典居中布局',
            content: `${basePrompt} - 采用经典的居中对称布局，适合内容展示型页面`,
        },
        {
            id: 'prompt-b',
            type: 'B',
            label: '方案 B - 左右分栏布局',
            content: `${basePrompt} - 使用左右分栏设计，提高信息密度和浏览效率`,
        },
        {
            id: 'prompt-c',
            type: 'C',
            label: '方案 C - 全屏沉浸式',
            content: `${basePrompt} - 全屏沉浸式设计，强化视觉冲击力和用户专注度`,
        },
        {
            id: 'prompt-d',
            type: 'D',
            label: '方案 D - 卡片式布局',
            content: `${basePrompt} - 采用卡片式模块化设计，灵活且易于扩展`,
        },
    ];
}

/**
 * 创建模拟的生成组
 */
export function createMockGenerationGroup(model: ModelType, designCount: number = 4) {
    return {
        model,
        designs: createMockDesigns(designCount, { model }),
    };
}

/**
 * 为多个模型创建生成组
 */
export function createMultiModelGroups(models: ModelType[]) {
    return models.map(model => createMockGenerationGroup(model));
}

/**
 * 生成随机ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 创建模拟的base64图片URL（1x1透明像素）
 */
export function createMockImageUrl(): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

/**
 * 创建带有特定内容的base64图片URL
 */
export function createMockImageWithText(text: string): string {
    // 简化版：实际应该生成真实的带文字图片，这里返回同样的透明像素
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==${btoa(text)}`;
}
