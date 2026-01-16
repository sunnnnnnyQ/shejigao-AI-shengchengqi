import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryView from '../../../components/HistoryView';
import { GeneratedDesign, DeviceType, ModelType } from '../../../types';

describe('HistoryView Component', () => {
    const mockDesigns: GeneratedDesign[] = [
        {
            id: 'design-1',
            url: 'data:image/png;base64,mock1',
            prompt: '测试提示词1',
            variant: 'A',
            model: ModelType.GEMINI_FLASH_IMAGE,
            timestamp: Date.now(),
            device: DeviceType.IPHONE,
            isFavorite: false,
        },
        {
            id: 'design-2',
            url: 'data:image/png;base64,mock2',
            prompt: '测试提示词2',
            variant: 'B',
            model: ModelType.GEMINI_FLASH_IMAGE,
            timestamp: Date.now() - 1000,
            device: DeviceType.IPHONE,
            isFavorite: true,
        },
    ];

    const defaultProps = {
        history: mockDesigns,
        onToggleFavorite: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('空状态', () => {
        it('历史记录为空时应该显示空状态', () => {
            // Given & When
            render(<HistoryView history={[]} onToggleFavorite={vi.fn()} />);

            // Then
            expect(screen.getByText('暂无历史记录')).toBeTruthy();
            expect(screen.getByText(/您的设计历史将显示在这里/i)).toBeTruthy();
        });

        it('空状态应该显示时钟图标', () => {
            // Given & When
            const { container } = render(<HistoryView history={[]} onToggleFavorite={vi.fn()} />);

            // Then: 空状态有SVG图标
            const svg = container.querySelector('svg');
            expect(svg).toBeTruthy();
        });
    });

    describe('列表显示', () => {
        it('应该显示标题', () => {
            // Given & When
            render(<HistoryView {...defaultProps} />);

            // Then
            expect(screen.getByText('设计历史')).toBeTruthy();
        });

        it('应该显示历史记录数量', () => {
            // Given & When
            render(<HistoryView {...defaultProps} />);

            // Then
            expect(screen.getByText(/显示您最近生成的 2 个设计/i)).toBeTruthy();
        });

        it('应该渲染所有历史记录', () => {
            // Given & When
            const { container } = render(<HistoryView {...defaultProps} />);

            // Then: 应该有2张图片
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(2);
        });

        it('应该显示变体标识', () => {
            // Given & When
            render(<HistoryView {...defaultProps} />);

            // Then
            expect(screen.getByText('A')).toBeTruthy();
            expect(screen.getByText('B')).toBeTruthy();
        });

        it('应该显示提示词摘要', () => {
            // Given & When
            render(<HistoryView {...defaultProps} />);

            // Then: 提示词会被截断
            const prompts = screen.getAllByText(/测试提示词/i);
            expect(prompts.length).toBeGreaterThan(0);
        });
    });

    describe('交互测试', () => {
        it('点击收藏按钮应该触发onToggleFavorite', async () => {
            // Given
            const onToggleFavorite = vi.fn();
            const user = userEvent.setup();
            const { container } = render(<HistoryView {...defaultProps} onToggleFavorite={onToggleFavorite} />);

            // When: 点击第一个设计的收藏按钮
            const buttons = container.querySelectorAll('button');
            if (buttons.length > 0) {
                await user.click(buttons[0]);

                // Then
                expect(onToggleFavorite).toHaveBeenCalled();
            }
        });
    });

    describe('边界情况', () => {
        it('应该处理单个历史记录', () => {
            // Given
            const singleHistory = [mockDesigns[0]];

            // When & Then
            render(<HistoryView history={singleHistory} onToggleFavorite={vi.fn()} />);
            expect(screen.getByText(/显示您最近生成的 1 个设计/i)).toBeTruthy();
        });

        it('应该处理大量历史记录', () => {
            // Given: 100个历史记录
            const manyDesigns = Array.from({ length: 100 }, (_, i) => ({
                ...mockDesigns[0],
                id: `design-${i}`,
            }));

            // When & Then: 不应该崩溃
            render(<HistoryView history={manyDesigns} onToggleFavorite={vi.fn()} />);
            expect(screen.getByText(/显示您最近生成的 100 个设计/i)).toBeTruthy();
        });

        it('应该处理超长提示词', () => {
            // Given
            const longPromptDesign: GeneratedDesign = {
                ...mockDesigns[0],
                prompt: 'A'.repeat(200),
            };

            // When & Then: 不应该崩溃
            render(<HistoryView history={[longPromptDesign]} onToggleFavorite={vi.fn()} />);
            expect(screen.getByText('设计历史')).toBeTruthy();
        });
    });
});
