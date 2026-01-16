import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 扩展 expect 断言
expect.extend(matchers);

// 每次测试后清理
afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
});

// Mock window.aistudio (AI Studio 专用 API)
// @ts-ignore - 在测试环境中 mock window.aistudio
if (typeof global.window !== 'undefined') {
    global.window.aistudio = {
        hasSelectedApiKey: vi.fn(() => Promise.resolve(true)),
        openSelectKey: vi.fn(() => Promise.resolve()),
    };
}

// Mock process.env
process.env.API_KEY = 'test-api-key';
