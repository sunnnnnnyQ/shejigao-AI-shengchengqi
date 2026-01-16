import { describe, it, expect, beforeEach, vi } from 'vitest';
import { geminiService } from '../../../services/geminiService';
import { DeviceType, ModelType, OptimizedPrompt } from '../../../types';
import { GoogleGenAI } from '@google/genai';

// 创建 mock 函数用于测试
let mockGenerateContent: ReturnType<typeof vi.fn>;

// Mock @google/genai 模块
vi.mock('@google/genai', () => {
    // 定义一个真正的类用于 mock
    class MockGoogleGenAI {
        models = {
            generateContent: (...args: any[]) => mockGenerateContent(...args),
        };

        constructor(config?: any) {
            // 构造函数可以为空或者存储 config 如果需要
        }
    }

    return {
        GoogleGenAI: MockGoogleGenAI,
        Type: {
            ARRAY: 'array',
            OBJECT: 'object',
            STRING: 'string',
        },
    };
});

describe('geminiService', () => {
    beforeEach(() => {
        // 清除所有 mock
        vi.clearAllMocks();

        // 初始化 mockGenerateContent
        mockGenerateContent = vi.fn();

        // Mock window.aistudio
        global.window = global.window || ({} as any);
        (global.window as any).aistudio = {
            hasSelectedApiKey: vi.fn(() => Promise.resolve(true)),
            openSelectKey: vi.fn(() => Promise.resolve()),
        };
    });

    describe('checkProKey', () => {
        it('本地开发环境应该返回 true', async () => {
            // Given: window.aistudio 不存在
            delete (global.window as any).aistudio;

            // When: 检查 Pro Key
            const result = await geminiService.checkProKey();

            // Then: 应该返回 true
            expect(result).toBe(true);
        });

        it('有 API Key 时应该返回 true', async () => {
            // Given: hasSelectedApiKey 返回 true
            (global.window as any).aistudio.hasSelectedApiKey.mockResolvedValue(true);

            // When: 检查 Pro Key
            const result = await geminiService.checkProKey();

            // Then: 应该返回 true 且不调用 openSelectKey
            expect(result).toBe(true);
            expect((global.window as any).aistudio.hasSelectedApiKey).toHaveBeenCalled();
            expect((global.window as any).aistudio.openSelectKey).not.toHaveBeenCalled();
        });

        it('没有 API Key 时应该打开选择对话框', async () => {
            // Given: hasSelectedApiKey 返回 false
            (global.window as any).aistudio.hasSelectedApiKey.mockResolvedValue(false);

            // When: 检查 Pro Key
            const result = await geminiService.checkProKey();

            // Then: 应该调用 openSelectKey 并返回 true
            expect((global.window as any).aistudio.hasSelectedApiKey).toHaveBeenCalled();
            expect((global.window as any).aistudio.openSelectKey).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });

    describe('optimizePrompts', () => {
        it('应该返回 4 个优化后的提示词', async () => {
            // Given: Mock API 返回 4 个提示词
            const mockResponse = {
                text: JSON.stringify([
                    { type: 'A', label: 'Standard Layout', content: 'Prompt A content' },
                    { type: 'B', label: 'Split Layout', content: 'Prompt B content' },
                    { type: 'C', label: 'Immersive Layout', content: 'Prompt C content' },
                    { type: 'D', label: 'Card Layout', content: 'Prompt D content' },
                ]),
            };
            mockGenerateContent.mockResolvedValue(mockResponse);

            // When: 调用 optimizePrompts
            const result = await geminiService.optimizePrompts('电商APP商品详情页');

            // Then: 应该返回 4 个提示词
            expect(result).toHaveLength(4);
            expect(result[0].type).toBe('A');
            expect(result[1].type).toBe('B');
            expect(result[2].type).toBe('C');
            expect(result[3].type).toBe('D');
        });

        it('每个提示词应该有 id、type、label、content', async () => {
            // Given: Mock API 返回
            const mockResponse = {
                text: JSON.stringify([
                    { type: 'A', label: 'Standard Layout', content: 'Prompt A content' },
                ]),
            };
            mockGenerateContent.mockResolvedValue(mockResponse);

            // When: 调用 optimizePrompts
            const result = await geminiService.optimizePrompts('测试输入');

            // Then: 每个提示词应该有必要字段
            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('type', 'A');
            expect(result[0]).toHaveProperty('label', 'Standard Layout');
            expect(result[0]).toHaveProperty('content', 'Prompt A content');
            expect(typeof result[0].id).toBe('string');
            expect(result[0].id.length).toBeGreaterThan(0);
        });

        it('应该使用正确的模型和配置', async () => {
            // Given: Mock API
            mockGenerateContent.mockResolvedValue({ text: '[]' });

            // When: 调用 optimizePrompts
            await geminiService.optimizePrompts('测试输入');

            // Then: 应该调用 generateContent 且参数正确
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            const callArgs = mockGenerateContent.mock.calls[0][0];
            expect(callArgs.model).toBe('gemini-3-flash-preview');
            expect(callArgs.contents).toContain('测试输入');
            expect(callArgs.config.responseMimeType).toBe('application/json');
        });

        it('应该处理 API 错误', async () => {
            // Given: Mock API 抛出错误
            mockGenerateContent.mockRejectedValue(new Error('API Error'));

            // When & Then: 应该抛出错误
            await expect(geminiService.optimizePrompts('测试输入')).rejects.toThrow('API Error');
        });

        it('应该处理空响应', async () => {
            // Given: Mock API 返回空字符串
            mockGenerateContent.mockResolvedValue({ text: '' });

            // When: 调用 optimizePrompts
            const result = await geminiService.optimizePrompts('测试输入');

            // Then: 应该返回空数组
            expect(result).toEqual([]);
        });

        it('应该为不同的输入生成不同的提示词', async () => {
            // Given: Mock API
            const mockResponse = {
                text: JSON.stringify([
                    { type: 'A', label: 'Layout A', content: 'Content A' },
                ]),
            };
            mockGenerateContent.mockResolvedValue(mockResponse);

            // When: 调用两次不同的输入
            await geminiService.optimizePrompts('输入1');
            await geminiService.optimizePrompts('输入2');

            // Then: 应该调用两次 API
            expect(mockGenerateContent).toHaveBeenCalledTimes(2);
            expect(mockGenerateContent.mock.calls[0][0].contents).toContain('输入1');
            expect(mockGenerateContent.mock.calls[1][0].contents).toContain('输入2');
        });
    });

    describe('generateUIDesign', () => {
        it('应该成功生成设计稿', async () => {
            // Given: Mock API 返回图片数据
            const mockImageData = 'mock-base64-image-data';
            const mockResponse = {
                candidates: [
                    {
                        content: {
                            parts: [
                                {
                                    inlineData: {
                                        data: mockImageData,
                                    },
                                },
                            ],
                        },
                    },
                ],
            };
            mockGenerateContent.mockResolvedValue(mockResponse);

            // When: 生成设计稿
            const result = await geminiService.generateUIDesign(
                '测试提示词',
                DeviceType.IPHONE,
                ModelType.GEMINI_FLASH_IMAGE
            );

            // Then: 应该返回 base64 图片数据
            expect(result).toBe(`data:image/png;base64,${mockImageData}`);
        });

        it('应该根据设备类型使用正确的长宽比', async () => {
            // Given: Mock API
            const mockResponse = {
                candidates: [
                    {
                        content: {
                            parts: [{ inlineData: { data: 'image-data' } }],
                        },
                    },
                ],
            };
            mockGenerateContent.mockResolvedValue(mockResponse);

            // When: 为 iPhone 生成
            await geminiService.generateUIDesign('提示词', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE);
            const iphoneCall = mockGenerateContent.mock.calls[0][0];

            // When: 为 Android 生成
            await geminiService.generateUIDesign('提示词', DeviceType.ANDROID, ModelType.GEMINI_FLASH_IMAGE);
            const androidCall = mockGenerateContent.mock.calls[1][0];

            // When: 为 PC 生成
            await geminiService.generateUIDesign('提示词', DeviceType.PC, ModelType.GEMINI_FLASH_IMAGE);
            const pcCall = mockGenerateContent.mock.calls[2][0];

            // Then: 应该使用正确的长宽比
            expect(iphoneCall.config.imageConfig.aspectRatio).toBe('9:16');
            expect(androidCall.config.imageConfig.aspectRatio).toBe('9:16');
            expect(pcCall.config.imageConfig.aspectRatio).toBe('16:9');
        });

        it('应该为移动设备添加 mobile app UI 标签', async () => {
            // Given: Mock API
            mockGenerateContent.mockResolvedValue({
                candidates: [
                    {
                        content: {
                            parts: [{ inlineData: { data: 'image-data' } }],
                        },
                    },
                ],
            });

            // When: 为 iPhone 生成
            await geminiService.generateUIDesign('商品页', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE);

            // Then: 提示词应该包含 mobile app UI
            const callArgs = mockGenerateContent.mock.calls[0][0];
            expect(callArgs.contents.parts[0].text).toContain('mobile app UI');
        });

        it('应该为 PC 添加 desktop web interface 标签', async () => {
            // Given: Mock API
            mockGenerateContent.mockResolvedValue({
                candidates: [
                    {
                        content: {
                            parts: [{ inlineData: { data: 'image-data' } }],
                        },
                    },
                ],
            });

            // When: 为 PC 生成
            await geminiService.generateUIDesign('商品页', DeviceType.PC, ModelType.GEMINI_FLASH_IMAGE);

            // Then: 提示词应该包含 desktop web interface
            const callArgs = mockGenerateContent.mock.calls[0][0];
            expect(callArgs.contents.parts[0].text).toContain('desktop web interface');
        });

        it('Gemini Pro 模型应该设置 imageSize 为 1K', async () => {
            // Given: Mock API
            mockGenerateContent.mockResolvedValue({
                candidates: [
                    {
                        content: {
                            parts: [{ inlineData: { data: 'image-data' } }],
                        },
                    },
                ],
            });

            // When: 使用 Pro 模型
            await geminiService.generateUIDesign('提示词', DeviceType.IPHONE, ModelType.GEMINI_PRO);

            // Then: 应该设置 imageSize
            const callArgs = mockGenerateContent.mock.calls[0][0];
            expect(callArgs.config.imageConfig.imageSize).toBe('1K');
        });

        it('Gemini Flash 模型不应该设置 imageSize', async () => {
            // Given: Mock API
            mockGenerateContent.mockResolvedValue({
                candidates: [
                    {
                        content: {
                            parts: [{ inlineData: { data: 'image-data' } }],
                        },
                    },
                ],
            });

            // When: 使用 Flash 模型
            await geminiService.generateUIDesign('提示词', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE);

            // Then: 不应该设置 imageSize
            const callArgs = mockGenerateContent.mock.calls[0][0];
            expect(callArgs.config.imageConfig.imageSize).toBeUndefined();
        });

        it('提示词应该包含设计相关的关键词', async () => {
            // Given: Mock API
            mockGenerateContent.mockResolvedValue({
                candidates: [
                    {
                        content: {
                            parts: [{ inlineData: { data: 'image-data' } }],
                        },
                    },
                ],
            });

            // When: 生成设计稿
            await geminiService.generateUIDesign('商品页', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE);

            // Then: 提示词应该包含设计相关词汇
            const callArgs = mockGenerateContent.mock.calls[0][0];
            const prompt = callArgs.contents.parts[0].text;
            expect(prompt).toContain('UI DESIGN');
            expect(prompt).toContain('Professional');
            expect(prompt).toContain('modern');
            expect(prompt).toContain('high-fidelity');
            expect(prompt).toContain('Figma style');
        });

        it('应该处理 API 没有返回图片数据的情况', async () => {
            // Given: Mock API 返回但没有图片数据
            mockGenerateContent.mockResolvedValue({
                candidates: [
                    {
                        content: {
                            parts: [{ text: 'some text' }],
                        },
                    },
                ],
            });

            // When & Then: 应该抛出错误
            await expect(
                geminiService.generateUIDesign('提示词', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE)
            ).rejects.toThrow('No image data returned from AI');
        });

        it('应该处理 API 返回空 candidates', async () => {
            // Given: Mock API 返回空 candidates
            mockGenerateContent.mockResolvedValue({
                candidates: [],
            });

            // When & Then: 应该抛出错误
            await expect(
                geminiService.generateUIDesign('提示词', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE)
            ).rejects.toThrow('No image data returned from AI');
        });

        it('应该处理 API Key 错误', async () => {
            // Given: Mock API 抛出 API Key 错误
            const error = new Error('Requested entity was not found');
            mockGenerateContent.mockRejectedValue(error);

            // When & Then: 应该抛出错误
            await expect(
                geminiService.generateUIDesign('提示词', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE)
            ).rejects.toThrow('Requested entity was not found');
        });

        it('应该处理网络错误', async () => {
            // Given: Mock API 抛出网络错误
            mockGenerateContent.mockRejectedValue(new Error('Network error'));

            // When & Then: 应该抛出错误
            await expect(
                geminiService.generateUIDesign('提示词', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE)
            ).rejects.toThrow('Network error');
        });

        it('应该为不同的提示词生成不同的图片', async () => {
            // Given: Mock API
            mockGenerateContent.mockResolvedValue({
                candidates: [
                    {
                        content: {
                            parts: [{ inlineData: { data: 'image-data' } }],
                        },
                    },
                ],
            });

            // When: 使用不同的提示词生成
            await geminiService.generateUIDesign('提示词1', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE);
            await geminiService.generateUIDesign('提示词2', DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE);

            // Then: 应该调用两次 API
            expect(mockGenerateContent).toHaveBeenCalledTimes(2);
            expect(mockGenerateContent.mock.calls[0][0].contents.parts[0].text).toContain('提示词1');
            expect(mockGenerateContent.mock.calls[1][0].contents.parts[0].text).toContain('提示词2');
        });
    });

    describe('边界情况', () => {
        it('应该处理极长的提示词', async () => {
            // Given: 极长的提示词
            const longPrompt = 'A'.repeat(5000);
            mockGenerateContent.mockResolvedValue({
                text: JSON.stringify([
                    { type: 'A', label: 'Layout', content: 'Content' },
                ]),
            });

            // When & Then: 不应该抛出错误
            await expect(geminiService.optimizePrompts(longPrompt)).resolves.toBeDefined();
        });

        it('应该处理包含特殊字符的提示词', async () => {
            // Given: 包含特殊字符的提示词
            const specialPrompt = '包含"引号"和\\反斜杠和\n换行符的提示词';
            mockGenerateContent.mockResolvedValue({
                candidates: [
                    {
                        content: {
                            parts: [{ inlineData: { data: 'image-data' } }],
                        },
                    },
                ],
            });

            // When & Then: 不应该抛出错误
            await expect(
                geminiService.generateUIDesign(specialPrompt, DeviceType.IPHONE, ModelType.GEMINI_FLASH_IMAGE)
            ).resolves.toBeDefined();
        });

        it('应该处理空提示词', async () => {
            // Given: 空提示词
            mockGenerateContent.mockResolvedValue({ text: '[]' });

            // When: 使用空提示词
            const result = await geminiService.optimizePrompts('');

            // Then: 应该成功调用（虽然可能返回空结果）
            expect(mockGenerateContent).toHaveBeenCalled();
        });
    });
});
