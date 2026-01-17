
import React, { useState, useRef, useEffect } from 'react';
import { DeviceType, ModelType, Language, LANGUAGE_LABELS } from '../types';

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
  onRefine: () => void;
  isOptimizing: boolean;
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  selectedModels: ModelType[];
  setSelectedModels: (m: ModelType[]) => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onRefine,
  isOptimizing,
  device,
  setDevice,
  selectedModels,
  setSelectedModels,
  language,
  setLanguage
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleModel = (m: ModelType) => {
    if (selectedModels.includes(m)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(sm => sm !== m));
      }
    } else {
      setSelectedModels([...selectedModels, m]);
    }
  };

  const modelOptions = [
    { id: ModelType.GEMINI_FLASH_IMAGE, label: 'Gemini 2.5 Flash', sub: 'Google Gemini - 快速生成，性价比高', disabled: false },
    { id: ModelType.FLUX_PRO, label: 'Flux.2 Pro', sub: 'Black Forest Labs - 顶级画质，细节丰富', disabled: false },
  ];


  const getSelectedLabel = () => {
    if (selectedModels.length === 0) return "未选择模型";
    const labels = selectedModels.map(m => modelOptions.find(o => o.id === m)?.label.split(' ')[0]);
    if (labels.length <= 2) return `已选: ${labels.join(', ')}`;
    return `已选 ${selectedModels.length} 个模型`;
  };

  return (
    <div className="space-y-8">
      {/* 输入区域 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">创意构思</label>
        <div className="relative group">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="例如：一个充满未来感的加密货币钱包，采用毛玻璃卡片设计和实时图表..."
            className="w-full min-h-[180px] p-8 bg-slate-950/50 border border-slate-800 rounded-[2rem] text-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 resize-none shadow-2xl"
          />
          <button
            onClick={onRefine}
            disabled={isOptimizing || !value.trim()}
            className="absolute bottom-6 right-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 z-10"
          >
            {isOptimizing ? (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            )}
            {isOptimizing ? "优化中..." : "生成布局建议"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 设备选择 */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">目标终端</label>
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 w-full overflow-hidden">
            {Object.values(DeviceType).map((type) => (
              <button
                key={type}
                onClick={() => setDevice(type)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all ${device === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 语言选择 */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">界面语言</label>
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 w-full overflow-hidden">
            {Object.values(Language).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all ${language === lang ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10"  >
        {/* 模型选择（增强下拉多选） */}
        <div className="space-y-4 relative" ref={dropdownRef}>
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">模型选择</label>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener" className="text-[10px] text-indigo-400 hover:underline">计费文档</a>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between p-4 bg-slate-950/50 border rounded-2xl text-left transition-all focus:ring-2 focus:ring-indigo-500/30 ${isDropdownOpen ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 shadow-lg' : 'border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                </div>
                <span className="text-sm font-medium text-slate-200 truncate">
                  {getSelectedLabel()}
                </span>
              </div>
              <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[400px] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">可用设计引擎 ({modelOptions.filter(o => !o.disabled).length})</p>
                </div>

                <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                  {modelOptions.map((m) => (
                    <button
                      key={m.id}
                      disabled={m.disabled}
                      onClick={() => !m.disabled && toggleModel(m.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all mb-1 last:mb-0 group ${selectedModels.includes(m.id) ? 'bg-indigo-600/10' : m.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800/80'}`}
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedModels.includes(m.id) ? 'bg-indigo-500 border-indigo-400 scale-110' : 'border-slate-700'}`}>
                        {selectedModels.includes(m.id) && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold truncate ${selectedModels.includes(m.id) ? 'text-indigo-400' : 'text-slate-200'}`}>
                            {m.label}
                          </span>
                          {m.disabled && <span className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">Soon</span>}
                        </div>
                        <span className="text-[10px] text-slate-500 line-clamp-1 group-hover:text-slate-400 transition-colors">{m.sub}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center sticky bottom-0 z-10">
                  <span className="text-[10px] text-slate-600 font-medium">支持多模型并行生成</span>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
                  >
                    完成选择
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
