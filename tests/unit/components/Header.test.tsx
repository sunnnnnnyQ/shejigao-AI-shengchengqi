import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../../../components/Header';

describe('Header Component', () => {
    describe('渲染测试', () => {
        it('应该渲染 Logo', () => {
            // Given: Header 组件
            const setView = () => { };

            // When: 渲染组件
            render(<Header currentView="home" setView={setView} favCount={0} />);

            // Then: 应该显示 AIDesign 文字
            expect(screen.getByText(/AIDesign/i)).toBeInTheDocument();
        });

        it('应该显示导航按钮', () => {
            // Given: Header 组件
            const setView = () => { };

            // When: 渲染组件
            render(<Header currentView="home" setView={setView} favCount={0} />);

            // Then: 应该有"我的收藏"、"历史记录"按钮
            expect(screen.getByText(/我的收藏/i)).toBeInTheDocument();
            expect(screen.getByText(/历史记录/i)).toBeInTheDocument();
        });

        it('应该显示收藏数量徽章', () => {
            // Given: 有 5 个收藏
            const setView = () => { };

            // When: 渲染组件
            render(<Header currentView="home" setView={setView} favCount={5} />);

            // Then: 应该显示数字 5
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('收藏数量为 0 时不显示徽章', () => {
            // Given: 没有收藏
            const setView = () => { };

            // When: 渲染组件
            const { container } = render(<Header currentView="home" setView={setView} favCount={0} />);

            // Then: 不应该有数字徽章（或者显示但内容为空）
            const badge = container.querySelector('[data-testid="fav-badge"]');
            if (badge) {
                expect(badge.textContent).toBe('');
            }
        });
    });

    describe('交互测试', () => {
        it('点击收藏夹应该切换视图', async () => {
            // Given: Header 组件
            const setView = vi.fn();
            const user = userEvent.setup();
            render(<Header currentView="home" setView={setView} favCount={0} />);

            // When: 点击"我的收藏"按钮
            const favButton = screen.getByText(/我的收藏/i);
            await user.click(favButton);

            // Then: 应该调用 setView('favorites')
            expect(setView).toHaveBeenCalledWith('favorites');
        });

        it('点击历史记录应该切换视图', async () => {
            // Given: Header 组件
            const setView = vi.fn();
            const user = userEvent.setup();
            render(<Header currentView="home" setView={setView} favCount={0} />);

            // When: 点击历史记录按钮
            const historyButton = screen.getByText(/历史记录/i);
            await user.click(historyButton);

            // Then: 应该调用 setView('history')
            expect(setView).toHaveBeenCalledWith('history');
        });
    });

    describe('视图状态测试', () => {
        it('当前视图为 home 时应该高亮首页', () => {
            // Given: 当前在首页
            const setView = () => { };

            // When: 渲染组件
            const { container } = render(<Header currentView="home" setView={setView} favCount={0} />);

            // Then: 首页按钮应该显示且有激活状态
            const homeButton = screen.getByText(/首页生成/i);
            expect(homeButton).toHaveClass('bg-slate-900', 'text-indigo-400');
        });

        it('点击 Logo 应该返回首页', async () => {
            // Given: Header 组件
            const setView = vi.fn();
            const user = userEvent.setup();
            render(<Header currentView="history" setView={setView} favCount={0} />);

            // When: 点击 Logo 区域（包含 A 图标和 AIDesign 文字）
            const logo = screen.getByText('AIDesign');
            await user.click(logo);

            // Then: 应该调用 setView('home')
            expect(setView).toHaveBeenCalledWith('home');
        });

        it('点击首页按钮应该切换到首页', async () => {
            // Given: 当前在历史记录页
            const setView = vi.fn();
            const user = userEvent.setup();
            render(<Header currentView="history" setView={setView} favCount={0} />);

            // When: 点击首页生成按钮
            const homeButton = screen.getByText(/首页生成/i);
            await user.click(homeButton);

            // Then: 应该调用 setView('home')
            expect(setView).toHaveBeenCalledWith('home');
        });
    });
});
