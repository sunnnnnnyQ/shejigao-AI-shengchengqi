import React, { useState, useEffect } from 'react';
import { apiKeyService } from '../services/apiKeyService';

interface SettingsViewProps {
    onBack?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [saved, setSaved] = useState(false);

    // 从LocalStorage加载已保存的API Key
    useEffect(() => {
        const savedKey = apiKeyService.getApiKey();
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleSave = () => {
        if (!apiKeyService.validateApiKey(apiKey)) {
            alert('请输入有效的API Key（应以sk-开头）');
            return;
        }

        apiKeyService.saveApiKey(apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleTest = async () => {
        if (!apiKey) {
            alert('请先输入API Key');
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            // 测试API Key是否有效
            const response = await fetch('https://openrouter.ai/api/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                },
            });

            setTestResult(response.ok ? 'success' : 'error');
        } catch (error) {
            setTestResult('error');
        } finally {
            setTesting(false);
        }
    };

    const handleClear = () => {
        if (confirm('确定要删除已保存的API Key吗？')) {
            apiKeyService.removeApiKey();
            setApiKey('');
            setTestResult(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-3xl mx-auto">
            {/* 返回按钮 - 置于最顶部 */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-4"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    返回
                </button>
            )}

            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-3xl font-bold">⚙️ 设置</h2>
                <p className="text-slate-400">配置您的OpenRouter API Key以使用AI生成功能</p>
            </div>

            {/* API Key配置卡片 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-indigo-400">🔑 API Key 配置</h3>
                    <p className="text-sm text-slate-500">
                        您的API Key仅存储在浏览器本地，不会发送到任何服务器
                    </p>
                </div>

                {/* API Key输入 */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                        OpenRouter API Key
                    </label>
                    <div className="relative">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-or-v1-..."
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all pr-12"
                        />
                        <button
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-300 transition-colors"
                            aria-label="显示/隐藏API Key"
                        >
                            {showKey ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!apiKey}
                        className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-bold transition-all active:scale-95"
                    >
                        {saved ? '✓ 已保存' : '保存'}
                    </button>
                    <button
                        onClick={handleTest}
                        disabled={!apiKey || testing}
                        className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-bold transition-all active:scale-95"
                    >
                        {testing ? '测试中...' : '测试连接'}
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={!apiKeyService.hasApiKey()}
                        className="px-6 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-bold transition-all active:scale-95"
                    >
                        清除
                    </button>
                </div>

                {/* 测试结果 */}
                {testResult && (
                    <div className={`p-4 rounded-xl ${testResult === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {testResult === 'success' ? '✓ API Key 有效！' : '✗ API Key 无效或网络错误'}
                    </div>
                )}
            </div>

            {/* 使用指南 */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 space-y-4">
                <h3 className="text-lg font-bold text-slate-300">ℹ️ 如何获取API Key?</h3>
                <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
                    <li>访问 <a href="https://openrouter.ai" target="_blank" rel="noopener" className="text-indigo-400 hover:underline">https://openrouter.ai</a></li>
                    <li>注册账号并登录</li>
                    <li>在Dashboard中点击"Keys"</li>
                    <li>创建新的API Key并复制</li>
                    <li>粘贴到上方输入框中</li>
                </ol>
            </div>

            {/* 费用说明 */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 space-y-4">
                <h3 className="text-lg font-bold text-amber-400">💰 费用说明</h3>
                <ul className="space-y-2 text-sm text-amber-200/70 list-disc list-inside">
                    <li>您直接使用自己的OpenRouter API Key</li>
                    <li>费用按OpenRouter实际使用量计费</li>
                    <li>建议在OpenRouter设置使用限额</li>
                    <li>典型费用：每张图片约$0.01-0.05</li>
                </ul>
            </div>

            {/* 安全提示 */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 space-y-4">
                <h3 className="text-lg font-bold text-red-400">⚠️ 安全提示</h3>
                <ul className="space-y-2 text-sm text-red-200/70 list-disc list-inside">
                    <li>API Key仅存储在您的浏览器LocalStorage中</li>
                    <li>请勿在公共或共享电脑上使用</li>
                    <li>切勿分享包含API Key的截图</li>
                    <li>建议定期更换API Key以确保安全</li>
                </ul>
            </div>
        </div>
    );
};

export default SettingsView;
