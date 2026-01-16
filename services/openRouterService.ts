import { DeviceType, ModelType } from '../types';
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
 */
function buildImagePrompt(userPrompt: string, device: DeviceType): string {
    // 根据设备类型确定宽高比和标签
    const isDesktop = device === DeviceType.PC;
    const aspectRatio = isDesktop ? '16:9' : '9:16';
    const deviceTag = isDesktop ? 'desktop web interface' : 'mobile app UI';

    // 构建增强提示词
    return `Create a high-quality UI design for a ${deviceTag}. ${userPrompt}. 
The design should be modern, professional, and pixel-perfect. 
Aspect ratio: ${aspectRatio}. 
Style: clean, minimalist, with attention to typography, spacing, and visual hierarchy.`;
}

/**
 * 使用 OpenRouter API 生成 UI 设计图
 */
export async function generateUIDesign(
    prompt: string,
    model: ModelType,
    device: DeviceType
): Promise<string> {
    const apiKey = getApiKey();

    // 验证提示词
    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
    }

    // 构建增强提示词
    const enhancedPrompt = buildImagePrompt(prompt, device);

    // 准备API请求
    const requestBody = {
        model: model, // 直接使用 ModelType 值，如 'openai/dall-e-3'
        messages: [
            {
                role: 'user',
                content: enhancedPrompt,
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
