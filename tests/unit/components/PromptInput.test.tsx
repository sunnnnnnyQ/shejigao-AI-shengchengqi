import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptInput from '../../../components/PromptInput';
import { DeviceType, ModelType } from '../../../types';

describe('PromptInput Component', () => {
    const defaultProps = {
        value: '',
        onChange: vi.fn(),
        onRefine: vi.fn(),
        isOptimizing: false,
        device: DeviceType.IPHONE,
        setDevice: vi.fn(),
        selectedModels: [ModelType.GEMINI_FLASH_IMAGE],
        setSelectedModels: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('渲染测试', () => {
        it('应该渲染文本输入框', () => {
            // Given & When
            render(<PromptInput {...defaultProps} />);

            // Then
            const textarea = screen.getByPlaceholderText(/例如：一个充满未来感的加密货币钱包/i);
            expect(textarea).toBeTruthy();
        });

        it('应该显示设备选择按钮', () => {
            // Given & When
            render(<PromptInput {...defaultProps} />);

            // Then
            expect(screen.getByText(DeviceType.IPHONE)).toBeTruthy();
            expect(screen.getByText(DeviceType.ANDROID)).toBeTruthy();
            expect(screen.getByText(DeviceType.PC)).toBeTruthy();
        });

        it('应该显示生成布局建议按钮', () => {
            // Given & When
            render(<PromptInput {...defaultProps} />);

            // Then
            expect(screen.getByText(/生成布局建议/i)).toBeTruthy();
        });

        it('应该显示模型选择按钮', () => {
            // Given & When
            render(<PromptInput {...defaultProps} />);

            // Then
            expect(screen.getByText(/已选:/i)).toBeTruthy();
        });
    });

    describe('文本输入测试', () => {
        it('应该允许用户输入文本', async () => {
            // Given
            const onChange = vi.fn();
            const user = userEvent.setup();
            render(<PromptInput {...defaultProps} onChange={onChange} />);

            // When
            const textarea = screen.getByPlaceholderText(/例如：一个充满未来感的加密货币钱包/i);
            await user.type(textarea, '一个电商APP');

            // Then
            expect(onChange).toHaveBeenCalled();
        });

        it('应该显示输入的值', () => {
            // Given & When
            render(<PromptInput {...defaultProps} value="测试提示词" />);

            // Then
            const textarea = screen.getByDisplayValue('测试提示词');
            expect(textarea).toBeTruthy();
        });
    });

    describe('设备选择测试', () => {
        it('应该高亮当前选中的设备', () => {
            // Given & When
            render(<PromptInput {...defaultProps} device={DeviceType.IPHONE} />);

            // Then
            const iphoneButton = screen.getByText(DeviceType.IPHONE);
            expect(iphoneButton).toHaveClass('bg-indigo-600');
        });

        it('点击设备应该触发 setDevice', async () => {
            // Given
            const setDevice = vi.fn();
            const user = userEvent.setup();
            render(<PromptInput {...defaultProps} setDevice={setDevice} />);

            // When
            const androidButton = screen.getByText(DeviceType.ANDROID);
            await user.click(androidButton);

            // Then
            expect(setDevice).toHaveBeenCalledWith(DeviceType.ANDROID);
        });

        it('应该支持切换到 PC 设备', async () => {
            // Given
            const setDevice = vi.fn();
            const user = userEvent.setup();
            render(<PromptInput {...defaultProps} setDevice={setDevice} />);

            // When
            const pcButton = screen.getByText(DeviceType.PC);
            await user.click(pcButton);

            // Then
            expect(setDevice).toHaveBeenCalledWith(DeviceType.PC);
        });
    });

    describe('生成按钮测试', () => {
        it('空输入时应该禁用生成按钮', () => {
            // Given & When
            render(<PromptInput {...defaultProps} value="" />);

            // Then
            const button = screen.getByText(/生成布局建议/i);
            expect(button).toBeDisabled();
        });

        it('有输入时应该启用生成按钮', () => {
            // Given & When
            render(<PromptInput {...defaultProps} value="有内容" />);

            // Then
            const button = screen.getByText(/生成布局建议/i);
            expect(button).not.toBeDisabled();
        });

        it('优化中应该禁用生成按钮', () => {
            // Given & When
            render(<PromptInput {...defaultProps} value="有内容" isOptimizing={true} />);

            // Then
            const button = screen.getByText(/优化中.../i);
            expect(button).toBeDisabled();
        });

        it('点击生成按钮应该触发 onRefine', async () => {
            // Given
            const onRefine = vi.fn();
            const user = userEvent.setup();
            render(<PromptInput {...defaultProps} value="测试提示词" onRefine={onRefine} />);

            // When
            const button = screen.getByText(/生成布局建议/i);
            await user.click(button);

            // Then
            expect(onRefine).toHaveBeenCalled();
        });

        it('优化中应该显示加载动画', () => {
            // Given & When
            render(<PromptInput {...defaultProps} value="测试" isOptimizing={true} />);

            // Then
            expect(screen.getByText(/优化中.../i)).toBeTruthy();
        });
    });

    describe('模型选择测试', () => {
        it('应该显示已选模型数量', () => {
            // Given & When
            render(<PromptInput {...defaultProps} selectedModels={[ModelType.GEMINI_FLASH_IMAGE]} />);

            // Then
            expect(screen.getByText(/已选:/i)).toBeTruthy();
        });

        it('选择多个模型时应该显示数量', () => {
            // Given & When
            render(<PromptInput {...defaultProps} selectedModels={[ModelType.GEMINI_FLASH_IMAGE, ModelType.FLUX_PRO]} />);

            // Then
            const text = screen.getByText(/已选/i);
            expect(text).toBeTruthy();
        });

        it('点击模型选择应该打开下拉菜单', async () => {
            // Given
            const user = userEvent.setup();
            render(<PromptInput {...defaultProps} />);

            // When
            const selectButton = screen.getByText(/已选:/i);
            await user.click(selectButton);

            // Then: 下拉菜单应该显示
            expect(screen.getByText(/可用设计引擎/i)).toBeTruthy();
        });
    });

    describe('边界情况', () => {
        it('应该处理非常长的输入', async () => {
            // Given
            const onChange = vi.fn();
            const longText = 'A'.repeat(1000);
            const user = userEvent.setup();
            render(<PromptInput {...defaultProps} onChange={onChange} />);

            // When
            const textarea = screen.getByPlaceholderText(/例如：一个充满未来感的加密货币钱包/i);
            await user.type(textarea, longText);

            // Then: 应该正常接受
            expect(onChange).toHaveBeenCalled();
        });

        it('应该处理空白字符输入', () => {
            // Given & When
            render(<PromptInput {...defaultProps} value="   " />);

            // Then: 空白字符应该禁用按钮
            const button = screen.getByText(/生成布局建议/i);
            expect(button).toBeDisabled();
        });
    });
});
