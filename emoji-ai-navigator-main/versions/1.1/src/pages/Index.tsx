import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AiToolCard from '@/components/AiToolCard';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { Button } from "@/components/ui/button";
import { allTools } from '@/data/tools';
import { useAuth } from '@/contexts/AuthContext';

const searchEngines = [
  { name: 'DeepSeek', url: 'https://chat.deepseek.com/?q=' },
  { name: 'Kimi', url: 'https://www.kimi.com/?q=' },
  { name: '秘塔', url: 'https://metaso.cn/search?q=' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=' },
];

// 判断当前是否为暗黑模式
type ThemeMode = 'light' | 'dark' | 'auto';

const getIsDarkMode = (themeMode: ThemeMode): boolean => {
  if (themeMode === 'dark') return true;
  if (themeMode === 'light') return false;
  // auto 模式，根据系统偏好
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// Craftwork.design 配色方案
const COLORS = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F9F9F9',
    border: 'rgba(0, 0, 0, 0.1)',
    text: '#000000',
    textSecondary: '#606060',
    textTertiary: '#999999',
  },
  dark: {
    background: '#1E1E1E',
    backgroundSecondary: '#2C2C2C',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    textSecondary: '#606060',
    textTertiary: '#999999',
  }
};

const Index = () => {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [favoritedTools, setFavoritedTools] = useState<number[]>([]);
  const [externalSearchTerm, setExternalSearchTerm] = useState('');
  const [selectedEngine, setSelectedEngine] = useState(searchEngines[0].url);
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isAuthenticated, openLoginDialog } = useAuth();

  // 初始化时检查本地存储的主题设置
  useEffect(() => {
    const storedThemeMode = localStorage.getItem('themeMode') as ThemeMode;
    if (storedThemeMode) {
      setThemeMode(storedThemeMode);
    }
  }, []);

  // 监听主题模式变化和系统偏好变化
  useEffect(() => {
    const updateDarkMode = () => {
      setIsDarkMode(getIsDarkMode(themeMode));
    };

    updateDarkMode();

    // 如果是 auto 模式，监听系统主题变化
    if (themeMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateDarkMode();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // 保存主题设置
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (isAuthenticated) {
      const storedFavorites = localStorage.getItem('favoritedTools');
      if (storedFavorites) {
        setFavoritedTools(JSON.parse(storedFavorites));
      }
    } else {
      setFavoritedTools([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('favoritedTools', JSON.stringify(favoritedTools));
    }
  }, [favoritedTools, isAuthenticated]);

  const toggleFavorite = (toolId: number) => {
    setFavoritedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleSearch = () => {
    if (!externalSearchTerm.trim()) return;
    const url = selectedEngine + encodeURIComponent(externalSearchTerm);
    window.open(url, '_blank');
  };

  const filteredTools = useMemo(() => {
    let tools = allTools;

    // 分类筛选
    if (activeFilter === '收藏') {
      tools = tools.filter(tool => favoritedTools.includes(tool.id));
    } else if (activeFilter !== '全部') {
      tools = tools.filter(tool => tool.category === activeFilter);
    }

    return tools.sort((a, b) => b.upvotes - a.upvotes).slice(0, 20);
  }, [activeFilter, favoritedTools]);

  const handleFilterClick = (filterName: string) => {
    if (filterName === '收藏' && !isAuthenticated) {
      openLoginDialog();
      return;
    }
    setActiveFilter(filterName);
  };

  const currentColors = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <div 
      className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}
      style={{ backgroundColor: currentColors.background }}
    >
      {/* 左侧导航栏 */}
      <Sidebar 
        activeFilter={activeFilter}
        setActiveFilter={handleFilterClick}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto">
        {/* 内容区 */}
        <div className="px-6 py-6">
          <div className="max-w-6xl mx-auto">
            {/* 标题和统计 */}
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-xl font-bold"
                style={{ color: currentColors.text }}
              >
                {activeFilter === '全部' ? '所有工具' : activeFilter}
              </h2>
              <p style={{ color: currentColors.textSecondary }}>
                共 <span 
                  className="font-semibold"
                  style={{ color: currentColors.text }}
                >{filteredTools.length}</span> 个工具
              </p>
            </div>

            {/* 工具网格 - 4列自适应布局 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTools.map((tool, index) => (
                <AiToolCard
                  key={tool.id}
                  id={tool.id}
                  emoji={tool.emoji}
                  name={tool.name}
                  description={tool.description}
                  tags={tool.tags}
                  upvotes={tool.upvotes}
                  url={tool.url}
                  logo={tool.logo}
                  rank={index + 1}
                  isFavorited={favoritedTools.includes(tool.id)}
                  onToggleFavorite={toggleFavorite}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>

            {/* 空状态 */}
            {filteredTools.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: currentColors.text }}
                >
                  没有找到相关工具
                </h3>
                <p style={{ color: currentColors.textSecondary }}>
                  试试其他关键词或分类
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 右侧日历 - 仅在大屏幕显示 */}
      <aside 
        className="hidden 2xl:block w-80 border-l transition-colors duration-300"
        style={{ 
          backgroundColor: currentColors.background,
          borderColor: currentColors.border
        }}
      >
        <div className="sticky top-0 h-screen overflow-y-auto p-4">
          <WeeklyCalendar />
        </div>
      </aside>
    </div>
  );
};

export default Index;
