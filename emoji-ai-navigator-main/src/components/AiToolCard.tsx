import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bookmark } from 'lucide-react';
import { recordToolClick } from '@/services/clickTracking';

interface AiToolCardProps {
  id: number;
  emoji: string;
  name: string;
  description: string;
  tags: string[];
  upvotes: number;
  url: string;
  logo?: string;
  category?: string;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
  isDarkMode?: boolean;
  showTags?: boolean;
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
  category = '',
  isFavorited,
  onToggleFavorite,
  isDarkMode = false,
  showTags = true,
}) => {
  const navigate = useNavigate();
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
    recordToolClick({ id, name, category });
    navigate(`/tool/${id}`);
  };

  // 配色方案 - 完全参考图片
  const colors = {
    light: {
      card: '#FFFFFF',
      cardBorder: 'rgba(0, 0, 0, 0.08)',
      text: '#000000',
      textSecondary: '#666666',
      tagBg: '#F0F0F0',
      tagText: '#000000',
      upvoteBg: '#FFFFFF',
      upvoteBorder: '#E0E0E0',
    },
    dark: {
      card: '#2C2C2C',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: '#888888',
      tagBg: '#3A3A3A',
      tagText: '#FFFFFF',
      upvoteBg: '#2C2C2C',
      upvoteBorder: 'rgba(255, 255, 255, 0.1)',
    }
  };

  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer"
      style={{
        backgroundColor: 'transparent', // 默认与背景一致
        borderRadius: '8px',
        border: `1px solid transparent`, // 默认无边框
        padding: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'; // 悬浮高度减少50%
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.backgroundColor = currentColors.card; // 鼠标悬停时显示底色
        e.currentTarget.style.border = `1px solid ${currentColors.cardBorder}`; // 鼠标悬停时显示边框
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.backgroundColor = 'transparent'; // 鼠标离开时恢复透明背景
        e.currentTarget.style.border = `1px solid transparent`; // 鼠标离开时隐藏边框
      }}
    >
      {/* 左侧图标 */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '8px',
          position: 'relative',
          border: `1px solid ${currentColors.cardBorder}`,
          flexShrink: 0,
        }}
      >
        {logo ? (
          <>
            {/* 背景层：模糊放大同源图片，用边缘色填充四角空隙 */}
            <img
              src={logo}
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-6px',
                width: 'calc(100% + 12px)',
                height: 'calc(100% + 12px)',
                objectFit: 'cover',
                filter: 'blur(8px) brightness(1.05) saturate(1.1)',
              }}
            />
            {/* 主图层 */}
            <img
              src={logo}
              alt={name}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDarkMode ? '#3A3A3A' : '#F5F5F5',
            }}
          >
            <span className="text-2xl">{emoji}</span>
          </div>
        )}
      </div>

      {/* 中间内容 */}
      <div className="flex-1 min-w-0">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-1">
          <h3
            className="font-bold text-sm flex-1"
            style={{
              color: currentColors.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
            <button
              onClick={handleToggleFavorite}
              className="ml-2 flex-shrink-0"
              aria-label={isFavorited ? '从收藏中移除' : '添加到收藏'}
            >
              <Bookmark
                className="w-4 h-4 transition-colors"
                style={isFavorited ? { color: '#ffe412', fill: '#ffe412' } : { color: '#9ca3af' }}
              />
            </button>
          </h3>
        </div>

        {/* 描述 */}
        <p
          className="text-xs mb-2"
          style={{
            color: currentColors.textSecondary,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          title={description}
        >
          {description}
        </p>

        {/* 标签 */}
        {showTags && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map(tag => {
              // 限制标签最多显示6个汉字
              const truncatedTag = tag.length > 6 ? tag.substring(0, 6) + '...' : tag;
              return (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: currentColors.tagBg,
                    color: 'rgb(150, 150, 150)', // 标签文字颜色
                    fontWeight: '500',
                  }}
                  title={tag} // 显示完整标签作为提示
                >
                  {truncatedTag}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiToolCard;
