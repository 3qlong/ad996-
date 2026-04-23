import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Star, PenTool, Image, Video, Briefcase, Bot, MessageSquare, Code, Palette, Music, Search, Rocket, BookOpen, Newspaper, TrendingUp } from 'lucide-react';

// 热榜指数图标：闪电造型的向上箭头
const ZapArrowUp = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M12 2 L19 11 L15 11 L19 15 L13 15 L13 22 L11 22 L11 15 L5 15 L9 11 L5 11 Z" />
  </svg>
);

interface SidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  themeMode: 'light' | 'dark' | 'auto';
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  isOpen?: boolean;
  onClose?: () => void;
}

// 分类配置 - 根据提供的CSS变量配色
const categories = [
  { 
    name: '全部',
    icon: Sparkles,
    count: 1433,
    colors: {
      bg: '#E9D5FF',
      icon: '#7C3AED',
    }
  },
  { 
    name: '收藏', 
    icon: Star, 
    count: 0,
    colors: {
      bg: '#FADADD',
      icon: '#F26488',
    }
  },
  {
    name: 'AI办公',
    icon: Briefcase,
    count: 220,
    colors: {
      bg: '#D4D8FF',
      icon: '#5352ED',
    }
  },
  {
    name: 'AI写作',
    icon: PenTool,
    count: 179,
    colors: {
      bg: '#F9E0D6',
      icon: '#F26C4F',
    }
  },
  {
    name: 'AI图像',
    icon: Image,
    count: 202,
    colors: {
      bg: '#FEEBCD',
      icon: '#F79E57',
    }
  },
  {
    name: 'AI视频',
    icon: Video,
    count: 149,
    colors: {
      bg: '#D0EBFF',
      icon: '#36A2EB',
    }
  },
  {
    name: 'AI编程',
    icon: Code,
    count: 82,
    colors: {
      bg: '#FAD0FF',
      icon: '#D946EF',
    }
  },
  {
    name: 'AI设计',
    icon: Palette,
    count: 86,
    colors: {
      bg: '#D1E7DD',
      icon: '#16A34A',
    }
  },
  {
    name: 'AI音频',
    icon: Music,
    count: 82,
    colors: {
      bg: '#D1FAE5',
      icon: '#10B981',
    }
  },
  {
    name: 'AI搜索',
    icon: Search,
    count: 40,
    colors: {
      bg: '#ECFCCB',
      icon: '#84CC16',
    }
  },
  {
    name: 'AI学习',
    icon: BookOpen,
    count: 25,
    colors: {
      bg: '#BFDBFE',
      icon: '#2563EB',
    }
  },
  {
    name: 'AI智能体',
    icon: Bot,
    count: 68,
    colors: {
      bg: '#E9D5FF',
      icon: '#9333EA',
    }
  },
  {
    name: '营销新闻',
    icon: Newspaper,
    count: 56,
    colors: {
      bg: '#FFE4E6',
      icon: '#E11D48',
    }
  },
  {
    name: '热榜指数',
    icon: ZapArrowUp,
    count: 62,
    colors: {
      bg: '#DBEAFE',
      icon: '#2563EB',
    }
  },
];

const recommendedTools = [
  { 
    name: 'ChatGPT', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    description: '最强大的AI对话助手',
    color: '#10A37F'
  },
  { 
    name: 'Midjourney', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Midjourney_Emblem.svg',
    description: 'AI图像生成神器',
    color: '#1F1F1F'
  },
  { 
    name: 'Claude', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg',
    description: 'Anthropic的AI助手',
    color: '#D97757'
  },
  { 
    name: 'Stable Diffusion', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Stable_Diffusion_logo.png',
    description: '开源AI绘画模型',
    color: '#6B4EE6'
  },
];

