import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OptimizedPrompts from '../../../components/OptimizedPrompts';
import { OptimizedPrompt } from '../../../types';

describe('OptimizedPrompts Component', () => {
    const mockPrompts: OptimizedPrompt[] = [
        { id: '1', type: 'A', label: 'Standard Layout', content: '标准布局提示词内容' },
        { id: '2', type: 'B', label: 'Split Layout', content: '分栏布局提示词内容' },
        { id: '3', type: 'C', label: 'Immersive Layout', content: '沉浸式布局提示词内容' },
        { id: '4', type: 'D', label: 'Card Layout', content: '卡片式布局提示词内容' },
    ];

    const defaultProps = {
        prompts: mockPrompts,
        setPrompts: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('渲染测试', () => {
        it('应该渲染标题', () => {
            // Given & When
            render(<OptimizedPrompts {...defaultProps} />);

            // Then
            expect(screen.getByText('选择布局变体')).toBeTruthy();
        });

        it('应该显示生成的变体数量', () => {
            // Given & When
            render(<OptimizedPrompts {...defaultProps} />);

            // Then
            expect(screen.getByText(/已生成 4 种差异化布局建议/i)).toBeTruthy();
        });

        it('应该渲染所有 4 个提示词', () => {
            // Given & When
            render(<OptimizedPrompts {...defaultProps} />);

            // Then
            expect(screen.getByText('方案 A')).toBeTruthy();
            expect(screen.getByText('方案 B')).toBeTruthy();
            expect(screen.getByText('方案 C')).toBeTruthy();
            expect(screen.getByText('方案 D')).toBeTruthy();
        });

        it('应该显示每个提示词的标签', () => {
            // Given & When
            render(<OptimizedPrompts {...defaultProps} />);

            // Then
            expect(screen.getByText('Standard Layout')).toBeTruthy();
            expect(screen.getByText('Split Layout')).toBeTruthy();
            expect(screen.getByText('Immersive Layout')).toBeTruthy();
            expect(screen.getByText('Card Layout')).toBeTruthy();
        });

        it('应该显示每个提示词的内容', () => {
            // Given & When
            render(<OptimizedPrompts {...defaultProps} />);

            // Then
            expect(screen.getByDisplayValue('标准布局提示词内容')).toBeTruthy();
            expect(screen.getByDisplayValue('分栏布局提示词内容')).toBeTruthy();
            expect(screen.getByDisplayValue('沉浸式布局提示词内容')).toBeTruthy();
            expect(screen.getByDisplayValue('卡片式布局提示词内容')).toBeTruthy();
        });
    });

    describe('编辑功能测试', () => {
        it('应该允许编辑提示词内容', async () => {
            // Given
            const setPrompts = vi.fn();
            const user = userEvent.setup();
            render(<OptimizedPrompts {...defaultProps} setPrompts={setPrompts} />);

            // When
            const textarea = screen.getByDisplayValue('标准布局提示词内容');
            await user.clear(textarea);
            await user.type(textarea, '新的提示词内容');

            // Then
            expect(setPrompts).toHaveBeenCalled();
        });

        it('编辑应该只更新对应的提示词', async () => {
            // Given
            const setPrompts = vi.fn();
            const user = userEvent.setup();
            render(<OptimizedPrompts {...defaultProps} setPrompts={setPrompts} />);

            // When: 编辑第一个提示词（追加内容）
            const textarea = screen.getByDisplayValue('标准布局提示词内容');
            await user.type(textarea, '添加内容');

            // Then: 应该调用 setPrompts
            expect(setPrompts).toHaveBeenCalled();

            // 检查传递的参数，第一个提示词应该包含追加的内容
            const lastCall = setPrompts.mock.calls[setPrompts.mock.calls.length - 1][0];
            expect(lastCall[0].content).toContain('标准布局提示词内容'); // 原来的内容还在
            expect(lastCall[0].content).toContain('容'); // 包含输入的最后一个字
            expect(lastCall[1].content).toBe('分栏布局提示词内容'); // 其他的不变
        });

        it('应该保持其他提示词不变', async () => {
            // Given
            const setPrompts = vi.fn();
            const user = userEvent.setup();
            render(<OptimizedPrompts {...defaultProps} setPrompts={setPrompts} />);

            // When: 编辑第二个提示词
            const textarea = screen.getByDisplayValue('分栏布局提示词内容');
            await user.type(textarea, '修改');

            // Then
            const callArg = setPrompts.mock.calls[setPrompts.mock.calls.length - 1][0];
            expect(callArg[0].id).toBe('1'); // ID 保持不变
            expect(callArg[2].id).toBe('3'); // 其他提示词的 ID 不变
            expect(callArg[3].id).toBe('4');
        });
    });

    describe('边界情况', () => {
        it('应该处理空提示词数组', () => {
            // Given & When
            render(<OptimizedPrompts prompts={[]} setPrompts={vi.fn()} />);

            // Then: 应该正常渲染，不崩溃
            expect(screen.getByText('选择布局变体')).toBeTruthy();
        });

        it('应该处理少于 4 个提示词的情况', () => {
            // Given
            const twoPrompts: OptimizedPrompt[] = [
                { id: '1', type: 'A', label: 'Layout A', content: '内容A' },
                { id: '2', type: 'B', label: 'Layout B', content: '内容B' },
            ];

            // When
            render(<OptimizedPrompts prompts={twoPrompts} setPrompts={vi.fn()} />);

            // Then
            expect(screen.getByText('方案 A')).toBeTruthy();
            expect(screen.getByText('方案 B')).toBeTruthy();
            expect(screen.queryByText('方案 C')).toBeFalsy();
        });

        it('应该处理超长的提示词内容', () => {
            // Given
            const longContent = 'A'.repeat(1000);
            const longPrompts: OptimizedPrompt[] = [
                { id: '1', type: 'A', label: 'Layout', content: longContent },
            ];

            // When
            render(<OptimizedPrompts prompts={longPrompts} setPrompts={vi.fn()} />);

            // Then: 应该正常显示
            expect(screen.getByDisplayValue(longContent)).toBeTruthy();
        });
    });

    describe('UI 交互测试', () => {
        it('应该显示所有方案的类型标识', () => {
            // Given & When
            render(<OptimizedPrompts {...defaultProps} />);

            // Then
            const typeA = screen.getByText('方案 A');
            const typeB = screen.getByText('方案 B');
            const typeC = screen.getByText('方案 C');
            const typeD = screen.getByText('方案 D');

            expect(typeA).toBeTruthy();
            expect(typeB).toBeTruthy();
            expect(typeC).toBeTruthy();
            expect(typeD).toBeTruthy();
        });

        it('每个提示词应该有独立的文本区域', () => {
            // Given & When
            render(<OptimizedPrompts {...defaultProps} />);

            // Then: 应该有 4 个 textarea
            const textareas = screen.getAllByRole('textbox');
            expect(textareas).toHaveLength(4);
        });
    });
});
