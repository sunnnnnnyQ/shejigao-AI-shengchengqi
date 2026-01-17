import { DeviceType, ModelType, Language } from '../types';
import { apiKeyService } from './apiKeyService';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * 获取OpenRouter API Key
 * 优先从LocalStorage读取用户配置的API Key，如果没有则使用环境变量
 */
function getApiKey(): string {
    // 优先使用用户在设置页面配置的API Key
    const userApiKey = apiKeyService.getApiKey();
    if (userApiKey) {
        return userApiKey;
    }

    // 回退到环境变量（用于开发调试）
    const envApiKey = import.meta.env?.VITE_OPENROUTER_API_KEY;
    if (envApiKey) {
        return envApiKey;
    }

    throw new Error('请先在设置页面配置OpenRouter API Key');
}

/**
 * 检查 OpenRouter API Key 是否存在
 */
export function checkApiKey(): boolean {
    return apiKeyService.hasApiKey() || !!import.meta.env?.VITE_OPENROUTER_API_KEY;
}

/**
 * 使用 OpenRouter 生成文本（用于提示词优化）
 */
export async function generateText(prompt: string, model: string = 'google/gemini-2.5-flash'): Promise<string> {
    const apiKey = getApiKey();

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': import.meta.env?.VITE_SITE_URL || 'https://aidesign.app',
                'X-Title': 'AIDesign',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter文本生成错误:', errorData);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const textContent = data?.choices?.[0]?.message?.content;

        if (!textContent) {
            throw new Error('No text content in OpenRouter response');
        }

        return textContent;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to generate text with OpenRouter');
    }
}


/**
 * 构建图像生成提示词
 * 根据选择的语言生成对应语言的UI
 */
function buildImagePrompt(userPrompt: string, device: DeviceType, language: Language): string {
    // 根据设备类型确定宽高比
    const isDesktop = device === DeviceType.PC;
    const aspectRatio = isDesktop ? '16:9' : '9:16';

    if (language === Language.CHINESE) {
        const deviceTag = isDesktop ? '桌面网页界面' : '移动应用UI';
        // 中文模式：明确要求生成中文UI
        return `请创建一个高质量的${deviceTag}设计。设计需求：${userPrompt}

**重要要求：**
- 界面中的所有文字必须使用中文（按钮文字、标题、说明文字等）
- 采用现代、专业、像素完美的设计风格
- 宽高比：${aspectRatio}
- 风格：简洁、现代、注重排版、间距和视觉层次
- 使用易读的中文字体
- 确保文字清晰可读

UI design for a ${deviceTag}. ${userPrompt}. All text in the interface MUST be in Chinese characters. Modern, professional design with ${aspectRatio} aspect ratio.`;
    } else {
        const deviceTag = isDesktop ? 'desktop web interface' : 'mobile app UI';
        // 英文模式：生成英文UI  
        return `Create a high-quality UI design for a ${deviceTag}. ${userPrompt}. 

**Important Requirements:**
- All text in the interface must be in English (button text, titles, descriptions, etc.)
- The design should be modern, professional, and pixel-perfect
- Aspect ratio: ${aspectRatio}
- Style: clean, minimalist, with attention to typography, spacing, and visual hierarchy
- Use readable English fonts
- Ensure text is clear and legible

All interface text MUST be in English. Modern, professional ${deviceTag} design with ${aspectRatio} aspect ratio.`;
    }
}

/**
 * 使用 OpenRouter API 生成 UI 设计图
 */
export async function generateUIDesign(
    prompt: string,
    model: ModelType,
    device: DeviceType,
    referenceImages?: { base64: string }[],
    language: Language = Language.CHINESE
): Promise<string> {
    const apiKey = getApiKey();

    // 验证提示词
    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
    }

    // 构建增强提示词
    const enhancedPrompt = buildImagePrompt(prompt, device, language);

    // 构建消息内容
    // 如果有参考图，使用多模态格式（content数组）
    // 否则使用简单字符串格式
    const messageContent = referenceImages && referenceImages.length > 0
        ? [
            { type: 'text' as const, text: enhancedPrompt },
            ...referenceImages.map(img => ({
                type: 'image_url' as const,
                image_url: {
                    url: img.base64,
                    detail: 'high' as const
                }
            }))
        ]
        : enhancedPrompt;

    // 准备API请求
    const requestBody = {
        model: model, // 直接使用 ModelType 值，如 'openai/dall-e-3'
        messages: [
            {
                role: 'user' as const,
                content: messageContent,
            },
        ],
    };

    try {
        // 发送请求到 OpenRouter
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': import.meta.env?.VITE_SITE_URL || 'https://aidesign.app',
                'X-Title': 'AIDesign',
            },
            body: JSON.stringify(requestBody),
        });


        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        // 解析响应
        const data = await response.json();

        // 提取图片URL
        const imageUrl = extractImageUrl(data);

        if (!imageUrl) {
            throw new Error('No image URL found in OpenRouter response');
        }

        return imageUrl;

    } catch (error) {
        // 重新抛出错误，保留原始错误信息
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to generate UI design with OpenRouter');
    }
}

/**
 * 从 OpenRouter 响应中提取图片 URL
 */
function extractImageUrl(data: any): string | null {
    try {

        const choice = data?.choices?.[0];
        if (!choice) {
            return null;
        }

        const message = choice.message;
        const content = message?.content;


        // 格式0: message.images 数组 (OpenRouter图像生成模型的标准格式)
        if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
            const imageUrl = message.images[0]?.image_url?.url;
            if (imageUrl) {
                return imageUrl;
            }
        }

        // 格式1: content是数组，包含image_url对象
        if (Array.isArray(content)) {
            const imageContent = content.find((item: any) => item.type === 'image_url');
            if (imageContent?.image_url?.url) {
                return imageContent.image_url.url;
            }
        }

        // 格式2: content是字符串URL
        if (typeof content === 'string') {
            if (content.startsWith('http://') || content.startsWith('https://')) {
                return content;
            }
            if (content.startsWith('data:image')) {
                return content;
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}
