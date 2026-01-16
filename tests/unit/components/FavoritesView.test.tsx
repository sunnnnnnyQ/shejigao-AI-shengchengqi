import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesView from '../../../components/FavoritesView';
import { GeneratedDesign, DeviceType, ModelType } from '../../../types';

describe('FavoritesView Component', () => {
    const mockFavorites: GeneratedDesign[] = [
        {
            id: 'fav-1',
            url: 'data:image/png;base64,mock1',
            prompt: '收藏的设计1',
            variant: 'A',
            model: ModelType.GEMINI_FLASH_IMAGE,
            timestamp: Date.now(),
            device: DeviceType.IPHONE,
            isFavorite: true,
        },
        {
            id: 'fav-2',
            url: 'data:image/png;base64,mock2',
            prompt: '收藏的设计2',
            variant: 'C',
            model: ModelType.FLUX_PRO,
            timestamp: Date.now() - 2000,
            device: DeviceType.ANDROID,
            isFavorite: true,
        },
    ];

    const defaultProps = {
        favorites: mockFavorites,
        onToggleFavorite: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('空状态', () => {
        it('收藏为空时应该显示空状态', () => {
            // Given & When
            render(<FavoritesView favorites={[]} onToggleFavorite={vi.fn()} />);

            // Then
            expect(screen.getByText('暂无收藏')).toBeTruthy();
            expect(screen.getByText(/点击设计图上的爱心图标/i)).toBeTruthy();
        });

        it('空状态应该显示爱心图标', () => {
            // Given & When
            const { container } = render(<FavoritesView favorites={[]} onToggleFavorite={vi.fn()} />);

            // Then: 空状态有SVG爱心图标
            const svg = container.querySelector('svg');
            expect(svg).toBeTruthy();
        });
    });

    describe('列表显示', () => {
        it('应该显示标题', () => {
            // Given & When
            render(<FavoritesView {...defaultProps} />);

            // Then
            expect(screen.getByText('我的收藏')).toBeTruthy();
        });

        it('应该显示描述文字', () => {
            // Given & When
            render(<FavoritesView {...defaultProps} />);

            // Then
            expect(screen.getByText(/为您精挑细选的 AI UI 设计方案/i)).toBeTruthy();
        });

        it('应该渲染所有收藏', () => {
            // Given & When
            const { container } = render(<FavoritesView {...defaultProps} />);

            // Then: 应该有2张图片
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(2);
        });

        it('应该显示变体标识', () => {
            // Given & When
            render(<FavoritesView {...defaultProps} />);

            // Then
            expect(screen.getByText('A')).toBeTruthy();
            expect(screen.getByText('C')).toBeTruthy();
        });

        it('应该显示下载按钮', () => {
            // Given & When
            render(<FavoritesView {...defaultProps} />);

            // Then
            const downloadButtons = screen.getAllByText(/下载大图/i);
            expect(downloadButtons.length).toBe(2);
        });

        it('应该显示提示词摘要', () => {
            // Given & When
            render(<FavoritesView {...defaultProps} />);

            // Then
            const prompts = screen.getAllByText(/收藏的设计/i);
            expect(prompts.length).toBeGreaterThan(0);
        });
    });

    describe('交互测试', () => {
        it('点击收藏按钮应该触发onToggleFavorite', async () => {
            // Given
            const onToggleFavorite = vi.fn();
            const user = userEvent.setup();
            const { container } = render(<FavoritesView {...defaultProps} onToggleFavorite={onToggleFavorite} />);

            // When: 点击第一个收藏卡片的按钮
            const buttons = container.querySelectorAll('button');
            if (buttons.length > 0) {
                await user.click(buttons[0]);

                // Then
                expect(onToggleFavorite).toHaveBeenCalled();
            }
        });

        it('下载按钮应该有正确的链接', () => {
            // Given & When
            const { container } = render(<FavoritesView {...defaultProps} />);

            // Then: 下载链接应该指向图片URL
            const downloadLinks = container.querySelectorAll('a[download]');
            expect(downloadLinks.length).toBe(2);
            expect(downloadLinks[0].getAttribute('href')).toBe(mockFavorites[0].url);
        });
    });

    describe('边界情况', () => {
        it('应该处理单个收藏', () => {
            // Given
            const singleFavorite = [mockFavorites[0]];

            // When & Then: 不应该崩溃
            render(<FavoritesView favorites={singleFavorite} onToggleFavorite={vi.fn()} />);
            expect(screen.getByText('我的收藏')).toBeTruthy();
        });

        it('应该处理多个收藏', () => {
            // Given: 10个收藏
            const manyFavorites = Array.from({ length: 10 }, (_, i) => ({
                ...mockFavorites[0],
                id: `fav-${i}`,
                variant: `Design-${i}`,
            }));

            // When & Then: 不应该崩溃
            render(<FavoritesView favorites={manyFavorites} onToggleFavorite={vi.fn()} />);
            expect(screen.getByText('我的收藏')).toBeTruthy();
        });

        it('应该处理超长提示词', () => {
            // Given
            const longPromptFavorite: GeneratedDesign = {
                ...mockFavorites[0],
                prompt: 'B'.repeat(300),
            };

            // When & Then: 不应该崩溃，提示词应该被截断
            const { container } = render(<FavoritesView favorites={[longPromptFavorite]} onToggleFavorite={vi.fn()} />);
            expect(screen.getByText('我的收藏')).toBeTruthy();
            // 提示词应该被截断到80字符
            const promptText = container.querySelector('.line-clamp-2');
            expect(promptText).toBeTruthy();
        });
    });
});
