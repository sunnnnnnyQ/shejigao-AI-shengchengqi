import { describe, it, expect } from 'vitest';

describe('测试环境验证', () => {
    it('应该能够运行基本测试', () => {
        expect(true).toBe(true);
    });

    it('应该支持数学运算', () => {
        expect(1 + 1).toBe(2);
    });

    it('应该支持字符串匹配', () => {
        expect('AIDesign').toMatch(/AI/);
    });
});

describe('环境变量检查', () => {
    it('应该有 process.env.API_KEY', () => {
        expect(process.env.API_KEY).toBeDefined();
        expect(process.env.API_KEY).toBe('test-api-key');
    });
});

describe('DOM 环境检查', () => {
    it('应该有 localStorage', () => {
        expect(localStorage).toBeDefined();
    });

    it('应该能够使用 localStorage', () => {
        localStorage.setItem('test', 'value');
        expect(localStorage.getItem('test')).toBe('value');
    });
});
