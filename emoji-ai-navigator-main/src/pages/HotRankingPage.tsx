import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import { fetchHotTools, type HotTool } from '@/services/clickTracking';
import { allTools } from '@/data/tools';
import AiToolCard from '@/components/AiToolCard';
import RecommendedToolsCard from '@/components/RecommendedToolsCard';
import { generateSmartTags } from '@/utils/smartTags';
import { ArrowLeft } from 'lucide-react';

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

const CATEGORY_TABS = [
  '全部', 'AI办公', 'AI写作', 'AI图像', 'AI视频', 'AI编程',
  'AI设计', 'AI音频', 'AI搜索', 'AI学习', 'AI智能体',
];

export default function HotRankingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const currentColors = isDarkMode ? COLORS.dark : COLORS.light;
  const { isAuthenticated } = useAuth();

  const initialCategory = searchParams.get('category') || '';
  const [activeCategory, setActiveCategory] = useState(initialCategory || '全部');
  const [hotTools, setHotTools] = useState<HotTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritedTools, setFavoritedTools] = useState<number[]>([]);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (isAuthenticated) {
      const stored = localStorage.getItem('favoritedTools');
      if (stored) setFavoritedTools(JSON.parse(stored));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    const cat = activeCategory === '全部' ? '' : activeCategory;
    fetchHotTools(cat, days, 50).then((data) => {
      setHotTools(data);
      setLoading(false);
    });
  }, [activeCategory, days]);

  // Merge hot tool data with local allTools for logo/description/tags
  const rankedTools = useMemo(() => {
    const toolMap = new Map(allTools.map(t => [t.id, t]));
    return hotTools.map((ht, i) => {
      const local = toolMap.get(ht.tool_id);
      return {
        id: ht.tool_id,
        name: local?.name || ht.tool_name,
        emoji: local?.emoji || '🤖',
        description: local?.description || '',
        tags: local?.tags || [],
        upvotes: local?.upvotes || 0,
        url: local?.url || '',
        logo: local?.logo || '',
        category: local?.category || ht.category,
        clicks: ht.clicks,
        rank: i + 1,
      };
    });
  }, [hotTools]);

  // If no hot data yet, fall back to local tools sorted by upvotes
  const displayTools = useMemo(() => {
    if (rankedTools.length > 0) return rankedTools;
    // Fallback: show local tools sorted by upvotes for the selected category
    let tools = [...allTools];
    if (activeCategory !== '全部') {
      tools = tools.filter(t => t.category === activeCategory);
    }
    return tools.sort((a, b) => b.upvotes - a.upvotes).slice(0, 50).map((t, i) => ({
      ...t,
      clicks: 0,
      rank: i + 1,
    }));
  }, [rankedTools, activeCategory]);

  const toggleFavorite = (toolId: number) => {
    setFavoritedTools(prev => {
      const next = prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId];
      localStorage.setItem('favoritedTools', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div
      className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}
      style={{ backgroundColor: currentColors.background }}
    >
      <div className="px-3 md:px-6 py-4 md:py-6" style={{ paddingTop: '20px' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} style={{ color: currentColors.text }} />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
              🔥 热门AI工具排行榜
            </h1>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide flex-nowrap md:flex-wrap pb-1">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap"
                style={{
                  backgroundColor: 'transparent',
                  color: activeCategory === cat ? '#00a7f4' : currentColors.textSecondary,
                  border: `1px solid ${activeCategory === cat ? '#00a7f4' : currentColors.border}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Two-column layout: main content + recommended tools sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Time range selector - 与右侧推荐工具顶部齐平 */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm" style={{ color: currentColors.textSecondary }}>统计周期：</span>
                {[
                  { label: '今日', value: 1 },
                  { label: '7天', value: 7 },
                  { label: '30天', value: 30 },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDays(opt.value)}
                    className="px-3 py-1 rounded-full text-sm transition-all"
                    style={{
                      backgroundColor: 'transparent',
                      color: days === opt.value ? '#00a7f4' : currentColors.textSecondary,
                      border: `1px solid ${days === opt.value ? '#00a7f4' : 'transparent'}`,
                      fontWeight: days === opt.value ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-center py-20" style={{ color: currentColors.textSecondary }}>
                  加载中...
                </div>
              )}

              {/* Ranking list */}
              {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
                  {displayTools.map((tool) => (
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
              )}

              {/* Empty state */}
              {!loading && displayTools.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: currentColors.text }}>
                    暂无排行数据
                  </h3>
                  <p style={{ color: currentColors.textSecondary }}>
                    该分类还没有点击数据，快去探索吧！
                  </p>
                </div>
              )}
            </div>

            {/* Right sidebar: recommended tools - 与统计周期顶部齐平 */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-[120px]">
                <RecommendedToolsCard isDarkMode={isDarkMode} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
