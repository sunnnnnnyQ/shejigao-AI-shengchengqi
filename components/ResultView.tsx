
import React, { useState } from 'react';
import { GenerationGroup, GeneratedDesign, ModelType, MODEL_CONFIGS } from '../types';

interface ResultViewProps {
  groups: GenerationGroup[];
  isGenerating: boolean;
  originalPrompt: string;
  onBack: () => void;
  onToggleFavorite: (design: GeneratedDesign) => void;
}

const ResultView: React.FC<ResultViewProps> = ({
  groups,
  isGenerating,
  originalPrompt,
  onBack,
  onToggleFavorite
}) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedDesign | null>(null);

  const getModelLabel = (model: ModelType) => {
    return MODEL_CONFIGS[model]?.displayName || model;
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 返回按钮 - 独立置于顶部 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        返回
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-900 pb-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">生成实验室</h2>
          <p className="text-slate-500 font-medium">原始构思: <span className="text-slate-300 italic">"{originalPrompt}"</span></p>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-sm font-bold border border-slate-800 transition-all flex items-center gap-2 group">
            <svg className="w-4 h-4 text-slate-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            打包下载
          </button>
          <button
            disabled
            className="px-6 py-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl text-sm font-bold border border-indigo-500/20 flex items-center gap-2 cursor-not-allowed grayscale"
            title="V2 版本即将推出"
          >
            <svg className="w-4 h-4" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 28.5C19 33.7467 14.7467 38 9.5 38C4.25329 38 0 33.7467 0 28.5C0 23.2533 4.25329 19 9.5 19H19V28.5Z" fill="#0AC17E" /><path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#19BCFE" /><path d="M19 0H28.5C33.7467 0 38 4.25329 38 9.5C38 14.7467 33.7467 19 28.5 19H19V0Z" fill="#FF7262" /><path d="M38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5Z" fill="#A259FF" /><path d="M0 9.5C0 4.25329 4.25329 0 9.5 0H19V19H9.5C4.25329 19 0 14.7467 0 9.5Z" fill="#F24E1E" /></svg>
            导出到 Figma
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {groups.map((group) => (
          <section key={group.model} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-900"></div>
              <div className="px-4 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                生成模型: {getModelLabel(group.model)}
              </div>
              <div className="h-px flex-1 bg-slate-900"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {group.designs.map((design, idx) => (
                <div
                  key={design.id}
                  className="group relative bg-slate-900/40 rounded-[2rem] overflow-hidden border border-slate-800/50 shadow-2xl hover:border-indigo-500/50 transition-all duration-700 flex flex-col h-full animate-in fade-in zoom-in-95"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* 预览图 */}
                  <div
                    className="relative aspect-[9/16] bg-slate-950 overflow-hidden cursor-zoom-in"
                    onClick={() => setSelectedImage(design)}
                  >
                    <img
                      src={design.url}
                      alt={design.variant}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <div className="w-full space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(design); }}
                            className={`p-3 rounded-2xl backdrop-blur-md transition-all ${design.isFavorite ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
                          >
                            <svg className="w-5 h-5" fill={design.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(design.prompt); }}
                            className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all active:scale-95"
                            title="复制提示词"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                          </button>
                        </div>
                        <button className="w-full py-3 bg-white text-slate-950 font-bold rounded-2xl text-sm shadow-xl hover:bg-slate-100 transition-all">
                          查看高清大图
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 详细信息 */}
                  <div className="p-6 space-y-4 bg-slate-900/60 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">{design.variant}</span>
                        <span className="text-[10px] text-slate-500 font-medium">1024 x 1024</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed italic line-clamp-3 group-hover:text-slate-200 transition-colors">
                        "{design.prompt.substring(0, 150)}..."
                      </p>
                    </div>

                    <a
                      href={design.url}
                      download={`aidesign-${design.id}.png`}
                      className="w-full text-center py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-bold text-slate-200 transition-all border border-slate-700/50"
                    >
                      保存到本地
                    </a>
                  </div>
                </div>
              ))}

              {isGenerating && group.designs.length < 4 && Array.from({ length: 4 - group.designs.length }).map((_, i) => (
                <div key={`loading-${i}`} className="aspect-[9/16] bg-slate-900/20 border border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center gap-6 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50"></div>
                  <div className="w-16 h-16 rounded-3xl border-4 border-slate-800 border-t-indigo-500 animate-spin relative z-10 shadow-2xl"></div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-slate-400 text-sm font-bold">正在渲染方案 {group.designs.length + i + 1}...</p>
                    <p className="text-slate-600 text-[10px] animate-pulse">计算像素与光影</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-10 right-10 p-3 text-slate-400 hover:text-white transition-colors">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row gap-8 bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
            <div className="md:w-1/2 h-[50vh] md:h-auto bg-black">
              <img src={selectedImage.url} alt="高清预览" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 p-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-indigo-400 font-black uppercase text-xs tracking-widest">{selectedImage.variant} 变体</span>
                  <h3 className="text-2xl font-bold">设计详细参数</h3>
                </div>
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-sm leading-relaxed font-mono">
                    {selectedImage.prompt}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs mb-1 uppercase font-bold">渲染引擎</p>
                    <p className="text-slate-200">{getModelLabel(selectedImage.model)}</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs mb-1 uppercase font-bold">目标终端</p>
                    <p className="text-slate-200">{selectedImage.device}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl shadow-xl hover:bg-slate-100 transition-all mt-8"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;
