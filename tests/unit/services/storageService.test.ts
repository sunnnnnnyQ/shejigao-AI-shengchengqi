import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../../../services/storageService';
import { GeneratedDesign, DeviceType, ModelType } from '../../../types';

// 辅助函数：创建测试用的设计稿数据
const createMockDesign = (id: string, overrides?: Partial<GeneratedDesign>): GeneratedDesign => ({
    id,
    url: `data:image/png;base64,mock-${id}`,
    prompt: `测试提示词 ${id}`,
    variant: 'A',
    model: ModelType.GEMINI_FLASH_IMAGE,
    timestamp: Date.now(),
    device: DeviceType.IPHONE,
    isFavorite: false,
    ...overrides,
});

describe('storageService', () => {
    // 每个测试前清空 localStorage
    beforeEach(() => {
        localStorage.clear();
    });

    describe('saveToHistory', () => {
        it('应该保存设计稿到历史记录', () => {
            // Given: 新生成的设计稿
            const designs = [createMockDesign('design-1')];

            // When: 保存到历史
            storageService.saveToHistory(designs);

            // Then: localStorage 应该包含该记录
            const history = storageService.getHistory();
            expect(history).toHaveLength(1);
            expect(history[0].id).toBe('design-1');
        });

        it('应该将新记录添加到历史记录前面', () => {
            // Given: 已有一条历史记录
            const oldDesign = createMockDesign('old-design', { timestamp: 1000 });
            storageService.saveToHistory([oldDesign]);

            // When: 添加新记录
            const newDesign = createMockDesign('new-design', { timestamp: 2000 });
            storageService.saveToHistory([newDesign]);

            // Then: 新记录应该在前面
            const history = storageService.getHistory();
            expect(history).toHaveLength(2);
            expect(history[0].id).toBe('new-design');
            expect(history[1].id).toBe('old-design');
        });

        it('应该限制历史记录数量为 100', () => {
            // Given: 已有 100 条历史记录
            const existingDesigns = Array.from({ length: 100 }, (_, i) =>
                createMockDesign(`design-${i}`)
            );
            storageService.saveToHistory(existingDesigns);

            // When: 保存第 101 条
            const newDesign = createMockDesign('design-101');
            storageService.saveToHistory([newDesign]);

            // Then: 应该只保留最新的 100 条
            const history = storageService.getHistory();
            expect(history).toHaveLength(100);
            expect(history[0].id).toBe('design-101'); // 最新的
            expect(history[99].id).toBe('design-98'); // 第100个元素
            expect(history.find(d => d.id === 'design-99')).toBeUndefined(); // design-99 被删除
            expect(history.find(d => d.id === 'design-0')).toBeDefined(); // design-0还在
        });

        it('应该支持一次保存多个设计稿', () => {
            // Given: 4 个新设计稿
            const designs = [
                createMockDesign('design-1'),
                createMockDesign('design-2'),
                createMockDesign('design-3'),
                createMockDesign('design-4'),
            ];

            // When: 批量保存
            storageService.saveToHistory(designs);

            // Then: 所有 4 个都应该被保存
            const history = storageService.getHistory();
            expect(history).toHaveLength(4);
            expect(history.map(d => d.id)).toEqual(['design-1', 'design-2', 'design-3', 'design-4']);
        });

        it('应该正确序列化和反序列化对象', () => {
            // Given: 包含所有字段的设计稿
            const design = createMockDesign('complex-design', {
                variant: 'B',
                model: ModelType.FLUX_PRO,
                device: DeviceType.PC,
                isFavorite: true,
                timestamp: 123456789,
            });

            // When: 保存并读取
            storageService.saveToHistory([design]);
            const history = storageService.getHistory();

            // Then: 所有字段都应该正确
            const retrieved = history[0];
            expect(retrieved.id).toBe('complex-design');
            expect(retrieved.variant).toBe('B');
            expect(retrieved.model).toBe(ModelType.FLUX_PRO);
            expect(retrieved.device).toBe(DeviceType.PC);
            expect(retrieved.isFavorite).toBe(true);
            expect(retrieved.timestamp).toBe(123456789);
        });
    });

    describe('getHistory', () => {
        it('空历史时应该返回空数组', () => {
            // Given: localStorage 为空
            // When: 获取历史
            const history = storageService.getHistory();

            // Then: 应该返回空数组
            expect(history).toEqual([]);
            expect(history).toHaveLength(0);
        });

        it('应该返回所有历史记录', () => {
            // Given: 有 5 条历史记录
            const designs = Array.from({ length: 5 }, (_, i) => createMockDesign(`design-${i}`));
            storageService.saveToHistory(designs);

            // When: 获取历史
            const history = storageService.getHistory();

            // Then: 应该返回所有 5 条
            expect(history).toHaveLength(5);
        });

        it('应该返回不可变的历史记录副本', () => {
            // Given: 有历史记录
            const design = createMockDesign('design-1');
            storageService.saveToHistory([design]);

            // When: 获取历史并修改
            const history1 = storageService.getHistory();
            history1[0].prompt = '被修改的提示词';

            // Then: 原始历史记录不应该被影响
            const history2 = storageService.getHistory();
            expect(history2[0].prompt).not.toBe('被修改的提示词');
            expect(history2[0].prompt).toBe('测试提示词 design-1');
        });
    });

    describe('toggleFavorite', () => {
        it('应该添加收藏', () => {
            // Given: 未收藏的设计稿
            const design = createMockDesign('design-1', { isFavorite: false });

            // When: 切换收藏
            const result = storageService.toggleFavorite(design);

            // Then: 应该返回更新后的设计对象（已收藏）并添加到收藏列表
            expect(result).toBeTruthy();
            expect(result?.isFavorite).toBe(true);
            const favorites = storageService.getFavorites();
            expect(favorites).toHaveLength(1);
            expect(favorites[0].id).toBe('design-1');
            expect(favorites[0].isFavorite).toBe(true);
        });

        it('应该取消收藏', () => {
            // Given: 已收藏的设计稿
            const design = createMockDesign('design-1');
            storageService.toggleFavorite(design); // 先添加

            // When: 再次切换
            const result = storageService.toggleFavorite(design);

            // Then: 应该返回更新后的设计对象（未收藏）并从收藏列表移除
            expect(result).toBeTruthy();
            expect(result?.isFavorite).toBe(false);
            const favorites = storageService.getFavorites();
            expect(favorites).toHaveLength(0);
        });

        it('应该正确处理多个收藏', () => {
            // Given: 多个设计稿
            const design1 = createMockDesign('design-1');
            const design2 = createMockDesign('design-2');
            const design3 = createMockDesign('design-3');

            // When: 收藏多个
            storageService.toggleFavorite(design1);
            storageService.toggleFavorite(design2);
            storageService.toggleFavorite(design3);

            // Then: 应该有 3 个收藏
            const favorites = storageService.getFavorites();
            expect(favorites).toHaveLength(3);
            expect(favorites.map(f => f.id)).toEqual(['design-3', 'design-2', 'design-1']);
        });

        it('取消收藏不应该影响其他收藏', () => {
            // Given: 3 个收藏
            const design1 = createMockDesign('design-1');
            const design2 = createMockDesign('design-2');
            const design3 = createMockDesign('design-3');
            storageService.toggleFavorite(design1);
            storageService.toggleFavorite(design2);
            storageService.toggleFavorite(design3);

            // When: 取消中间的一个
            storageService.toggleFavorite(design2);

            // Then: 应该只剩 2 个，且顺序正确
            const favorites = storageService.getFavorites();
            expect(favorites).toHaveLength(2);
            expect(favorites.map(f => f.id)).toEqual(['design-3', 'design-1']);
        });

        it('新收藏应该添加到列表前面', () => {
            // Given: 已有一个收藏
            const design1 = createMockDesign('design-1');
            storageService.toggleFavorite(design1);

            // When: 添加新收藏
            const design2 = createMockDesign('design-2');
            storageService.toggleFavorite(design2);

            // Then: 新收藏应该在前面
            const favorites = storageService.getFavorites();
            expect(favorites[0].id).toBe('design-2');
            expect(favorites[1].id).toBe('design-1');
        });

        it('应该强制设置 isFavorite 为 true', () => {
            // Given: isFavorite 为 false 的设计稿
            const design = createMockDesign('design-1', { isFavorite: false });

            // When: 添加收藏
            storageService.toggleFavorite(design);

            // Then: 收藏列表中的应该是 true
            const favorites = storageService.getFavorites();
            expect(favorites[0].isFavorite).toBe(true);
        });
    });

    describe('getFavorites', () => {
        it('空收藏时应该返回空数组', () => {
            // Given: 没有收藏
            // When: 获取收藏
            const favorites = storageService.getFavorites();

            // Then: 应该返回空数组
            expect(favorites).toEqual([]);
            expect(favorites).toHaveLength(0);
        });

        it('应该返回所有收藏', () => {
            // Given: 有 3 个收藏
            const designs = [
                createMockDesign('design-1'),
                createMockDesign('design-2'),
                createMockDesign('design-3'),
            ];
            designs.forEach(d => storageService.toggleFavorite(d));

            // When: 获取收藏
            const favorites = storageService.getFavorites();

            // Then: 应该返回所有 3 个
            expect(favorites).toHaveLength(3);
        });
    });

    describe('isFavorited', () => {
        it('未收藏时应该返回 false', () => {
            // Given: 没有任何收藏
            // When: 检查某个 ID
            const result = storageService.isFavorited('non-existent');

            // Then: 应该返回 false
            expect(result).toBe(false);
        });

        it('已收藏时应该返回 true', () => {
            // Given: 有一个收藏
            const design = createMockDesign('design-1');
            storageService.toggleFavorite(design);

            // When: 检查该 ID
            const result = storageService.isFavorited('design-1');

            // Then: 应该返回 true
            expect(result).toBe(true);
        });

        it('应该只对已收藏的 ID 返回 true', () => {
            // Given: 收藏了 design-1
            const design1 = createMockDesign('design-1');
            storageService.toggleFavorite(design1);

            // When & Then: 检查多个 ID
            expect(storageService.isFavorited('design-1')).toBe(true);
            expect(storageService.isFavorited('design-2')).toBe(false);
            expect(storageService.isFavorited('design-3')).toBe(false);
        });

        it('取消收藏后应该返回 false', () => {
            // Given: 收藏后又取消
            const design = createMockDesign('design-1');
            storageService.toggleFavorite(design); // 收藏
            storageService.toggleFavorite(design); // 取消

            // When: 检查
            const result = storageService.isFavorited('design-1');

            // Then: 应该返回 false
            expect(result).toBe(false);
        });
    });

    describe('数据持久化', () => {
        it('刷新页面后历史记录应该保留', () => {
            // Given: 保存了历史记录
            const design = createMockDesign('design-1');
            storageService.saveToHistory([design]);

            // When: 模拟页面刷新（重新调用 getHistory）
            const history = storageService.getHistory();

            // Then: 数据应该仍然存在
            expect(history).toHaveLength(1);
            expect(history[0].id).toBe('design-1');
        });

        it('刷新页面后收藏应该保留', () => {
            // Given: 收藏了设计稿
            const design = createMockDesign('design-1');
            storageService.toggleFavorite(design);

            // When: 模拟页面刷新
            const favorites = storageService.getFavorites();

            // Then: 收藏应该仍然存在
            expect(favorites).toHaveLength(1);
            expect(favorites[0].id).toBe('design-1');
        });
    });

    describe('边界情况', () => {
        it('应该处理空数组保存', () => {
            // Given: 空数组
            // When: 保存空数组
            storageService.saveToHistory([]);

            // Then: 不应该报错，历史应该为空
            const history = storageService.getHistory();
            expect(history).toHaveLength(0);
        });

        it('应该处理重复的设计稿 ID', () => {
            // Given: 相同 ID 的设计稿
            const design1 = createMockDesign('same-id', { prompt: '第一个' });
            const design2 = createMockDesign('same-id', { prompt: '第二个' });

            // When: 保存两次
            storageService.saveToHistory([design1]);
            storageService.saveToHistory([design2]);

            // Then: 应该都保存（因为没有去重逻辑）
            const history = storageService.getHistory();
            expect(history).toHaveLength(2);
            expect(history[0].prompt).toBe('第二个');
            expect(history[1].prompt).toBe('第一个');
        });

        it('应该处理特殊字符在字符串中', () => {
            // Given: 包含特殊字符的设计稿
            const design = createMockDesign('special', {
                prompt: '包含"引号"和\\反斜杠和\n换行符',
            });

            // When: 保存并读取
            storageService.saveToHistory([design]);
            const history = storageService.getHistory();

            // Then: 特殊字符应该被正确处理
            expect(history[0].prompt).toBe('包含"引号"和\\反斜杠和\n换行符');
        });
    });
});
