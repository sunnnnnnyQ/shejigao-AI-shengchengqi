
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "正在分析视觉需求...",
  "合成高保真 UI 组件...",
  "优化至 4K 分辨率...",
  "应用专业色彩科学...",
  "细化像素级对齐...",
  "平衡信息层级结构...",
  "生成响应式布局方案...",
  "正在导出视觉资产..."
];

const LoadingOverlay: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="max-w-md w-full text-center space-y-8 px-6">
        {/* 动画图标 */}
        <div className="relative w-24 h-24 mx-auto mb-8">
           <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-[2rem]"></div>
           <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-[2rem] animate-spin"></div>
           <div className="absolute inset-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
           </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight animate-pulse">正在绘制您的创意</h2>
          <div className="h-6 overflow-hidden">
            <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em] transition-all duration-700 ease-in-out transform translate-y-0" key={msgIdx}>
              {MESSAGES[msgIdx]}
            </p>
          </div>
        </div>

        {/* 模拟进度条 */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
           <div className="h-full bg-indigo-500 animate-[progress_30s_linear_infinite]"></div>
        </div>
        
        <p className="text-slate-500 text-xs italic">
          并行生成多个方案通常需要 30-45 秒，请稍候。
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 95%; }
        }
      `}} />
    </div>
  );
};

export default LoadingOverlay;