// 判断当前是否为暗黑模式
const isDarkModeActive = (themeMode: 'light' | 'dark' | 'auto'): boolean => {
  if (themeMode === 'dark') return true;
  if (themeMode === 'light') return false;
  // auto 模式，根据系统偏好
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Categories with dedicated secondary pages
const CATEGORY_ROUTES: Record<string, string> = {
  '营销新闻': '/marketing-news',
  '热榜指数': '/hot-index',
};

const Sidebar: React.FC<SidebarProps> = ({ activeFilter, setActiveFilter, themeMode, setThemeMode, isOpen, onClose }) => {
  const isDarkMode = isDarkModeActive(themeMode);
  const navigate = useNavigate();
  const [currentToolIndex, setCurrentToolIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentToolIndex(prev => (prev + 1) % recommendedTools.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Craftwork.design 配色方案
  const colors = {
    light: {
      background: '#FFFFFF',
      border: 'rgba(0, 0, 0, 0.1)',
      text: '#000000',
      textSecondary: '#606060',
      textTertiary: '#999999',
      hoverBg: '#F9F9F9',
      activeBg: '#EFEFEF',
      iconBg: '#F3F4F6',
    },
    dark: {
      background: '#1E1E1E',
      border: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: '#8C8C8C',
      textTertiary: '#999999',
      hoverBg: '#2C2C2C',
      activeBg: '#3D3D3D',
      iconBg: '#1F2937',
    }
  };

  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <>
    {/* Mobile overlay */}
    {isOpen && (
      <div className="md:hidden fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <aside
          className="absolute left-0 top-0 bottom-0 w-72 flex flex-col transition-colors duration-300 scrollbar-hide overflow-y-auto"
          style={{ backgroundColor: currentColors.background }}
        >
          <div className="flex items-center justify-between p-4">
            <span className="font-bold text-lg" style={{ color: currentColors.text }}>分类</span>
            <button onClick={onClose} className="p-1" style={{ color: currentColors.text }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="py-2 px-3">
            <ul className="space-y-0.5">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeFilter === category.name;
                return (
                  <li key={category.name}>
                    <button
                      onClick={() => {
                        if (CATEGORY_ROUTES[category.name]) {
                          navigate(CATEGORY_ROUTES[category.name]);
                          onClose?.();
                        } else {
                          setActiveFilter(category.name);
                          onClose?.();
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? currentColors.activeBg : 'transparent',
                        color: isActive ? currentColors.text : currentColors.textSecondary,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{
                          backgroundColor: isActive ? category.colors.icon : category.colors.bg,
                          color: isActive ? '#FFFFFF' : category.colors.icon,
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ fill: isActive ? 'white' : 'currentColor', stroke: 'none' }} />
                      </div>
                      <span className="flex-1 text-left font-medium">{category.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      </div>
    )}
    {/* Desktop sidebar */}
    <aside
      className="hidden md:flex w-64 h-screen sticky top-0 flex-col transition-colors duration-300 scrollbar-hide"
      style={{
        backgroundColor: currentColors.background
      }}
    >
      {/* 侧边栏内容区 - 合并导航和底部操作区 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* 分类导航 */}
        <nav className="py-4 px-3">
          <p 
            className="px-3 text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300"
            style={{ color: currentColors.textTertiary }}
          >
            分类
          </p>
          <ul className="space-y-0.5">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeFilter === category.name;
              return (
                <li key={category.name}>
                  <button
                    onClick={() => {
                      if (CATEGORY_ROUTES[category.name]) {
                        navigate(CATEGORY_ROUTES[category.name]);
                      } else {
                        setActiveFilter(category.name);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
                    style={{
                      backgroundColor: isActive
                        ? currentColors.activeBg
                        : 'transparent',
                      color: isActive 
                        ? currentColors.text
                        : currentColors.textSecondary,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = currentColors.hoverBg;
                        e.currentTarget.style.color = currentColors.text;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = currentColors.textSecondary;
                      }
                    }}
                  >
                    {/* 图标容器 - 使用配色 */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? category.colors.icon : category.colors.bg,
                        color: isActive ? '#FFFFFF' : category.colors.icon,
                      }}
                    >
                      <Icon 
                        className="w-4 h-4" 
                        style={{
                          fill: isActive ? 'white' : 'currentColor',
                          stroke: 'none'
                        }}
                      />
                    </div>
                    <span className="flex-1 text-left font-medium">{category.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* 推荐工具 */}
          <div className="mt-8 px-3">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300"
              style={{ color: currentColors.textTertiary }}
            >
              推荐工具
            </p>
            {/* 推荐工具卡片轮播 */}
            <div className="overflow-hidden rounded-2xl border transition-all duration-300"
              style={{
                backgroundColor: isDarkMode ? '#2C2C2C' : '#F9F9F9',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentToolIndex * 100}%)` }}
              >
                {recommendedTools.map((tool) => (
                  <div key={tool.name} className="w-full flex-shrink-0 p-4 cursor-pointer hover:opacity-90">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: tool.color }}
                    >
                      <img src={tool.logo} alt={tool.name} className="w-7 h-7 object-contain" />
                    </div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: currentColors.text }}>
                      {tool.name}
                    </h3>
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: currentColors.textSecondary }}>
                      {tool.description}
                    </p>
                    <button
                      className="w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#00a7f4', color: '#FFFFFF' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0090d4'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#00a7f4'; }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      立即体验
                    </button>
                  </div>
                ))}
              </div>
              {/* Dots indicator */}
              <div className="flex justify-center gap-1.5 pb-3">
                {recommendedTools.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentToolIndex(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: i === currentToolIndex ? '#00a7f4' : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
                      width: i === currentToolIndex ? 12 : 6,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* 底部操作区 - 合并到同一栏 */}
        <div 
          className="p-4 border-t transition-colors duration-300"
          style={{ borderColor: currentColors.border }}
        >
          {/* 主题模式切换 - Day/Night/Auto */}
          <div 
            className="flex items-center justify-between p-1 rounded-full mb-3"
            style={{ backgroundColor: currentColors.hoverBg }}
          >
            {(['light', 'dark', 'auto'] as const).map((mode) => {
              const isActive = themeMode === mode;
              const labels = { light: 'Day', dark: 'Night', auto: 'Auto' };
              return (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  className="flex-1 py-1.5 px-3 text-sm font-medium rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? currentColors.activeBg : 'transparent',
                    color: isActive 
                      ? currentColors.text
                      : currentColors.textSecondary,
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>

          {/* 版权信息 */}
          <div 
            className="text-xs text-center transition-colors duration-300"
            style={{ color: currentColors.textTertiary }}
          >
            <p>市场营销导航 | Copyright © ad996</p>
            <p className="mt-1">沪ICP备2023018164号-1</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
