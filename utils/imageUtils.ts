import { ReferenceImage, MAX_IMAGE_SIZE_BYTES, SUPPORTED_IMAGE_TYPES } from '../types';

/**
 * 将File对象转换为base64字符串
 */
export async function convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * 验证图片文件
 * @returns 错误消息，如果验证通过则返回null
 */
export function validateImageFile(file: File): string | null {
    // 检查文件类型
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        return `不支持的文件格式。支持的格式：JPG、PNG、WebP、GIF`;
    }

    // 检查文件大小
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const maxMB = (MAX_IMAGE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
        return `文件过大 (${sizeMB}MB)。最大支持 ${maxMB}MB`;
    }

    return null;
}

/**
 * 创建参考图对象
 */
export async function createReferenceImage(file: File): Promise<ReferenceImage> {
    const base64 = await convertImageToBase64(file);

    return {
        id: `ref-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name,
        base64,
        previewUrl: base64,
        size: file.size,
        type: file.type,
    };
}

/**
 * 压缩图片（可选功能）
 * 将图片压缩到指定的最大宽度，保持宽高比
 */
export async function resizeImage(base64: string, maxWidth: number = 1024): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            // 如果图片宽度小于等于最大宽度，直接返回
            if (img.width <= maxWidth) {
                resolve(base64);
                return;
            }

            // 计算新的尺寸，保持宽高比
            const ratio = maxWidth / img.width;
            const newWidth = maxWidth;
            const newHeight = img.height * ratio;

            // 创建canvas并绘制压缩后的图片
            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // 转换为base64
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            resolve(compressedBase64);
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = base64;
    });
}

/**
 * 格式化文件大小显示
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
