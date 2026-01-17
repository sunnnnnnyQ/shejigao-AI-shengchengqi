import { DeviceType, ModelType, OptimizedPrompt, Language } from '../types';
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
    device: DeviceType,
    referenceImages?: { base64: string }[],
    language: Language = Language.CHINESE
): Promise<string> {
    return await openRouterService.generateUIDesign(prompt, model, device, referenceImages, language);
}

/**
 * 优化用户提示词 - 使用OpenRouter的Gemini文本模型
 */
export async function optimizePrompts(userInput: string, language: Language = Language.CHINESE): Promise<OptimizedPrompt[]> {
    const optimizationPrompt = language === Language.CHINESE
        ? `你是一个专业的交互设计提示词优化助手。请将用户的设计需求优化为4个不同**布局和交互方式**的详细中文提示词。

**核心要求：**
1. 所有提示词必须使用中文
2. 生成的UI界面中的文字内容也必须是中文
3. 包含具体的中文文案示例（如按钮文字、标题、描述等）
4. **保持视觉风格统一**（配色、字体风格、圆角大小、阴影效果等应保持一致）
5. **聚焦于布局结构和交互方式的差异**

**用户需求：** ${userInput}

请生成4个优化后的中文提示词，每个提示词应该：
1. 详细描述UI界面的**布局结构**和**交互方式**
2. 包含具体的设计元素和交互说明
3. **包含中文界面文案示例**（重要！）
4. 适合AI图像生成模型理解
5. 四个提示词应在以下方面体现差异（而非视觉风格差异）：
   - **信息层级组织**：单列、双列、多层级、F型、Z型布局等
   - **导航模式**：顶部标签栏、底部导航栏、侧边栏、汉堡菜单、手势导航等
   - **内容呈现**：列表视图、网格视图、卡片流、瀑布流、时间轴等
   - **交互流程**：单步完成、分步引导、渐进式展开、抽屉式展开等
   - **空间利用**：紧凑型、宽松型、分屏、悬浮等

**输出格式（严格JSON）：**
{
  "prompts": [
    {"type": "A", "label": "标准布局", "content": "【中文提示词，重点描述标准的单列垂直布局方式，包含界面中文文案】"},
    {"type": "B", "label": "分栏布局", "content": "【中文提示词，重点描述多列或分区域的布局方式，包含界面中文文案】"},
    {"type": "C", "label": "沉浸式布局", "content": "【中文提示词，重点描述全屏沉浸或大图优先的布局方式，包含界面中文文案】"},
    {"type": "D", "label": "模块化布局", "content": "【中文提示词，重点描述卡片模块或可拖拽组件的布局方式，包含界面中文文案】"}
  ]
}

**示例：** 如果是登录界面，提示词中应包含"欢迎回来"、"手机号/邮箱"、"密码"、"登录"等中文文案。但四个变体应该在布局上有所不同：A可能是居中对齐的单列表单，B可能是左右分栏（左侧品牌宣传，右侧表单），C可能是全屏背景图上的浮动表单，D可能是分步卡片式登录流程。`
        : `You are a professional interaction design prompt optimization assistant. Optimize the user's design requirements into 4 different detailed English prompts with varying **layout and interaction approaches**.

**Core Requirements:**
1. All prompts must be in English
2. The UI text in the generated interface must also be in English
3. Include specific English copy examples (button text, titles, descriptions, etc.)
4. **Maintain consistent visual style** (colors, typography, border radius, shadows, etc. should be consistent)
5. **Focus on differences in layout structure and interaction methods**

**User Requirements:** ${userInput}

Please generate 4 optimized English prompts, each prompt should:
1. Describe the UI **layout structure** and **interaction methods** in detail
2. Include specific design elements and interaction instructions
3. **Include English interface copy examples** (Important!)
4. Be suitable for AI image generation models
5. Four prompts should differ in the following aspects (NOT visual style):
   - **Information hierarchy**: single column, multi-column, multi-level, F-pattern, Z-pattern layouts, etc.
   - **Navigation patterns**: top tab bar, bottom navigation, sidebar, hamburger menu, gesture navigation, etc.
   - **Content presentation**: list view, grid view, card flow, waterfall, timeline, etc.
   - **Interaction flows**: single-step completion, multi-step guidance, progressive disclosure, drawer expansion, etc.
   - **Space utilization**: compact, spacious, split-screen, floating, etc.

**Output Format (strict JSON):**
{
  "prompts": [
    {"type": "A", "label": "Standard Layout", "content": "[English prompt focusing on standard single-column vertical layout, with UI text examples]"},
    {"type": "B", "label": "Multi-Column Layout", "content": "[English prompt focusing on multi-column or sectioned layout, with UI text examples]"},
    {"type": "C", "label": "Immersive Layout", "content": "[English prompt focusing on full-screen immersive or hero-image-first layout, with UI text examples]"},
    {"type": "D", "label": "Modular Layout", "content": "[English prompt focusing on card modules or draggable component layout, with UI text examples]"}
  ]
}

**Example:** For a login screen, prompts should include "Welcome Back", "Email/Phone", "Password", "Sign In", etc. However, the four variants should differ in layout: A might be a centered single-column form, B might be split-screen (left brand messaging, right form), C might be a floating form over a full-screen background, D might be a multi-step card-based login flow.`;

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
