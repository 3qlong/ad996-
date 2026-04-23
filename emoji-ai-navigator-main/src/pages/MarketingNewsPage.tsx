import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import { allTools } from '@/data/tools';
import AiToolCard from '@/components/AiToolCard';
import Sidebar from '@/components/Sidebar';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { generateSmartTags } from '@/utils/smartTags';

const COLORS = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F9F9F9',
    border: 'rgba(0, 0, 0, 0.1)',
    text: '#000000',
    textSecondary: '#606060',
  },
  dark: {
    background: '#1E1E1E',
    backgroundSecondary: '#2C2C2C',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    textSecondary: '#606060',
  },
};

const SUB_TABS = ['全部', '营销资讯', '行业热点'];

export default function MarketingNewsPage() {
  const navigate = useNavigate();
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const currentColors = isDarkMode ? COLORS.dark : COLORS.light;
  const { isAuthenticated, openLoginDialog } = useAuth();

  const [activeTab, setActiveTab] = useState('全部');
  const [hoveredTab, setHoveredTab] = useState<string | undefined>(undefined);
  const [favoritedTools, setFavoritedTools] = useState<number[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const stored = localStorage.getItem('favoritedTools');
      if (stored) setFavoritedTools(JSON.parse(stored));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('favoritedTools', JSON.stringify(favoritedTools));
    }
  }, [favoritedTools, isAuthenticated]);

  const toggleFavorite = (toolId: number) => {
    setFavoritedTools(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const filteredTools = useMemo(() => {
    let tools = allTools.filter(t => t.category === '营销新闻');
    if (activeTab !== '全部') {
      tools = tools.filter(t => t.tags.includes(activeTab));
    }
    return tools.sort((a, b) => b.upvotes - a.upvotes);
  }, [activeTab]);

  const handleFilterClick = (filterName: string) => {
    if (filterName === '收藏' && !isAuthenticated) {
      openLoginDialog();
      return;
    }
    if (filterName === '营销新闻') return;
    if (filterName === '全部') {
      navigate('/');
    } else {
      navigate(`/?cat=${encodeURIComponent(filterName)}`);
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}
      style={{ backgroundColor: currentColors.background }}
    >
      <div className="flex flex-1 pt-[45px]">
        <Sidebar
          activeFilter="营销新闻"
          setActiveFilter={handleFilterClick}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Mobile category bar */}
          <div className="md:hidden overflow-x-auto scrollbar-hide px-3 py-2 flex gap-2 flex-nowrap" style={{ borderBottom: `1px solid ${currentColors.border}` }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border"
              style={{ backgroundColor: 'transparent', color: currentColors.textSecondary, borderColor: currentColors.border }}
            >
              全部分类
            </button>
            {['全部', '收藏', 'AI办公', 'AI写作', 'AI图像', 'AI视频', 'AI编程', 'AI设计', 'AI音频', 'AI搜索', 'AI学习', 'AI智能体', '营销新闻', '热榜指数'].map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterClick(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: cat === '营销新闻' ? '#00a7f4' : (isDarkMode ? '#2C2C2C' : '#F0F0F0'),
                  color: cat === '营销新闻' ? '#FFFFFF' : currentColors.textSecondary,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="px-3 md:px-6 py-4 md:py-6">
            <div className="max-w-6xl mx-auto">
              {/* Title row: 营销新闻 + 桌面端二级标签 + 热门AI工具 */}
              <div className="flex items-center justify-between mb-3 md:mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold flex-shrink-0" style={{ color: currentColors.text }}>
                    营销新闻
                  </h2>
                  {/* 桌面端二级标签：放在分类名称后面 */}
                  <div
                    className="hidden md:inline-flex items-center rounded-full p-1 gap-0.5"
                    style={{ backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }}
                    onMouseLeave={() => setHoveredTab(undefined)}
                  >
                    {SUB_TABS.map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        onMouseEnter={() => setHoveredTab(tab)}
                        className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
                        style={{
                          backgroundColor: (hoveredTab !== undefined ? hoveredTab === tab : activeTab === tab) ? '#00a7f4' : 'transparent',
                          color: (hoveredTab !== undefined ? hoveredTab === tab : activeTab === tab) ? '#FFFFFF' : currentColors.textSecondary,
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <p
                  style={{ color: '#ff6b35', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => navigate('/hot-ranking')}
                  className="hover:opacity-80 transition-opacity text-sm md:text-base"
                >
                  🔥 热门AI工具
                </p>
              </div>
              {/* 移动端二级标签：独立显示在下方 */}
              <div className="md:hidden mb-6">
                <div
                  className="flex w-full items-center rounded-full p-1 gap-0.5"
                  style={{ backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }}
                  onMouseLeave={() => setHoveredTab(undefined)}
                >
                  {SUB_TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      onMouseEnter={() => setHoveredTab(tab)}
                      className="flex-1 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
                      style={{
                        backgroundColor: (hoveredTab !== undefined ? hoveredTab === tab : activeTab === tab) ? '#00a7f4' : 'transparent',
                        color: (hoveredTab !== undefined ? hoveredTab === tab : activeTab === tab) ? '#FFFFFF' : currentColors.textSecondary,
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {filteredTools.map(tool => (
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
                    category={tool.category}
                    isFavorited={favoritedTools.includes(tool.id)}
                    onToggleFavorite={() => toggleFavorite(tool.id)}
                    isDarkMode={isDarkMode}
                    showTags={false}
                  />
                ))}
              </div>

              {filteredTools.length === 0 && (
                <div className="text-center py-20" style={{ color: currentColors.textSecondary }}>
                  暂无相关站点
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right calendar sidebar */}
        <aside
          className="hidden md:block w-80 flex-shrink-0 transition-colors duration-300"
          style={{ backgroundColor: currentColors.background }}
        >
          <div className="sticky top-[45px] h-[calc(100vh-45px)] overflow-y-auto p-4">
            <WeeklyCalendar isDarkMode={isDarkMode} />
          </div>
        </aside>
      </div>
    </div>
  );
}
