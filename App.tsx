
import React, { useState, useEffect } from 'react';
import { DeviceType, ModelType, OptimizedPrompt, GeneratedDesign, GenerationGroup } from './types';
import * as aiService from './services/aiService';
import { storageService } from './services/storageService';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import OptimizedPrompts from './components/OptimizedPrompts';
import ResultView from './components/ResultView';
import HistoryView from './components/HistoryView';
import FavoritesView from './components/FavoritesView';
import SettingsView from './components/SettingsView';
import LoadingOverlay from './components/LoadingOverlay';

type View = 'home' | 'results' | 'history' | 'favorites' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [userInput, setUserInput] = useState('');
  const [device, setDevice] = useState<DeviceType>(DeviceType.IPHONE);
  const [selectedModels, setSelectedModels] = useState<ModelType[]>([ModelType.GEMINI_FLASH_IMAGE]);
  const [optimizedPrompts, setOptimizedPrompts] = useState<OptimizedPrompt[]>([]);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [groupedResults, setGroupedResults] = useState<GenerationGroup[]>([]);
  const [history, setHistory] = useState<GeneratedDesign[]>([]);
  const [favorites, setFavorites] = useState<GeneratedDesign[]>([]);

  // 初始化：从URL读取视图状态并确保home路由在history stack中
  useEffect(() => {
    const path = window.location.hash.slice(1) || 'home';
    if (['home', 'results', 'history', 'favorites', 'settings'].includes(path)) {
      setCurrentView(path as View);
    } else {
      // 如果hash不合法，重置为home
      setCurrentView('home');
    }

    // 确保home路由在history stack中，防止返回时出现空白页
    if (!window.location.hash) {
      window.history.replaceState({}, '', '#home');
    }
  }, []);

  // 监听浏览器前进/后退按钮
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.hash.slice(1) || 'home';
      if (['home', 'results', 'history', 'favorites', 'settings'].includes(path)) {
        const newView = path as View;
        setCurrentView(newView);
        // 如果返回首页，清空状态
        if (newView === 'home') {
          setOptimizedPrompts([]);
          setGroupedResults([]);
        }
      } else {
        // 安全兜底：如果hash不合法，返回home
        setCurrentView('home');
        window.history.replaceState({}, '', '#home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    setHistory(storageService.getHistory());
    setFavorites(storageService.getFavorites());
  }, []);

  const handleRefine = async () => {
    if (!userInput.trim()) return;
    setIsOptimizing(true);
    try {
      const refined = await aiService.optimizePrompts(userInput);
      setOptimizedPrompts(refined);
    } catch (error) {
      console.error("优化提示词失败", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerate = async () => {
    if (optimizedPrompts.length === 0 || selectedModels.length === 0) return;

    // Check API keys for selected models
    for (const model of selectedModels) {
      if (!aiService.checkApiKey(model)) {
        console.warn(`API Key not found for model: ${model}`);
      }
    }

    setIsGenerating(true);
    setCurrentView('results');
    setGroupedResults([]);

    try {
      const allNewDesigns: GeneratedDesign[] = [];
      const newGroups: GenerationGroup[] = selectedModels.map(m => ({ model: m, designs: [] }));
      setGroupedResults(newGroups);

      for (const model of selectedModels) {
        for (const opt of optimizedPrompts) {
          try {
            const imageUrl = await aiService.generateUIDesign(opt.content, model, device);
            const design: GeneratedDesign = {
              id: Math.random().toString(36).substring(7),
              url: imageUrl,
              prompt: opt.content,
              variant: opt.label,
              model: model,
              timestamp: Date.now(),
              device: device,
              isFavorite: false
            };
            allNewDesigns.push(design);

            setGroupedResults(prev => prev.map(g =>
              g.model === model ? { ...g, designs: [...g.designs, design] } : g
            ));
          } catch (e) {
            console.error(`模型 ${model} 生成变体失败`, e);
          }
        }
      }

      storageService.saveToHistory(allNewDesigns);
      setHistory(storageService.getHistory());
    } catch (error) {
      console.error("批量生成失败", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (design: GeneratedDesign) => {
    storageService.toggleFavorite(design);
    setFavorites(storageService.getFavorites());
    setGroupedResults(prev => prev.map(g => ({
      ...g,
      designs: g.designs.map(d => d.id === design.id ? { ...d, isFavorite: !d.isFavorite } : d)
    })));
  };

  // 导航到指定视图，同时更新URL
  const navigateToView = (view: View) => {
    setCurrentView(view);
    window.history.pushState({}, '', `#${view}`);
  };

  // 返回首页并清理状态
  const handleBackToHome = () => {
    setCurrentView('home');
    setOptimizedPrompts([]);
    setGroupedResults([]);
    window.history.pushState({}, '', '#home');
  };

  // 浏览器返回按钮逻辑
  const handleBrowserBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 overflow-y-auto">
      <Header
        currentView={currentView}
        setView={navigateToView}
        favCount={favorites.length}
        onHomeClick={handleBackToHome}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 pb-32">
        {currentView === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <section className="text-center space-y-4 pt-16 pb-8">
              <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase">
                AI 驱动的 UI 设计引擎
              </div>
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">创意瞬间落地,</span><br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">设计无界。</span>
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light">
                通过自然语言描述，即刻生成专业、高保真的 UI 布局。支持多模型并行生成，适配多种终端。
              </p>
            </section>

            {/* 注意：移除这里的 overflow-hidden */}
            <section className="max-w-4xl mx-auto space-y-10 bg-slate-900/30 p-8 sm:p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-3xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-10 rounded-full"></div>

              <PromptInput
                value={userInput}
                onChange={setUserInput}
                onRefine={handleRefine}
                isOptimizing={isOptimizing}
                device={device}
                setDevice={setDevice}
                selectedModels={selectedModels}
                setSelectedModels={setSelectedModels}
              />

              {optimizedPrompts.length > 0 && (
                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                  <OptimizedPrompts prompts={optimizedPrompts} setPrompts={setOptimizedPrompts} />

                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || selectedModels.length === 0}
                      className="group relative px-12 py-5 bg-white text-slate-950 rounded-2xl font-bold text-xl shadow-2xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {isGenerating ? "生成中..." : `生成 ${optimizedPrompts.length * selectedModels.length} 个方案`}
                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </span>
                    </button>
                    <p className="text-slate-500 text-sm">
                      预计耗时: {selectedModels.length * 15} - {selectedModels.length * 30} 秒
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {currentView === 'results' && (
          <ResultView
            groups={groupedResults}
            isGenerating={isGenerating}
            originalPrompt={userInput}
            onBack={handleBrowserBack}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentView === 'history' && <HistoryView history={history} onToggleFavorite={toggleFavorite} onBack={handleBrowserBack} />}
        {currentView === 'favorites' && <FavoritesView favorites={favorites} onToggleFavorite={toggleFavorite} onBack={handleBrowserBack} />}
        {currentView === 'settings' && <SettingsView onBack={handleBrowserBack} />}
      </main>

      {isGenerating && <LoadingOverlay />}
    </div>
  );
};

export default App;
