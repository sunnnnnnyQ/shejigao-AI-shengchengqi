import { beforeEach, afterEach, vi, expect } from 'vitest';
import { waitFor, screen } from '@testing-library/react';
import { createMockOptimizedPrompts, createMockImageUrl } from './testDataFactory';
import * as aiService from '../../../services/aiService';

/**
 * 集成测试的通用设置
 */
export function setupIntegrationTest() {
    beforeEach(() => {
        // 清空LocalStorage
        localStorage.clear();

        // 清空所有mock
        vi.clearAllMocks();

        // 重置DOM
        document.body.innerHTML = '';
    });

    afterEach(() => {
        // 清理
        localStorage.clear();
        vi.restoreAllMocks();
    });
}

/**
 * 等待生成完成（加载动画消失）
 */
export async function waitForGenerationComplete(timeout = 10000) {
    await waitFor(
        () => {
            const loadingElements = screen.queryAllByText(/正在生成|正在渲染/i);
            expect(loadingElements.length).toBe(0);
        },
        { timeout }
    );
}

/**
 * 等待优化提示词生成完成
 */
export async function waitForPromptsOptimized(timeout = 5000) {
    await waitFor(
        () => {
            expect(screen.getByText(/方案 A/i)).toBeTruthy();
            expect(screen.getByText(/方案 B/i)).toBeTruthy();
            expect(screen.getByText(/方案 C/i)).toBeTruthy();
            expect(screen.getByText(/方案 D/i)).toBeTruthy();
        },
        { timeout }
    );
}

/**
 * Mock成功的AI生成流程
 */
export function mockSuccessfulGeneration(customPrompts?: any) {
    const prompts = customPrompts || createMockOptimizedPrompts();

    // Mock提示词优化
    vi.spyOn(aiService, 'optimizePrompts').mockResolvedValue(prompts);

    // Mock图片生成
    vi.spyOn(aiService, 'generateUIDesign').mockImplementation(async () => {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 100));
        return createMockImageUrl();
    });
}

/**
 * Mock API失败
 */
export function mockAPIFailure(errorMessage: string = 'API Error') {
    vi.spyOn(aiService, 'optimizePrompts').mockRejectedValue(
        new Error(errorMessage)
    );

    vi.spyOn(aiService, 'generateUIDesign').mockRejectedValue(
        new Error(errorMessage)
    );
}

/**
 * Mock部分模型失败
 */
export function mockPartialModelFailure(successModels: string[], failureMessage: string = 'Model Error') {
    vi.spyOn(aiService, 'generateUIDesign').mockImplementation(async (prompt, model) => {
        await new Promise(resolve => setTimeout(resolve, 100));

        if (successModels.includes(model)) {
            return createMockImageUrl();
        } else {
            throw new Error(failureMessage);
        }
    });
}

/**
 * 获取LocalStorage中的历史记录
 */
export function getStoredHistory() {
    const data = localStorage.getItem('aidesign_history');
    return data ? JSON.parse(data) : [];
}

/**
 * 获取LocalStorage中的收藏
 */
export function getStoredFavorites() {
    const history = getStoredHistory();
    return history.filter((item: any) => item.isFavorite);
}

/**
 * 设置LocalStorage中的数据
 */
export function setStoredHistory(designs: any[]) {
    localStorage.setItem('aidesign_history', JSON.stringify(designs));
}

/**
 * 验证图片数量
 */
export function expectImageCount(count: number) {
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(count);
}

/**
 * 等待元素出现
 */
export async function waitForElement(text: string | RegExp, options?: any) {
    return waitFor(() => {
        expect(screen.getByText(text)).toBeTruthy();
    }, options);
}

/**
 * 等待元素消失
 */
export async function waitForElementToDisappear(text: string | RegExp, options?: any) {
    return waitFor(() => {
        expect(screen.queryByText(text)).toBeFalsy();
    }, options);
}

/**
 * 睡眠函数（用于确保异步操作完成）
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
