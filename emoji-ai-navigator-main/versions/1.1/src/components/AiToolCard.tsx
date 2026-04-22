import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bookmark } from 'lucide-react';

interface AiToolCardProps {
  id: number;
  emoji: string;
  name: string;
  description: string;
  tags: string[];
  upvotes: number;
  url: string;
  logo?: string;
  rank?: number;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
  isDarkMode?: boolean;
}

const AiToolCard: React.FC<AiToolCardProps> = ({ 
  id, 
  emoji, 
  name, 
  description, 
  tags, 
  upvotes, 
  url, 
  logo,
  rank, 
  isFavorited, 
  onToggleFavorite,
  isDarkMode = false
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated, openLoginDialog } = useAuth();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }
    onToggleFavorite(id);
  };

  const handleCardClick = () => {
    navigate(`/tool/${id}`);
  };

  // 配色方案
  const colors = {
    light: {
      card: '#F8F9FA',
      cardBorder: 'rgba(0, 0, 0, 0.05)',
      cardHover: '#FFFFFF',
      text: '#212529',
      textSecondary: '#6C757D',
      textTertiary: '#ADB5BD',
      tagBg: '#E9ECEF',
      tagText: '#495057',
      rankBg: '#FFD700',
      rankText: '#000000',
      upvoteBg: '#FFFFFF',
      upvoteBorder: '#DEE2E6',
    },
    dark: {
      card: '#2C2C2C',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
      cardHover: '#3D3D3D',
      text: '#FFFFFF',
      textSecondary: '#8C8C8C',
      textTertiary: '#999999',
      tagBg: '#1E1E1E',
      tagText: '#999999',
      rankBg: '#FFD700',
      rankText: '#000000',
      upvoteBg: '#1E1E1E',
      upvoteBorder: 'rgba(255, 255, 255, 0.1)',
    }
  };

  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 卡片容器 */}
      <div 
        className={`
          relative rounded-xl
          transition-all duration-300 ease-out
          overflow-hidden
        `}
        style={{
          backgroundColor: isHovered ? currentColors.cardHover : currentColors.card,
          border: `1px solid ${currentColors.cardBorder}`,
        }}
      >
        <div className="p-4 flex gap-4">
          {/* 左侧图标 */}
          <div className="flex-shrink-0">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                border: `1px solid ${currentColors.cardBorder}`
              }}
            >
              {logo ? (
                <img 
                  src={logo} 
                  alt={name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-2xl">{emoji}</span>
              )}
            </div>
          </div>

          {/* 中间内容 */}
          <div className="flex-1 min-w-0">
            {/* 排名和标题 */}
            <div className="flex items-center gap-2 mb-1">
              {rank && (
                <span 
                  className="font-bold"
                  style={{ 
                    color: rank <= 3 ? '#FFD700' : currentColors.text,
                    fontSize: '0.9rem'
                  }}
                >
                  {rank}.
                </span>
              )}
              <h3 
                className="font-semibold text-base flex-1"
                style={{ color: currentColors.text }}
              >
                {name}
                <button
                  onClick={handleToggleFavorite}
                  className="ml-2 flex-shrink-0"
                  aria-label={isFavorited ? '从收藏中移除' : '添加到收藏'}
                >
                  <Bookmark
                    className={`w-4 h-4 transition-colors ${isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                  />
                </button>
              </h3>
            </div>

            {/* 描述 */}
            <p 
              className="text-sm mb-3"
              style={{ color: currentColors.textSecondary }}
            >
              {description}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: currentColors.tagBg,
                    color: currentColors.tagText
                  }}
                >
                  {tag.replace('AI', '')}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧点赞数 */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: currentColors.upvoteBg,
                border: `1px solid ${currentColors.upvoteBorder}`
              }}
            >
              <div className="text-center">
                <svg 
                  className="w-3 h-3 mx-auto mb-1" 
                  fill="currentColor" 
                  viewBox="0 0 10 10"
                >
                  <path d="M5 0L10 10H0L5 0Z" />
                </svg>
                <span 
                  className="text-sm font-medium"
                  style={{ 
                    color: currentColors.text,
                    fontWeight: '500'
                  }}
                >
                  {upvotes}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiToolCard;
