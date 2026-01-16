/** 
 * E2E测试辅助函数
 */

import { Page } from '@playwright/test';

/**
 * 注入Mock历史数据到LocalStorage
 */
export async function injectMockHistory(page: Page, count: number = 4) {
    await page.evaluate((n) => {
        const mockDesigns = Array.from({ length: n }, (_, i) => ({
            id: `mock-design-${i}`,
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            prompt: `Mock设计稿 ${i + 1}`,
            variant: ['A', 'B', 'C', 'D'][i % 4],
            model: 'google/gemini-2.5-flash-image',
            timestamp: Date.now() - (n - i) * 1000,
            device: ['iPhone', 'Android', 'PC'][i % 3],
            isFavorite: false
        }));
        localStorage.setItem('aidesign_history', JSON.stringify(mockDesigns));
    }, count);
}

/**
 * 清空LocalStorage
 */
export async function clearStorage(page: Page) {
    await page.evaluate(() => {
        localStorage.clear();
    });
}

/**
 * 等待页面稳定
 */
export async function waitForPageStable(page: Page, ms: number = 500) {
    await page.waitForTimeout(ms);
}
