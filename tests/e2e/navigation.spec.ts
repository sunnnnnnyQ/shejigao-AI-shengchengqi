import { test, expect } from '@playwright/test';

/**
 * 导航功能E2E测试
 * 测试应用内各页面之间的导航功能
 */

test.describe('导航功能测试', () => {
    test.beforeEach(async ({ page }) => {
        // 清空LocalStorage
        await page.goto('http://localhost:3000');
        await page.evaluate(() => localStorage.clear());
    });

    test('从结果页面点击返回按钮应该能返回到首页', async ({ page }) => {
        // 1. 访问首页
        await page.goto('http://localhost:3000');

        // 2. 验证在首页
        await expect(page).toHaveURL(/\#home$/);
        await expect(page.locator('h1')).toContainText(/创意瞬间落地/);

        // 3. 输入提示词
        const textarea = page.locator('textarea').first();
        await textarea.fill('一个登录页面');

        // 4. Mock aiService以避免真实API调用
        await page.addInitScript(() => {
            // 模拟优化提示词的返回
            const mockOptimizedPrompts = [
                { id: '1', type: 'A', label: 'A 方案', content: 'Mock prompt A' },
                { id: '2', type: 'B', label: 'B 方案', content: 'Mock prompt B' },
                { id: '3', type: 'C', label: 'C 方案', content: 'Mock prompt C' },
                { id: '4', type: 'D', label: 'D 方案', content: 'Mock prompt D' },
            ];

            // @ts-ignore
            window.__mockOptimizedPrompts = mockOptimizedPrompts;
        });

        // 5. 点击"生成布局建议"按钮
        const optimizeButton = page.locator('button:has-text("生成布局建议")');
        await optimizeButton.click();

        // 等待优化完成（如果启用了mock，应该很快）
        // 注意：由于没有真实的API，这里可能会失败，所以我们用另一种方式测试

        // 6. 直接导航到结果页面（模拟已经生成了结果）
        await page.goto('http://localhost:3000#results');

        // 7. 验证在结果页面
        await expect(page).toHaveURL(/\#results$/);

        // 8. 查找并点击返回按钮
        const backButton = page.locator('button:has-text("返回")').first();
        await expect(backButton).toBeVisible();
        await backButton.click();

        // 9. 等待导航完成
        await page.waitForURL(/\#home$/, { timeout: 3000 });

        // 10. 验证已经返回到首页
        await expect(page).toHaveURL(/\#home$/);
        await expect(page.locator('h1')).toContainText(/创意瞬间落地/);

        // 11. 验证输入框存在（确认是首页）
        await expect(textarea).toBeVisible();

        // 截图保存
        await page.screenshot({
            path: 'test-results/screenshots/navigation-back-to-home.png',
            fullPage: true
        });
    });

    test('浏览器前进后退按钮应该正常工作', async ({ page }) => {
        // 1. 访问首页
        await page.goto('http://localhost:3000');
        await expect(page).toHaveURL(/\#home$/);

        // 2. 导航到历史记录页面
        const historyLink = page.locator('text="历史记录"').first();
        await historyLink.click();

        // 3. 验证在历史记录页
        await expect(page).toHaveURL(/\#history$/);

        // 4. 使用浏览器后退按钮
        await page.goBack();

        // 5. 验证回到首页
        await expect(page).toHaveURL(/\#home$/);

        // 6. 使用浏览器前进按钮
        await page.goForward();

        // 7. 验证回到历史记录页
        await expect(page).toHaveURL(/\#history$/);

        await page.screenshot({
            path: 'test-results/screenshots/browser-navigation.png',
            fullPage: true
        });
    });

    test('从不同页面返回到首页', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // 测试从历史记录返回
        await page.goto('http://localhost:3000#history');
        await expect(page).toHaveURL(/\#history$/);
        const backBtn1 = page.locator('button:has-text("返回")').first();
        await backBtn1.click();
        await page.waitForURL(/\#home$/, { timeout: 3000 });
        await expect(page).toHaveURL(/\#home$/);

        // 测试从收藏返回
        await page.goto('http://localhost:3000#favorites');
        await expect(page).toHaveURL(/\#favorites$/);
        const backBtn2 = page.locator('button:has-text("返回")').first();
        await backBtn2.click();
        await page.waitForURL(/\#home$/, { timeout: 3000 });
        await expect(page).toHaveURL(/\#home$/);

        // 测试从设置返回
        await page.goto('http://localhost:3000#settings');
        await expect(page).toHaveURL(/\#settings$/);
        const backBtn3 = page.locator('button:has-text("返回")').first();
        await backBtn3.click();
        await page.waitForURL(/\#home$/, { timeout: 3000 });
        await expect(page).toHaveURL(/\#home$/);

        await page.screenshot({
            path: 'test-results/screenshots/multiple-page-navigation.png',
            fullPage: true
        });
    });
});
