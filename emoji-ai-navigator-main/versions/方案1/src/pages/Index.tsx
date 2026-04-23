
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Header from '@/components/Header';
import AiToolCard from '@/components/AiToolCard';
import FilterTags from '@/components/FilterTags';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { Button } from "@/components/ui/button";
import { allTools } from '@/data/tools';
import { useAuth } from '@/contexts/AuthContext';

const filterCategories = [
  { name: '全部', emoji: '🌐' },
  { name: '收藏', emoji: '⭐' },
  { name: 'AI写作', emoji: '✍️' },
  { name: 'AI图像', emoji: '🎨' },
  { name: 'AI视频', emoji: '📹' },
  { name: 'AI办公', emoji: '💼' },
  { name: 'AI智能体', emoji: '🤖' },
  { name: 'AI聊天', emoji: '💬' },
  { name: 'AI编程', emoji: '💻' },
  { name: 'AI设计', emoji: '🎯' },
  { name: 'AI音频', emoji: '🎵' },
  { name: 'AI搜索', emoji: '🔍' },
  { name: 'AI开发', emoji: '🚀' },
  { name: 'AI学习', emoji: '📚' },
  { name: 'AI训练', emoji: '🏋️' },
  { name: 'AI检测', emoji: '🔬' },
  { name: 'AI提示', emoji: '💡' },
];

const searchEngines = [
  { name: 'DeepSeek', url: 'https://chat.deepseek.com/?q=' },
  { name: 'Kimi', url: 'https://www.kimi.com/?q=' },
  { name: '秘塔', url: 'https://metaso.cn/search?q=' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=' },
];

const Index = () => {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [favoritedTools, setFavoritedTools] = useState<number[]>([]);
  const [externalSearchTerm, setExternalSearchTerm] = useState('');
  const [selectedEngine, setSelectedEngine] = useState(searchEngines[0].url);
  const { isAuthenticated, openLoginDialog } = useAuth();
  const [searchBg, setSearchBg] = useState<string | null>(null);

  useEffect(() => {
    const storedBg = localStorage.getItem('searchBg');
    if (storedBg) {
      setSearchBg(storedBg);
    }
  }, []);

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
    if (activeFilter === '收藏') {
      return allTools
        .filter(tool => favoritedTools.includes(tool.id))
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 20);
    }

    return allTools
      .filter(tool => activeFilter === '全部' || tool.category === activeFilter)
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 20);
  }, [activeFilter, favoritedTools]);

  const handleFilterClick = (filterName: string) => {
    if (filterName === '收藏' && !isAuthenticated) {
      openLoginDialog();
      return;
    }
    setActiveFilter(filterName);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="md:sticky top-0 z-10 shadow-sm">
        <div className="bg-white">
          <Header />
        </div>
        <div
          className="relative"
          style={searchBg ? { backgroundImage: `url(${searchBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(to bottom, white, #DEE1E6)' }}
        >
          {searchBg && <div className="absolute inset-0 bg-black/10 z-0" />}
          <div className="relative z-10">
            <div className="container mx-auto py-4">
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 w-full min-h-[160px] sm:min-h-[120px] flex flex-col justify-between"
              >
                <textarea
                  placeholder="输入内容，选择AI引擎进行搜索..."
                  value={externalSearchTerm}
                  onChange={(e) => setExternalSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  className="w-full bg-transparent focus:outline-none border-0 text-base p-2 flex-grow resize-none"
                />
                <div className="flex justify-between items-center p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {searchEngines.map((engine) => {
                      const isSelected = selectedEngine === engine.url;
                      return (
                        <button
                          key={engine.name}
                          onClick={() => setSelectedEngine(engine.url)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            isSelected
                              ? 'bg-gray-200 text-gray-900 font-semibold'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {engine.name}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSearch}
                    className="h-9 w-9 rounded-full text-yellow-600 hover:bg-yellow-50"
                  >
                    <ArrowUp className="h-5 w-5" />
                    <span className="sr-only">搜索</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="container mx-auto py-2">
              <FilterTags tags={filterCategories} activeTag={activeFilter} setActiveTag={handleFilterClick} />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto py-4 md:py-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:items-start">
          <div className="lg:col-span-2 rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTools.map((tool, index) => (
                <AiToolCard
                  key={tool.id}
                  {...tool}
                  rank={index + 1}
                  isFavorited={favoritedTools.includes(tool.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <WeeklyCalendar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
