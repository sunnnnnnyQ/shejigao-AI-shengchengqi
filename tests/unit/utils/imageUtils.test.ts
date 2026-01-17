import { describe, it, expect, vi } from 'vitest';
import {
    validateImageFile,
    formatFileSize,
    convertImageToBase64,
    createReferenceImage,
} from '../../../utils/imageUtils';
import { MAX_IMAGE_SIZE_BYTES, SUPPORTED_IMAGE_TYPES } from '../../../types';

describe('imageUtils', () => {
    describe('validateImageFile', () => {
        it('应该接受支持的图片格式', () => {
            const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
            const pngFile = new File([''], 'test.png', { type: 'image/png' });
            const webpFile = new File([''], 'test.webp', { type: 'image/webp' });

            expect(validateImageFile(jpegFile)).toBeNull();
            expect(validateImageFile(pngFile)).toBeNull();
            expect(validateImageFile(webpFile)).toBeNull();
        });

        it('应该拒绝不支持的文件格式', () => {
            const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
            const result = validateImageFile(pdfFile);

            expect(result).not.toBeNull();
            expect(result).toContain('不支持的文件格式');
        });

        it('应该拒绝超过大小限制的文件', () => {
            const largeContent = new Array(MAX_IMAGE_SIZE_BYTES + 1000).fill('a').join('');
            const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
            const result = validateImageFile(largeFile);

            expect(result).not.toBeNull();
            expect(result).toContain('文件过大');
        });

        it('应该接受大小在限制内的文件', () => {
            const smallContent = new Array(1000).fill('a').join('');
            const smallFile = new File([smallContent], 'small.jpg', { type: 'image/jpeg' });

            expect(validateImageFile(smallFile)).toBeNull();
        });
    });

    describe('formatFileSize', () => {
        it('应该正确格式化字节数', () => {
            expect(formatFileSize(0)).toBe('0 Bytes');
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(1024 * 1024)).toBe('1 MB');
            expect(formatFileSize(1536)).toBe('1.5 KB');
        });

        it('应该正确处理大文件', () => {
            const result = formatFileSize(5 * 1024 * 1024);
            expect(result).toContain('MB');
        });
    });

    describe('convertImageToBase64', () => {
        it('应该将File转换为base64字符串', async () => {
            const content = 'test image content';
            const file = new File([content], 'test.jpg', { type: 'image/jpeg' });

            // Mock FileReader - must use class/function style for constructors
            const mockResult = 'data:image/jpeg;base64,dGVzdCBpbWFnZSBjb250ZW50';
            class MockFileReader {
                onload: any = null;
                onerror: any = null;
                result: any = mockResult;

                readAsDataURL() {
                    setTimeout(() => {
                        if (this.onload) {
                            this.onload();
                        }
                    }, 0);
                }
            }

            global.FileReader = MockFileReader as any;

            const result = await convertImageToBase64(file);
            expect(result).toBe(mockResult);
        });

        it('应该在读取失败时抛出错误', async () => {
            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

            class MockFileReader {
                onload: any = null;
                onerror: any = null;
                result: any = '';

                readAsDataURL() {
                    setTimeout(() => {
                        if (this.onerror) {
                            this.onerror();
                        }
                    }, 0);
                }
            }

            global.FileReader = MockFileReader as any;

            await expect(convertImageToBase64(file)).rejects.toThrow('Failed to read file');
        });
    });

    describe('createReferenceImage', () => {
        it('应该创建完整的参考图对象', async () => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

            class MockFileReader {
                onload: any = null;
                onerror: any = null;
                result: any = 'data:image/jpeg;base64,dGVzdA==';

                readAsDataURL() {
                    setTimeout(() => {
                        if (this.onload) {
                            this.onload();
                        }
                    }, 0);
                }
            }

            global.FileReader = MockFileReader as any;

            const result = await createReferenceImage(file);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name', 'test.jpg');
            expect(result).toHaveProperty('base64');
            expect(result).toHaveProperty('previewUrl');
            expect(result).toHaveProperty('size');
            expect(result).toHaveProperty('type', 'image/jpeg');
            expect(result.id).toMatch(/^ref-/);
        });
    });
});
