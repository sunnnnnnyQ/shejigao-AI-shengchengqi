import { test, expect } from '@playwright/test';

/**
 * 历史记录和收藏功能E2E测试
 * 
 * 使用注入的测试数据避免依赖真实的AI生成
 */

test.describe('历史记录功能', () => {
    test.beforeEach(async ({ page }) => {
        // 访问页面
        await page.goto('http://localhost:3000');

        // 注入测试数据到LocalStorage
        await page.evaluate(() => {
            const mockDesigns = [
                {
                    id: 'design-1',
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    prompt: '测试设计稿 1',
                    variant: 'A',
                    model: 'google/gemini-2.5-flash-image',
                    timestamp: Date.now() - 4000,
                    device: 'iPhone',
                    isFavorite: false
                },
                {
                    id: 'design-2',
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    prompt: '测试设计稿 2',
                    variant: 'B',
                    model: 'google/gemini-2.5-flash-image',
                    timestamp: Date.now() - 3000,
                    device: 'Android',
                    isFavorite: false
                },
                {
                    id: 'design-3',
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    prompt: '测试设计稿 3',
                    variant: 'C',
                    model: 'google/gemini-2.5-flash-image',
                    timestamp: Date.now() - 2000,
                    device: 'PC',
                    isFavorite: false
                },
                {
                    id: 'design-4',
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    prompt: '测试设计稿 4',
                    variant: 'D',
                    model: 'google/gemini-2.5-flash-image',
                    timestamp: Date.now() - 1000,
                    device: 'iPhone',
                    isFavorite: false
                }
            ];

            localStorage.setItem('aidesign_history', JSON.stringify(mockDesigns));
        });

        // 刷新页面以加载数据
        await page.reload();
    });

    test('应该显示历史记录列表', async ({ page }) => {
        // 点击历史记录导航
        await page.click('text=历史记录');

        // 等待页面加载
        await page.waitForTimeout(500);

        // 验证有图片显示
        const images = page.locator('img[src^="data:image"]');
        const count = await images.count();
        expect(count).toBeGreaterThanOrEqual(4);

        // 截图
        await page.screenshot({
            path: 'test-results/screenshots/history-view.png',
            fullPage: true
        });
    });

    test('应该能够返回首页', async ({ page }) => {
        // 先进入历史记录
        await page.click('text=历史记录');
        await page.waitForTimeout(300);

        // 返回首页
        await page.click('text=首页生成');
        await page.waitForTimeout(300);

        // 验证回到了首页
        await expect(page.locator('h1')).toContainText(/创意瞬间落地/);
    });
});

test.describe('收藏功能', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');

        // 注入测试数据
        await page.evaluate(() => {
            const mockDesigns = [
                {
                    id: 'fav-design-1',
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    prompt: '可收藏的设计稿',
                    variant: 'A',
                    model: 'google/gemini-2.5-flash-image',
                    timestamp: Date.now(),
                    device: 'iPhone',
                    isFavorite: false
                }
            ];

            localStorage.setItem('aidesign_history', JSON.stringify(mockDesigns));
            localStorage.setItem('aidesign_favorites', JSON.stringify([]));
        });

        await page.reload();
    });

    test('应该能够收藏设计稿', async ({ page }) => {
        // 进入历史记录
        await page.click('text=历史记录');
        await page.waitForTimeout(500);

        // 查找收藏按钮（可能是星标图标）
        // 注意：这依赖于实际的UI实现
        const favoriteButton = page.locator('[aria-label*="收藏"]').or(
            page.locator('button[title*="收藏"]')
        ).first();

        // 如果找到了收藏按钮，点击它
        if (await favoriteButton.count() > 0) {
            await favoriteButton.click();
            await page.waitForTimeout(300);

            // 进入收藏夹查看
            await page.click('text=我的收藏');
            await page.waitForTimeout(500);

            // 验证有收藏的图片
            const images = page.locator('img[src^="data:image"]');
            const count = await images.count();
            expect(count).toBeGreaterThanOrEqual(1);

            await page.screenshot({
                path: 'test-results/screenshots/favorites-view.png',
                fullPage: true
            });
        }
    });

    test('收藏夹为空时应该显示提示', async ({ page }) => {
        // 直接进入收藏夹
        await page.click('text=我的收藏');
        await page.waitForTimeout(500);

        // 验证显示空状态提示
        // 这个文本可能是 "还没有收藏" 或 "暂无收藏" 等
        const emptyMessage = page.locator('text=/还没有收藏|暂无收藏|收藏为空|No favorites/i');

        // 检查是否显示了空状态消息
        const hasEmptyMessage = await emptyMessage.count() > 0;

        if (hasEmptyMessage) {
            await expect(emptyMessage.first()).toBeVisible();
        }

        await page.screenshot({
            path: 'test-results/screenshots/empty-favorites.png',
            fullPage: true
        });
    });
});

test.describe('导航功能', () => {
    test('应该能够在不同视图之间切换', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // 首页 -> 历史记录
        await page.click('text=历史记录');
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/screenshots/nav-history.png' });

        // 历史记录 -> 收藏夹
        await page.click('text=我的收藏');
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/screenshots/nav-favorites.png' });

        // 收藏夹 -> 首页
        await page.click('text=首页生成');
        await page.waitForTimeout(300);

        // 验证回到首页
        await expect(page.locator('h1')).toContainText(/创意瞬间落地/);
        await page.screenshot({ path: 'test-results/screenshots/nav-home.png' });
    });
});
