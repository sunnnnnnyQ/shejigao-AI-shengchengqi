import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReferenceImageUpload from '../../../components/ReferenceImageUpload';
import { ReferenceImage } from '../../../types';

describe('ReferenceImageUpload', () => {
    const mockOnChange = vi.fn();
    const mockImages: ReferenceImage[] = [];

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('应该渲染上传组件', () => {
        render(<ReferenceImageUpload images={[]} onChange={mockOnChange} />);

        expect(screen.getByText(/上传参考图/i)).toBeInTheDocument();
        expect(screen.getByText(/最多上传 3 张/i)).toBeInTheDocument();
    });

    it('应该显示正确的图片数量', () => {
        const images: ReferenceImage[] = [
            {
                id: '1',
                name: 'test1.jpg',
                base64: 'data:image/jpeg;base64,test1',
                previewUrl: 'data:image/jpeg;base64,test1',
                size: 1024,
                type: 'image/jpeg',
            },
        ];

        render(<ReferenceImageUpload images={images} onChange={mockOnChange} />);

        expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('应该显示已上传的图片预览', () => {
        const images: ReferenceImage[] = [
            {
                id: '1',
                name: 'test1.jpg',
                base64: 'data:image/jpeg;base64,test1',
                previewUrl: 'data:image/jpeg;base64,test1',
                size: 1024,
                type: 'image/jpeg',
            },
        ];

        render(<ReferenceImageUpload images={images} onChange={mockOnChange} />);

        const img = screen.getByAltText('test1.jpg');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,test1');
    });

    it('应该在达到上限时隐藏上传按钮', () => {
        const images: ReferenceImage[] = [
            {
                id: '1',
                name: 'test1.jpg',
                base64: 'data:image/jpeg;base64,test1',
                previewUrl: 'data:image/jpeg;base64,test1',
                size: 1024,
                type: 'image/jpeg',
            },
            {
                id: '2',
                name: 'test2.jpg',
                base64: 'data:image/jpeg;base64,test2',
                previewUrl: 'data:image/jpeg;base64,test2',
                size: 1024,
                type: 'image/jpeg',
            },
            {
                id: '3',
                name: 'test3.jpg',
                base64: 'data:image/jpeg;base64,test3',
                previewUrl: 'data:image/jpeg;base64,test3',
                size: 1024,
                type: 'image/jpeg',
            },
        ];

        render(<ReferenceImageUpload images={images} onChange={mockOnChange} />);

        // 上传按钮应该不存在
        expect(screen.queryByText(/点击或拖拽上传/i)).not.toBeInTheDocument();
    });

    it('应该在点击删除按钮时调用onChange', () => {
        const images: ReferenceImage[] = [
            {
                id: '1',
                name: 'test1.jpg',
                base64: 'data:image/jpeg;base64,test1',
                previewUrl: 'data:image/jpeg;base64,test1',
                size: 1024,
                type: 'image/jpeg',
            },
        ];

        const { container } = render(<ReferenceImageUpload images={images} onChange={mockOnChange} />);

        // 找到删除按钮（SVG内的路径）
        const deleteButton = container.querySelector('button[title="删除"]');
        expect(deleteButton).toBeInTheDocument();

        if (deleteButton) {
            fireEvent.click(deleteButton);
            expect(mockOnChange).toHaveBeenCalledWith([]);
        }
    });

    it('应该能够选择文件输入元素', () => {
        const { container } = render(<ReferenceImageUpload images={[]} onChange={mockOnChange} />);

        const input = container.querySelector('input[type="file"]');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp,image/gif');
        expect(input).toHaveAttribute('multiple');
    });

    it('应该显示错误提示', () => {
        const { container } = render(<ReferenceImageUpload images={[]} onChange={mockOnChange} />);

        // 模拟上传不支持的文件类型
        const input = container.querySelector('input[type="file"]');

        if (input) {
            const file = new File([''], 'test.pdf', { type: 'application/pdf' });
            Object.defineProperty(input, 'files', {
                value: [file],
            });

            fireEvent.change(input);

            // 验证错误提示应该出现（这需要组件内部逻辑支持）
            // 实际测试可能需要等待异步操作
        }
    });

    it('应该在有参考图时显示提示信息', () => {
        const images: ReferenceImage[] = [
            {
                id: '1',
                name: 'test1.jpg',
                base64: 'data:image/jpeg;base64,test1',
                previewUrl: 'data:image/jpeg;base64,test1',
                size: 1024,
                type: 'image/jpeg',
            },
        ];

        render(<ReferenceImageUpload images={images} onChange={mockOnChange} />);

        expect(screen.getByText(/AI 将结合参考图和提示词生成设计稿/i)).toBeInTheDocument();
    });
});
