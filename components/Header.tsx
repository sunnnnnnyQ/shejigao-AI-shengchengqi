
import React from 'react';

interface HeaderProps {
  currentView: string;
  setView: (view: any) => void;
  favCount: number;
  onHomeClick?: () => void; // 可选的首页点击回调
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, favCount, onHomeClick }) => {
  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      setView('home');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900/50 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={handleHomeClick}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
            A
          </div>
          <span className="text-xl font-bold tracking-tight">AIDesign</span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-4">
          <button
            onClick={handleHomeClick}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'home' ? 'bg-slate-900 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            首页生成
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'history' ? 'bg-slate-900 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            历史记录
          </button>
          <button
            onClick={() => setView('favorites')}
            className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'favorites' ? 'bg-slate-900 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            我的收藏
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] flex items-center justify-center rounded-full">
                {favCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setView('settings')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'settings' ? 'bg-slate-900 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            ⚙️ 设置
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
