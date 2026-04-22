import React, { useState, useEffect } from 'react';

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

interface RecommendedToolsCardProps {
  isDarkMode: boolean;
  className?: string;
}

const RecommendedToolsCard: React.FC<RecommendedToolsCardProps> = ({ isDarkMode, className = '' }) => {
  const [currentToolIndex, setCurrentToolIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentToolIndex(prev => (prev + 1) % recommendedTools.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const colors = {
    text: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#A0A0A0' : '#606060',
    textTertiary: '#999999',
  };

  return (
    <div className={className}>
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300"
        style={{ color: colors.textTertiary }}
      >
        推荐工具
      </p>
      <div
        className="overflow-hidden rounded-2xl border transition-all duration-300"
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
              <h3 className="font-bold text-lg mb-1" style={{ color: colors.text }}>
                {tool.name}
              </h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: colors.textSecondary }}>
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
        <div className="flex justify-center gap-1.5 pb-3">
          {recommendedTools.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentToolIndex(i)}
              className="rounded-full transition-all duration-200"
              style={{
                height: 6,
                backgroundColor: i === currentToolIndex ? '#00a7f4' : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
                width: i === currentToolIndex ? 12 : 6,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedToolsCard;
