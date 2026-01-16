
import React from 'react';
import { GeneratedDesign } from '../types';

interface FavoritesViewProps {
  favorites: GeneratedDesign[];
  onToggleFavorite: (design: GeneratedDesign) => void;
  onBack?: () => void;
}


const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onToggleFavorite, onBack }) => {
  if (favorites.length === 0) {
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
            <svg className="w-10 h-10 text-red-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold">暂无收藏</h2>
          <p className="text-slate-500 max-w-sm mx-auto">点击设计图上的爱心图标，即可将其保存到您的私人收藏夹。</p>
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
        <h2 className="text-2xl font-bold">我的收藏</h2>
        <p className="text-slate-500 text-sm">为您精挑细选的 AI UI 设计方案。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((design) => (
          <div key={design.id} className="group relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
            <div className="relative aspect-[9/16] bg-slate-950 overflow-hidden">
              <img src={design.url} alt={design.variant} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <button
                onClick={() => onToggleFavorite(design)}
                className="absolute top-4 right-4 p-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-md text-red-500 border border-white/10"
              >
                <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{design.variant}</p>
              <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed italic">"{design.prompt.substring(0, 80)}..."</p>
              <div className="flex gap-2 pt-2">
                <a href={design.url} download className="flex-1 py-2 text-center bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors">下载大图</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesView;
