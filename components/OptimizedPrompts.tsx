
import React from 'react';
import { OptimizedPrompt } from '../types';

interface OptimizedPromptsProps {
  prompts: OptimizedPrompt[];
  setPrompts: (prompts: OptimizedPrompt[]) => void;
}

const OptimizedPrompts: React.FC<OptimizedPromptsProps> = ({ prompts, setPrompts }) => {
  const handleChange = (id: string, content: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, content } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
        <h3 className="text-xl font-bold">选择布局变体</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-md">已生成 4 种差异化布局建议</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="group relative bg-slate-950/50 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                方案 {prompt.type}
              </span>
              <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{prompt.label}</span>
            </div>
            <textarea
              value={prompt.content}
              onChange={(e) => handleChange(prompt.id, e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-slate-300 text-sm leading-relaxed resize-none p-0 h-24 placeholder:text-slate-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptimizedPrompts;
