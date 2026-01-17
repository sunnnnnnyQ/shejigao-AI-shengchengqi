import React, { useRef, useState } from 'react';
import { ReferenceImage, MAX_REFERENCE_IMAGES } from '../types';
import { validateImageFile, createReferenceImage, formatFileSize } from '../utils/imageUtils';

interface ReferenceImageUploadProps {
    images: ReferenceImage[];
    onChange: (images: ReferenceImage[]) => void;
}

const ReferenceImageUpload: React.FC<ReferenceImageUploadProps> = ({ images, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canAddMore = images.length < MAX_REFERENCE_IMAGES;

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setError(null);

        const remainingSlots = MAX_REFERENCE_IMAGES - images.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        const newImages: ReferenceImage[] = [];

        for (const file of filesToProcess) {
            // 验证文件
            const validationError = validateImageFile(file);
            if (validationError) {
                setError(validationError);
                continue;
            }

            try {
                const image = await createReferenceImage(file);
                newImages.push(image);
            } catch (err) {
                console.error('Failed to process image:', err);
                setError('图片处理失败，请重试');
            }
        }

        if (newImages.length > 0) {
            onChange([...images, ...newImages]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files);
        // 重置input，允许重复选择同一文件
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (canAddMore) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!canAddMore) return;

        handleFileSelect(e.dataTransfer.files);
    };

    const handleRemove = (id: string) => {
        onChange(images.filter(img => img.id !== id));
        setError(null);
    };

    const handleClickUpload = () => {
        if (canAddMore && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="space-y-4">
            {/* 标题和说明 */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        上传参考图
                        <span className="text-xs font-normal text-slate-400">(可选)</span>
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        最多上传 {MAX_REFERENCE_IMAGES} 张，支持 JPG、PNG、WebP、GIF
                    </p>
                </div>
                <div className="text-sm text-slate-500">
                    {images.length}/{MAX_REFERENCE_IMAGES}
                </div>
            </div>

            {/* 上传区域和预览区域 */}
            <div className="grid grid-cols-3 gap-4">
                {/* 已上传图片预览 */}
                {images.map((image) => (
                    <div
                        key={image.id}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 transition-all"
                    >
                        <img
                            src={image.previewUrl}
                            alt={image.name}
                            className="w-full h-full object-cover"
                        />
                        {/* 删除按钮 */}
                        <button
                            onClick={() => handleRemove(image.id)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            title="删除"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {/* 文件信息 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-white truncate">{image.name}</p>
                            <p className="text-xs text-slate-300">{formatFileSize(image.size)}</p>
                        </div>
                    </div>
                ))}

                {/* 上传按钮 */}
                {canAddMore && (
                    <div
                        onClick={handleClickUpload}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`
              aspect-square rounded-xl border-2 border-dashed cursor-pointer
              flex flex-col items-center justify-center gap-2
              transition-all
              ${isDragging
                                ? 'border-indigo-400 bg-indigo-500/10'
                                : 'border-slate-600 hover:border-indigo-500 bg-slate-800/50 hover:bg-slate-800'
                            }
            `}
                    >
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-sm text-slate-400 text-center px-2">
                            {isDragging ? '释放以上传' : '点击或拖拽上传'}
                        </p>
                    </div>
                )}
            </div>

            {/* 隐藏的文件输入 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                onChange={handleInputChange}
                className="hidden"
            />

            {/* 错误提示 */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* 提示信息 */}
            {images.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-indigo-300">
                        AI 将结合参考图和提示词生成设计稿。参考图越相关，生成效果越好。
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReferenceImageUpload;
