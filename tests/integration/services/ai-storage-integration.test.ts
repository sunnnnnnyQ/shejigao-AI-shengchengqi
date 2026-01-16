import { describe, it, expect, vi } from 'vitest';
import { ModelType, DeviceType, GeneratedDesign } from '../../../types';
import * as aiService from '../../../services/aiService';
import { storageService } from '../../../services/storageService';
import {
    createMockDesign,
    createMockOptimizedPrompts,
    generateId,
} from '../helpers/testDataFactory';
import {
    setupIntegrationTest,
    getStoredHistory,
    getStoredFavorites,
    setStoredHistory,
} from '../helpers/integrationTestUtils';

describe('AI服务与存储服务集成测试', () => {
    setupIntegrationTest();

    describe('设计稿生成与存储', () => {
        it('生成的设计应该能够正确保存到历史记录', async () => {
            // Given: 清空存储
            expect(getStoredHistory()).toHaveLength(0);

            // Mock AI生成成功
            const mockImageUrl = 'data:image/png;base64,testImage123';
            vi.spyOn(aiService, 'generateUIDesign').mockResolvedValue(mockImageUrl);

            // When: 调用AI生成服务
            const generatedUrl = await aiService.generateUIDesign(
                'test prompt',
                ModelType.GEMINI_FLASH_IMAGE,
                DeviceType.IPHONE
            );

            // 创建设计对象并保存
            const design: GeneratedDesign = {
                id: generateId(),
                url: generatedUrl,
                prompt: 'test prompt',
                variant: 'A',
                model: ModelType.GEMINI_FLASH_IMAGE,
                timestamp: Date.now(),
                device: DeviceType.IPHONE,
                isFavorite: false,
            };

            storageService.addDesign(design);

            // Then: 验证存储
            const history = storageService.getHistory();
            expect(history).toHaveLength(1);
            expect(history[0].id).toBe(design.id);
            expect(history[0].url).toBe(mockImageUrl);

            // 验证LocalStorage持久化
            const stored = getStoredHistory();
            expect(stored).toHaveLength(1);
            expect(stored[0].id).toBe(design.id);
        });

        it('应该支持批量生成和存储（4个变体）', async () => {
            // Given
            const mockPrompts = createMockOptimizedPrompts('电商首页');
            vi.spyOn(aiService, 'optimizePrompts').mockResolvedValue(mockPrompts);
            vi.spyOn(aiService, 'generateUIDesign').mockResolvedValue('data:image/png;base64,mock');

            // When: 生成4个优化提示词
            const optimizedPrompts = await aiService.optimizePrompts('电商首页');
            expect(optimizedPrompts).toHaveLength(4);

            // 为每个提示词生成设计
            const designs: GeneratedDesign[] = [];
            for (let i = 0; i < optimizedPrompts.length; i++) {
                const prompt = optimizedPrompts[i];
                const url = await aiService.generateUIDesign(
                    prompt.content,
                    ModelType.GEMINI_FLASH_IMAGE,
                    DeviceType.IPHONE
                );

                const design: GeneratedDesign = {
                    id: generateId(),
                    url,
                    prompt: prompt.content,
                    variant: prompt.type,
                    model: ModelType.GEMINI_FLASH_IMAGE,
                    timestamp: Date.now(),
                    device: DeviceType.IPHONE,
                    isFavorite: false,
                };

                storageService.addDesign(design);
                designs.push(design);
            }

            // Then: 验证存储了4个设计
            const history = storageService.getHistory();
            expect(history).toHaveLength(4);
            // 因为是通过循环添加，最后添加的在前面，所以顺序是 D, C, B, A
            expect(history.map(d => d.variant)).toEqual(['D', 'C', 'B', 'A']);
        });

        it('应该支持多模型的设计存储', async () => {
            // Given: 两个不同的模型
            const models = [ModelType.GEMINI_FLASH_IMAGE, ModelType.FLUX_PRO];

            vi.spyOn(aiService, 'generateUIDesign').mockResolvedValue('data:image/png;base64,mock');

            // When: 为每个模型生成设计
            for (const model of models) {
                const design = createMockDesign({
                    model,
                    id: `design-${model}`,
                });
                storageService.addDesign(design);
            }

            // Then: 验证存储
            const history = storageService.getHistory();
            expect(history).toHaveLength(2);

            const geminiDesigns = history.filter(d => d.model === ModelType.GEMINI_FLASH_IMAGE);
            const fluxDesigns = history.filter(d => d.model === ModelType.FLUX_PRO);

            expect(geminiDesigns).toHaveLength(1);
            expect(fluxDesigns).toHaveLength(1);
        });
    });

    describe('收藏功能集成', () => {
        it('收藏状态应该在存储中正确更新', () => {
            // Given: 添加一个设计
            const design = createMockDesign({ isFavorite: false });
            storageService.addDesign(design);

            // When: 切换收藏状态
            const updated = storageService.toggleFavorite(design.id);

            // Then: 验证更新成功
            expect(updated).toBeTruthy();
            expect(updated?.isFavorite).toBe(true);

            // 验证存储持久化
            const favorites = storageService.getFavorites();
            expect(favorites).toHaveLength(1);
            expect(favorites[0].id).toBe(design.id);

            // 验证LocalStorage
            const storedFavorites = getStoredFavorites();
            expect(storedFavorites).toHaveLength(1);
        });

        it('取消收藏应该正确更新存储', () => {
            // Given: 添加一个设计并收藏
            const design = createMockDesign({ isFavorite: false });
            storageService.addDesign(design);
            storageService.toggleFavorite(design.id); // 先收藏

            // When: 取消收藏
            const updated = storageService.toggleFavorite(design.id);

            // Then: 验证
            expect(updated?.isFavorite).toBe(false);

            const favorites = storageService.getFavorites();
            expect(favorites).toHaveLength(0);
        });

        it('应该支持批量收藏操作', () => {
            // Given: 添加多个设计
            const designs = Array.from({ length: 5 }, () => createMockDesign());
            designs.forEach(d => storageService.addDesign(d));

            // When: 收藏前3个
            designs.slice(0, 3).forEach(d => storageService.toggleFavorite(d.id));

            // Then: 验证
            const favorites = storageService.getFavorites();
            expect(favorites).toHaveLength(3);
        });
    });

    describe('历史记录管理', () => {
        it('应该按时间倒序返回历史记录', () => {
            // Given: 添加3个设计，时间递增
            const now = Date.now();
            const designs = [
                createMockDesign({ id: 'old', timestamp: now - 3000 }),
                createMockDesign({ id: 'middle', timestamp: now - 2000 }),
                createMockDesign({ id: 'new', timestamp: now - 1000 }),
            ];

            designs.forEach(d => storageService.addDesign(d));

            // When: 获取历史记录
            const history = storageService.getHistory();

            // Then: 验证顺序（最新的在前）
            expect(history[0].id).toBe('new');
            expect(history[1].id).toBe('middle');
            expect(history[2].id).toBe('old');
        });

        it('应该支持删除历史记录', () => {
            // Given: 添加设计
            const design = createMockDesign();
            storageService.addDesign(design);
            expect(storageService.getHistory()).toHaveLength(1);

            // When: 删除
            storageService.deleteDesign(design.id);

            // Then: 验证
            const history = storageService.getHistory();
            expect(history).toHaveLength(0);

            // 验证LocalStorage
            const stored = getStoredHistory();
            expect(stored).toHaveLength(0);
        });

        it('清空历史应该同时清除所有收藏', () => {
            // Given: 添加设计并收藏
            const design1 = createMockDesign({ id: 'design1' });
            const design2 = createMockDesign({ id: 'design2' });

            storageService.addDesign(design1);
            storageService.addDesign(design2);
            storageService.toggleFavorite(design1.id);

            expect(storageService.getFavorites()).toHaveLength(1);

            // When: 清空历史
            storageService.clearHistory();

            // Then: 验证全部清空
            expect(storageService.getHistory()).toHaveLength(0);
            expect(storageService.getFavorites()).toHaveLength(0);
            expect(getStoredHistory()).toHaveLength(0);
        });
    });

    describe('数据持久化', () => {
        it('存储的数据应该在页面刷新后仍然可用', () => {
            // Given: 添加数据
            const design = createMockDesign({ id: 'persistent-design' });
            storageService.addDesign(design);

            // When: 模拟页面刷新（重新读取LocalStorage）
            const storedData = getStoredHistory();

            // 清空内存中的数据（模拟页面重新加载）
            storageService.clearHistory();

            // 重新从LocalStorage加载
            setStoredHistory(storedData);

            // Then: 验证数据仍然存在
            const reloadedData = getStoredHistory();
            expect(reloadedData).toHaveLength(1);
            expect(reloadedData[0].id).toBe('persistent-design');
        });

        it('应该正确序列化和反序列化复杂数据', () => {
            // Given: 创建包含所有字段的设计
            const design = createMockDesign({
                id: 'complex-design',
                url: 'data:image/png;base64,veryLongBase64String...',
                prompt: '一个复杂的电商APP首页，包含轮播图、商品列表、分类导航...',
                variant: 'C',
                model: ModelType.FLUX_PRO,
                timestamp: 1705305600000,
                device: DeviceType.PC,
                isFavorite: true,
            });

            // When: 存储并读取
            storageService.addDesign(design);
            const retrieved = storageService.getHistory()[0];

            // Then: 验证所有字段
            expect(retrieved.id).toBe(design.id);
            expect(retrieved.url).toBe(design.url);
            expect(retrieved.prompt).toBe(design.prompt);
            expect(retrieved.variant).toBe(design.variant);
            expect(retrieved.model).toBe(design.model);
            expect(retrieved.timestamp).toBe(design.timestamp);
            expect(retrieved.device).toBe(design.device);
            expect(retrieved.isFavorite).toBe(design.isFavorite);
        });
    });

    describe('错误处理', () => {
        it('AI生成失败不应影响现有的存储数据', async () => {
            // Given: 已有数据
            const existingDesign = createMockDesign();
            storageService.addDesign(existingDesign);

            // When: AI生成失败
            vi.spyOn(aiService, 'generateUIDesign').mockRejectedValue(
                new Error('API Error')
            );

            try {
                await aiService.generateUIDesign('test', ModelType.GEMINI_FLASH_IMAGE, DeviceType.IPHONE);
            } catch (error) {
                // 预期会失败
            }

            // Then: 现有数据不受影响
            const history = storageService.getHistory();
            expect(history).toHaveLength(1);
            expect(history[0].id).toBe(existingDesign.id);
        });

        it('存储操作失败不应崩溃应用', () => {
            // Given: Mock localStorage.setItem失败
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = vi.fn(() => {
                throw new Error('Storage quota exceeded');
            });

            // When & Then: 不应该抛出错误
            expect(() => {
                const design = createMockDesign();
                storageService.addDesign(design);
            }).not.toThrow();

            // 恢复
            Storage.prototype.setItem = originalSetItem;
        });
    });
});
