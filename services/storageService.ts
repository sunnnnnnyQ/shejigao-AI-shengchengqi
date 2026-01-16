
import { GeneratedDesign } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'aidesign_history',
  FAVORITES: 'aidesign_favorites'
};

export const storageService = {
  // 保存多个设计稿到历史记录
  saveToHistory: (designs: GeneratedDesign[]) => {
    const history = storageService.getHistory();
    const updated = [...designs, ...history].slice(0, 100); // Keep last 100
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  },

  // 添加单个设计稿（便利方法）
  addDesign: (design: GeneratedDesign) => {
    storageService.saveToHistory([design]);
  },

  // 获取历史记录
  getHistory: (): GeneratedDesign[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  },

  // 删除单个设计稿
  deleteDesign: (id: string) => {
    const history = storageService.getHistory();
    const updated = history.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));

    // 同时从收藏中删除
    const favorites = storageService.getFavorites();
    const updatedFavorites = favorites.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
  },

  // 清空历史记录
  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  },

  // 切换收藏（接受完整设计对象）
  toggleFavorite: (design: GeneratedDesign | string) => {
    // 支持传入设计对象或ID
    let designObj: GeneratedDesign | undefined;
    let designId: string;

    if (typeof design === 'string') {
      // 如果传入的是ID，从历史记录中查找
      designId = design;
      const history = storageService.getHistory();
      designObj = history.find(d => d.id === designId);
      if (!designObj) {
        // 如果历史记录中没有，尝试从收藏中查找
        const favorites = storageService.getFavorites();
        designObj = favorites.find(f => f.id === designId);
      }
    } else {
      // 传入的是设计对象
      designObj = design;
      designId = design.id;
    }

    if (!designObj) {
      return undefined;
    }

    const favorites = storageService.getFavorites();
    const exists = favorites.find(f => f.id === designId);
    let updated: GeneratedDesign[];
    let newFavoriteStatus: boolean;

    if (exists) {
      // 取消收藏
      updated = favorites.filter(f => f.id !== designId);
      newFavoriteStatus = false;
    } else {
      // 添加收藏
      updated = [{ ...designObj, isFavorite: true }, ...favorites];
      newFavoriteStatus = true;
    }

    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));

    // 同时更新历史记录中的收藏状态
    const history = storageService.getHistory();
    const updatedHistory = history.map(d =>
      d.id === designId ? { ...d, isFavorite: newFavoriteStatus } : d
    );
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));

    // 返回更新后的设计对象
    return { ...designObj, isFavorite: newFavoriteStatus };
  },

  // 获取收藏列表
  getFavorites: (): GeneratedDesign[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  },

  // 检查是否已收藏
  isFavorited: (id: string): boolean => {
    const favorites = storageService.getFavorites();
    return favorites.some(f => f.id === id);
  }
};
