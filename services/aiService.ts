import { DeviceType, ModelType, OptimizedPrompt } from '../types';
import * as openRouterService from './openRouterService';

/**
 * 统一的AI服务接口 - 全部使用OpenRouter
 */

/**
 * 生成UI设计图 - 使用OpenRouter
 */
export async function generateUIDesign(
    prompt: string,
    model: ModelType,
    device: DeviceType
): Promise<string> {
    return await openRouterService.generateUIDesign(prompt, model, device);
}

/**
 * 优化用户提示词 - 使用OpenRouter的Gemini文本模型
 */
export async function optimizePrompts(userInput: string): Promise<OptimizedPrompt[]> {
    const optimizationPrompt = `你是一个专业的UI设计提示词优化助手。请将用户的设计需求优化为4个不同风格的详细中文提示词。

**重要要求：**
1. 所有提示词必须使用中文
2. 生成的UI界面中的文字内容也必须是中文
3. 包含具体的中文文案示例（如按钮文字、标题、描述等）

**用户需求：** ${userInput}

请生成4个优化后的中文提示词，每个提示词应该：
1. 详细描述UI界面的布局、配色、风格
2. 包含具体的设计元素和交互说明
3. **包含中文界面文案示例**（重要！）
4. 适合AI图像生成模型理解
5. 每个提示词体现不同的设计风格（如现代简约、扁平化、拟物化、渐变等）

**输出格式（严格JSON）：**
{
  "prompts": [
    {"type": "A", "label": "标准布局", "content": "【中文提示词，包含界面中文文案】"},
    {"type": "B", "label": "分栏布局", "content": "【中文提示词，包含界面中文文案】"},
    {"type": "C", "label": "沉浸式布局", "content": "【中文提示词，包含界面中文文案】"},
    {"type": "D", "label": "模块化布局", "content": "【中文提示词，包含界面中文文案】"}
  ]
}

**示例：** 如果是登录界面，提示词中应包含"欢迎回来"、"手机号/邮箱"、"密码"、"登录"等中文文案。`;

    try {
        const responseText = await openRouterService.generateText(optimizationPrompt);

        // 解析JSON响应
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('无法从响应中提取JSON');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return parsed.prompts.map((p: any, index: number) => ({
            id: `prompt-${index}`,
            type: p.type,
            label: p.label,
            content: p.content,
        }));
    } catch (error) {
        console.error('提示词优化失败:', error);
        throw new Error('Failed to optimize prompts');
    }
}

/**
 * 检查API Key是否可用
 */
export function checkApiKey(model: ModelType): boolean {
    return openRouterService.checkApiKey();
}
