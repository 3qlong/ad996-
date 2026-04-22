
import React, { useState, useEffect } from 'react';
import { Triangle, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AiToolCardProps {
  id: number;
  emoji: string;
  name: string;
  description: string;
  tags: string[];
  upvotes: number;
  url: string;
  rank?: number;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
}

const AiToolCard: React.FC<AiToolCardProps> = ({ id, emoji, name, description, tags, upvotes, url, rank, isFavorited, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const { isAuthenticated, openLoginDialog } = useAuth();

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUpvoted) {
      setCurrentUpvotes(currentUpvotes + 1);
      setIsUpvoted(true);
      setShowPlusOne(true);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }
    onToggleFavorite(id);
  }

  useEffect(() => {
    if (showPlusOne) {
      const timer = setTimeout(() => {
        setShowPlusOne(false);
      }, 1000); // Corresponds to animation duration
      return () => clearTimeout(timer);
    }
  }, [showPlusOne]);

  const handleCardClick = () => {
    navigate(`/tool/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="px-4 py-3 flex items-start justify-between transition-colors hover:bg-[#f2f4f7] rounded-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
        <div className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] bg-gray-100 rounded-lg flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm sm:text-base transition-colors duration-200 truncate ${isHovered && !isUpvoted ? 'text-[#cda14c]' : ''}`}>
              {rank && <span>{rank}. </span>}
              {name}
            </h3>
            <button
              onClick={handleToggleFavorite}
              className="p-1 text-gray-400 hover:text-yellow-500 rounded-full focus:outline-none flex-shrink-0"
              aria-label={isFavorited ? '从收藏中移除' : '添加到收藏'}
            >
              <Bookmark
                size={18}
                className={`transition-colors ${isFavorited ? 'text-yellow-500' : ''}`}
                fill={isFavorited ? 'currentColor' : 'none'}
              />
            </button>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm truncate">{description}</p>
          <div className="hidden sm:flex flex-wrap gap-1 sm:gap-2 mt-2">
            {tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 sm:py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <button 
        onClick={handleUpvote}
        className={`relative flex flex-col items-center justify-center border rounded-lg p-1 sm:p-2 w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] flex-shrink-0 ml-2 sm:ml-4 transition-colors ${isUpvoted ? 'border-[#cda14c] cursor-not-allowed' : `hover:bg-gray-50 ${isHovered ? 'border-[#cda14c]' : ''}`}`}
        disabled={isUpvoted}
      >
        {showPlusOne && (
          <span className="absolute text-[#cda14c] font-semibold animate-plus-one pointer-events-none z-10">
            +1s
          </span>
        )}
        <Triangle
          size={14}
          className={`transition-colors ${isUpvoted ? 'text-[#cda14c]' : 'text-gray-500'}`}
          fill={isUpvoted ? '#cda14c' : 'none'}
          strokeWidth={1.5}
        />
        <span className={`text-xs sm:text-sm font-semibold mt-1 ${isUpvoted ? 'text-[#cda14c]' : 'text-gray-800'}`}>{currentUpvotes}</span>
      </button>
    </div>
  );
};

export default AiToolCard;
