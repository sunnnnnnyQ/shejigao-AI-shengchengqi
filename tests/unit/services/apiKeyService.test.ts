import { describe, it, expect, beforeEach } from 'vitest';
import { apiKeyService } from '../../../services/apiKeyService';

describe('apiKeyService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('saveApiKey', () => {
        it('应该保存API Key到LocalStorage', () => {
            apiKeyService.saveApiKey('sk-test-key-123');
            expect(localStorage.getItem('openrouter_api_key')).toBe('sk-test-key-123');
        });

        it('应该覆盖已存在的API Key', () => {
            localStorage.setItem('openrouter_api_key', 'old-key');
            apiKeyService.saveApiKey('new-key');
            expect(localStorage.getItem('openrouter_api_key')).toBe('new-key');
        });
    });

    describe('getApiKey', () => {
        it('应该获取已保存的API Key', () => {
            localStorage.setItem('openrouter_api_key', 'sk-test-key-123');
            expect(apiKeyService.getApiKey()).toBe('sk-test-key-123');
        });

        it('未保存时应该返回null', () => {
            expect(apiKeyService.getApiKey()).toBeNull();
        });
    });

    describe('removeApiKey', () => {
        it('应该删除API Key', () => {
            localStorage.setItem('openrouter_api_key', 'sk-test-key-123');
            apiKeyService.removeApiKey();
            expect(apiKeyService.getApiKey()).toBeNull();
        });

        it('删除不存在的key不应报错', () => {
            expect(() => apiKeyService.removeApiKey()).not.toThrow();
        });
    });

    describe('hasApiKey', () => {
        it('有API Key时应该返回true', () => {
            localStorage.setItem('openrouter_api_key', 'sk-test-key-123');
            expect(apiKeyService.hasApiKey()).toBe(true);
        });

        it('没有API Key时应该返回false', () => {
            expect(apiKeyService.hasApiKey()).toBe(false);
        });

        it('空字符串应该返回false', () => {
            localStorage.setItem('openrouter_api_key', '');
            expect(apiKeyService.hasApiKey()).toBe(false);
        });
    });

    describe('validateApiKey', () => {
        it('有效的API Key应该返回true', () => {
            expect(apiKeyService.validateApiKey('sk-valid-key-123')).toBe(true);
            expect(apiKeyService.validateApiKey('sk-or-v1-abc123')).toBe(true);
        });

        it('无效的API Key应该返回false', () => {
            expect(apiKeyService.validateApiKey('invalid')).toBe(false);
            expect(apiKeyService.validateApiKey('no-prefix')).toBe(false);
        });

        it('空字符串应该返回false', () => {
            expect(apiKeyService.validateApiKey('')).toBe(false);
        });

        it('null或undefined应该返回false', () => {
            expect(apiKeyService.validateApiKey(null as any)).toBe(false);
            expect(apiKeyService.validateApiKey(undefined as any)).toBe(false);
        });
    });
});
