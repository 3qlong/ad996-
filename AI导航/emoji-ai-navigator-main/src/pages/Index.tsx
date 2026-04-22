import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import AiToolCard from '@/components/AiToolCard';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { Button } from "@/components/ui/button";
import { allTools } from '@/data/tools';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { generateSmartTags, toolMatchesTag } from '@/utils/smartTags';

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

// 每个大分类下的2个子分类标签
const CATEGORY_SUB_TAGS: Record<string, [string, string]> = {
  'AI办公': ['效率神器', '文档处理'],
  'AI写作': ['文案生成', '论文写作'],
  'AI图像': ['图片生成', '平面设计'],
  'AI视频': ['视频制作', '创意短片'],
  'AI编程': ['代码生成', '模型部署'],
  'AI设计': ['UI设计', '广告设计'],
  'AI音频': ['语音合成', '音乐生成'],
  'AI搜索': ['智能搜索', '知识问答'],
  'AI学习': ['语言学习', '职场教育'],
  'AI智能体': ['智能助手', '智能营销'],
  '营销新闻': ['营销资讯', '行业热点'],
  '热榜指数': ['实时热榜', '数据报告'],
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q')?.trim() ?? '';
  const catParam = searchParams.get('cat')?.trim() ?? '';
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState(catParam || '全部');
  const [activeSubTag, setActiveSubTag] = useState<string | null>(null);

  // 当 URL 中的 cat 参数变化时，同步 activeFilter（来自其他页面的导航）
  useEffect(() => {
    if (catParam && catParam !== activeFilter) {
      setActiveFilter(catParam);
      setActiveSubTag(null);
    }
  }, [catParam]);
  const [hoveredSubTag, setHoveredSubTag] = useState<string | null | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [favoritedTools, setFavoritedTools] = useState<number[]>([]);
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const { isAuthenticated, openLoginDialog } = useAuth();

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

  const filteredTools = useMemo(() => {
    let tools = allTools;

    // 站内搜索：按名称、二级标签、智能标签、描述过滤，忽略分类筛选
    if (searchQuery) {
      tools = tools.filter(tool => toolMatchesTag(tool, searchQuery));
      return tools.sort((a, b) => b.upvotes - a.upvotes);
    }

    // 分类筛选
    if (activeFilter === '收藏') {
      tools = tools.filter(tool => favoritedTools.includes(tool.id));
    } else if (activeFilter !== '全部') {
      tools = tools.filter(tool => tool.category === activeFilter);
    }

    // 子分类筛选
    if (activeSubTag) {
      tools = tools.filter(tool =>
        tool.tags.some(tag => tag.includes(activeSubTag)) ||
        tool.description.includes(activeSubTag) ||
        tool.name.includes(activeSubTag)
      );
    }

    return tools.sort((a, b) => b.upvotes - a.upvotes);
  }, [activeFilter, activeSubTag, favoritedTools, searchQuery]);

  const handleFilterClick = (filterName: string) => {
    if (filterName === '收藏' && !isAuthenticated) {
      openLoginDialog();
      return;
    }
    setActiveFilter(filterName);
    setActiveSubTag(null);
    // 同步到 URL，保证刷新及跨页导航回来时分类保持
    const next = new URLSearchParams(searchParams);
    if (filterName === '全部') {
      next.delete('cat');
    } else {
      next.set('cat', filterName);
    }
    setSearchParams(next, { replace: true });
  };

  const currentColors = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <div 
      className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}
      style={{ backgroundColor: currentColors.background }}
    >

      {/* 主体内容区域 */}
      <div className="flex flex-1 pt-[45px]">
        {/* 左侧导航栏 */}
        <Sidebar
          activeFilter={activeFilter}
          setActiveFilter={handleFilterClick}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile category bar - only shown on small screens */}
          <div className="md:hidden overflow-x-auto scrollbar-hide px-3 py-2 flex gap-2 flex-nowrap" style={{ borderBottom: `1px solid ${currentColors.border}` }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border"
              style={{
                backgroundColor: 'transparent',
                color: currentColors.textSecondary,
                borderColor: currentColors.border,
              }}
            >
              全部分类
            </button>
            {['全部', '收藏', 'AI办公', 'AI写作', 'AI图像', 'AI视频', 'AI编程', 'AI设计', 'AI音频', 'AI搜索', 'AI学习', 'AI智能体'].map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterClick(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: activeFilter === cat ? '#00a7f4' : (isDarkMode ? '#2C2C2C' : '#F0F0F0'),
                  color: activeFilter === cat ? '#FFFFFF' : currentColors.textSecondary,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 内容区 */}
          <div className="px-3 md:px-6 py-4 md:py-6">
            <div className="max-w-6xl mx-auto">
              {/* 标题和统计 */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3 md:gap-0">
                {/* 左侧：标题 + 桌面端的二级标签 */}
                <div className="flex items-center justify-between md:justify-start gap-4">
                  <h2
                    className="text-xl font-bold flex-shrink-0"
                    style={{ color: currentColors.text }}
                  >
                    {searchQuery
                      ? `搜索"${searchQuery}"`
                      : activeFilter === '全部' ? '所有工具' : activeFilter}
                  </h2>
                  {/* 桌面端二级标签：放在分类名称后面 */}
                  {!searchQuery && activeFilter !== '全部' && activeFilter !== '收藏' && CATEGORY_SUB_TAGS[activeFilter] && (
                    <div
                      className="hidden md:inline-flex items-center rounded-full p-1 gap-0.5"
                      style={{ backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }}
                      onMouseLeave={() => setHoveredSubTag(undefined)}
                    >
                      <button
                        onClick={() => setActiveSubTag(null)}
                        onMouseEnter={() => setHoveredSubTag(null)}
                        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0"
                        style={{
                          backgroundColor: (hoveredSubTag !== undefined ? hoveredSubTag === null : activeSubTag === null) ? '#00a7f4' : 'transparent',
                          color: (hoveredSubTag !== undefined ? hoveredSubTag === null : activeSubTag === null) ? '#FFFFFF' : currentColors.textSecondary,
                        }}
                      >
                        全部
                      </button>
                      {CATEGORY_SUB_TAGS[activeFilter].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setActiveSubTag(tag)}
                          onMouseEnter={() => setHoveredSubTag(tag)}
                          className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0"
                          style={{
                            backgroundColor: (hoveredSubTag !== undefined ? hoveredSubTag === tag : activeSubTag === tag) ? '#00a7f4' : 'transparent',
                            color: (hoveredSubTag !== undefined ? hoveredSubTag === tag : activeSubTag === tag) ? '#FFFFFF' : currentColors.textSecondary,
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                  <p
                    style={{ color: '#ff6b35', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => navigate(`/hot-ranking?category=${encodeURIComponent(activeFilter === '全部' ? '' : activeFilter)}`)}
                    className="md:hidden hover:opacity-80 transition-opacity text-sm"
                  >
                    🔥 热门AI工具
                  </p>
                </div>
                {/* 移动端二级标签：独立显示在下方 */}
                {!searchQuery && activeFilter !== '全部' && activeFilter !== '收藏' && CATEGORY_SUB_TAGS[activeFilter] && (
                  <div
                    className="md:hidden inline-flex items-center rounded-full p-1 gap-0.5 overflow-x-auto scrollbar-hide"
                    style={{ backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }}
                    onMouseLeave={() => setHoveredSubTag(undefined)}
                  >
                    <button
                      onClick={() => setActiveSubTag(null)}
                      onMouseEnter={() => setHoveredSubTag(null)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0"
                      style={{
                        backgroundColor: (hoveredSubTag !== undefined ? hoveredSubTag === null : activeSubTag === null) ? '#00a7f4' : 'transparent',
                        color: (hoveredSubTag !== undefined ? hoveredSubTag === null : activeSubTag === null) ? '#FFFFFF' : currentColors.textSecondary,
                      }}
                    >
                      全部
                    </button>
                    {CATEGORY_SUB_TAGS[activeFilter].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setActiveSubTag(tag)}
                        onMouseEnter={() => setHoveredSubTag(tag)}
                        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0"
                        style={{
                          backgroundColor: (hoveredSubTag !== undefined ? hoveredSubTag === tag : activeSubTag === tag) ? '#00a7f4' : 'transparent',
                          color: (hoveredSubTag !== undefined ? hoveredSubTag === tag : activeSubTag === tag) ? '#FFFFFF' : currentColors.textSecondary,
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <p
                  style={{ color: '#ff6b35', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => navigate(`/hot-ranking?category=${encodeURIComponent(activeFilter === '全部' ? '' : activeFilter)}`)}
                  className="hidden md:block hover:opacity-80 transition-opacity text-right"
                >
                  🔥 热门AI工具
                </p>
              </div>

              {/* 工具网格 - 4列自适应布局 */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
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
                    category={tool.category}
                    isFavorited={favoritedTools.includes(tool.id)}
                    onToggleFavorite={toggleFavorite}
                    isDarkMode={isDarkMode}
                    showTags={false}
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

              {/* 移动端日历 - 仅在手机端显示，放在工具列表下方 */}
              <div className="md:hidden mt-8">
                <WeeklyCalendar isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        </main>

        {/* 右侧日历 - 平板及以上显示，顶部与分类齐平 */}
        <aside
          className="hidden md:block w-80 flex-shrink-0 transition-colors duration-300"
          style={{
            backgroundColor: currentColors.background
          }}
        >
          <div className="sticky top-[45px] h-[calc(100vh-45px)] overflow-y-auto p-4">
            <WeeklyCalendar isDarkMode={isDarkMode} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
