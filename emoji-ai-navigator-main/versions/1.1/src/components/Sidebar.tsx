import React from 'react';
import { Sparkles, Star, PenTool, Image, Video, Briefcase, Bot, MessageSquare, Code, Palette, Music, Search, Rocket, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  themeMode: 'light' | 'dark' | 'auto';
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
}

// 分类配置 - 根据提供的CSS变量配色
const categories = [
  { 
    name: '全部', 
    icon: Sparkles, 
    count: 1315,
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
    name: 'AI写作', 
    icon: PenTool, 
    count: 134,
    colors: {
      bg: '#F9E0D6',
      icon: '#F26C4F',
    }
  },
  { 
    name: 'AI图像', 
    icon: Image, 
    count: 245,
    colors: {
      bg: '#FEEBCD',
      icon: '#F79E57',
    }
  },
  { 
    name: 'AI视频', 
    icon: Video, 
    count: 89,
    colors: {
      bg: '#D0EBFF',
      icon: '#36A2EB',
    }
  },
  { 
    name: 'AI办公', 
    icon: Briefcase, 
    count: 67,
    colors: {
      bg: '#D4D8FF',
      icon: '#5352ED',
    }
  },
  { 
    name: 'AI智能体', 
    icon: Bot, 
    count: 45,
    colors: {
      bg: '#E9D5FF',
      icon: '#9333EA',
    }
  },
  { 
    name: 'AI聊天', 
    icon: MessageSquare, 
    count: 78,
    colors: {
      bg: '#D0F4FF',
      icon: '#22D3EE',
    }
  },
  { 
    name: 'AI编程', 
    icon: Code, 
    count: 156,
    colors: {
      bg: '#FAD0FF',
      icon: '#D946EF',
    }
  },
  { 
    name: 'AI设计', 
    icon: Palette, 
    count: 112,
    colors: {
      bg: '#D1E7DD',
      icon: '#16A34A',
    }
  },
  { 
    name: 'AI音频', 
    icon: Music, 
    count: 56,
    colors: {
      bg: '#D1FAE5',
      icon: '#10B981',
    }
  },
  { 
    name: 'AI搜索', 
    icon: Search, 
    count: 34,
    colors: {
      bg: '#ECFCCB',
      icon: '#84CC16',
    }
  },
  { 
    name: 'AI开发', 
    icon: Rocket, 
    count: 89,
    colors: {
      bg: '#FEF3C7',
      icon: '#F59E0B',
    }
  },
  { 
    name: 'AI学习', 
    icon: BookOpen, 
    count: 43,
    colors: {
      bg: '#BFDBFE',
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

const Sidebar: React.FC<SidebarProps> = ({ activeFilter, setActiveFilter, themeMode, setThemeMode }) => {
  const isDarkMode = isDarkModeActive(themeMode);

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
    <aside 
      className="w-64 h-screen sticky top-0 flex flex-col border-r transition-colors duration-300 scrollbar-hide"
      style={{ 
        backgroundColor: currentColors.background,
        borderColor: currentColors.border
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
                    onClick={() => setActiveFilter(category.name)}
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
            {/* 推荐工具卡片 - 参考 craftwork.design Pro Subscription 样式 */}
            <div 
              className="rounded-2xl p-4 border transition-all duration-300 cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: isDarkMode ? '#2C2C2C' : '#F9F9F9',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }}
            >
              {/* Logo */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: recommendedTools[0].color }}
              >
                <img 
                  src={recommendedTools[0].logo} 
                  alt={recommendedTools[0].name}
                  className="w-7 h-7 object-contain"
                />
              </div>
              
              {/* 标题 */}
              <h3 
                className="font-bold text-lg mb-1"
                style={{ color: currentColors.text }}
              >
                {recommendedTools[0].name}
              </h3>
              
              {/* 描述 */}
              <p 
                className="text-sm mb-4 leading-relaxed"
                style={{ color: currentColors.textSecondary }}
              >
                {recommendedTools[0].description}
              </p>
              
              {/* 撞色按钮 */}
              <button 
                className="w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: '#CAFC00',
                  color: '#000000'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#BCEB00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#CAFC00';
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                立即体验
              </button>
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
  );
};

export default Sidebar;
