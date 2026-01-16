
import React from 'react';
import { GeneratedDesign } from '../types';

interface HistoryViewProps {
  history: GeneratedDesign[];
  onToggleFavorite: (design: GeneratedDesign) => void;
  onBack?: () => void;
}


const HistoryView: React.FC<HistoryViewProps> = ({ history, onToggleFavorite, onBack }) => {
  if (history.length === 0) {
    return (
      <div className="space-y-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-4"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            返回
          </button>
        )}
        <div className="text-center py-32 space-y-6">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold">暂无历史记录</h2>
          <p className="text-slate-500 max-w-sm mx-auto">您的设计历史将显示在这里。立即开始您的第一个设计吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">设计历史</h2>
        <p className="text-slate-500 text-sm">显示您最近生成的 {history.length} 个设计（存储在浏览器本地）。</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {history.map((design) => (
          <div key={design.id} className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all shadow-lg">
            <img src={design.url} alt="历史记录" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
              <div className="flex justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(design); }}
                  className={`p-1.5 rounded-lg ${design.isFavorite ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-red-400'}`}
                >
                  <svg className="w-4 h-4" fill={design.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{design.variant}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">"{design.prompt.substring(0, 40)}..."</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
