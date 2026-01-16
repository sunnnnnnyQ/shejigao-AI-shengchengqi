/**
 * API Key管理服务
 * 负责OpenRouter API Key的本地存储和管理
 */

const STORAGE_KEY = 'openrouter_api_key';

export const apiKeyService = {
    /**
     * 保存API Key到LocalStorage
     */
    saveApiKey(key: string): void {
        localStorage.setItem(STORAGE_KEY, key);
    },

    /**
     * 从LocalStorage获取API Key
     */
    getApiKey(): string | null {
        return localStorage.getItem(STORAGE_KEY);
    },

    /**
     * 从LocalStorage删除API Key
     */
    removeApiKey(): void {
        localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * 检查是否已配置API Key
     */
    hasApiKey(): boolean {
        const key = this.getApiKey();
        return !!key && key.length > 0;
    },

    /**
     * 验证API Key格式是否有效
     * OpenRouter API Key通常以 sk- 或 sk-or- 开头
     */
    validateApiKey(key: string | null | undefined): boolean {
        if (!key || typeof key !== 'string') {
            return false;
        }
        return key.length > 0 && key.startsWith('sk-');
    },
};
