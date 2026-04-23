import React, { useState, useEffect } from 'react';
import { Menu, X, Search, XCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { triggerEmojiRainFromEvent } from '@/utils/emojiRain';
import { loadSearchTabs, SEARCH_TABS_EVENT, SearchTab } from '@/lib/searchTabs';

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

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [externalSearchTerm, setExternalSearchTerm] = useState('');
  const [searchTabs, setSearchTabs] = useState<SearchTab[]>(() => loadSearchTabs());
  const [selectedEngine, setSelectedEngine] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState('站内搜索');

  // 订阅后台对搜索标签的修改
  useEffect(() => {
    const sync = () => setSearchTabs(loadSearchTabs());
    window.addEventListener(SEARCH_TABS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SEARCH_TABS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // 仅展示 visible 标签；internal 始终保证在首位
  const visibleTabs = React.useMemo(() => {
    const list = searchTabs.filter(t => t.visible);
    const internal = list.find(t => t.internal);
    const others = list.filter(t => !t.internal);
    return internal ? [internal, ...others] : list;
  }, [searchTabs]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showLogoTooltip, setShowLogoTooltip] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [customLogo, setCustomLogo] = useState<string>(() => localStorage.getItem('site.logoUrl') || '');

  useEffect(() => {
    const sync = () => setCustomLogo(localStorage.getItem('site.logoUrl') || '');
    window.addEventListener('site-logo-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('site-logo-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const { themeMode, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const { isAuthenticated, openLoginDialog, logout } = useAuth();
  const [searchParams] = useSearchParams();

  // 同步 URL 中的 q 参数到搜索框
  useEffect(() => {
    const q = searchParams.get('q')?.trim();
    if (q) {
      setExternalSearchTerm(q);
      setSelectedTag('站内搜索');
    }
  }, [searchParams]);

  const navLinks = [
    { name: 'AI榜单', href: '/hot-ranking' },
    { name: '海外创意', href: 'http://www.ad996.com' },
    { name: '出海日历', href: '/marketing-calendar?view=week' },
    { name: '商务合作', href: '/business-cooperation' },
    { name: '关于我们', href: '/about' },
  ];



  // 监听滚动，控制顶栏显示/隐藏
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 向下滚动超过100px时隐藏顶栏
      if (currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleAuthClick = () => {
    if (!isAuthenticated) {
      openLoginDialog();
    } else {
      logout();
    }
  };

  const authText = isAuthenticated ? '用户中心' : '注册/登录';

  // 处理搜索标签点击事件
  const handleTagClick = (tag: SearchTab) => {
    setSelectedTag(tag.name);

    if (tag.internal) {
      // 站内搜索：跳转首页并附加 q 参数
      const q = externalSearchTerm.trim();
      navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
      return;
    }

    if (!tag.url) return;
    setSelectedEngine(tag.url);

    // 有关键词时直接跳转搜索
    if (externalSearchTerm.trim()) {
      window.open(tag.url + encodeURIComponent(externalSearchTerm.trim()), '_blank');
    }
  };

  // 搜索按钮处理：站内搜索时也走 navigate
  const handleSearch = () => {
    const q = externalSearchTerm.trim();
    if (!q) return;
    if (selectedTag === '站内搜索') {
      navigate(`/?q=${encodeURIComponent(q)}`);
      return;
    }
    window.open(selectedEngine + encodeURIComponent(q), '_blank');
  };

  const currentColors = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <>
      {/* 顶部导航条 - 滚动时隐藏 */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        style={{ 
          backgroundColor: currentColors.background,
          borderColor: currentColors.border
        }}
      >
        <div
          className="relative flex flex-wrap md:flex-nowrap items-start justify-between h-auto md:h-[112px] px-4 lg:px-6 pt-[12px] md:pt-[20px] pb-[8px] md:pb-0 transition-colors duration-300"
          style={{ backgroundColor: currentColors.background }}
        >
          {/* 左侧：Logo - 移动端居中占满一行 */}
          <div
            className="relative flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start order-first mb-2 md:mb-0"
            onMouseEnter={() => setShowLogoTooltip(true)}
            onMouseLeave={() => setShowLogoTooltip(false)}
          >
            <Link
              to="/"
              className="flex items-center gap-2 pt-[6px] md:pt-[11px]"
              onClick={(e) => triggerEmojiRainFromEvent(e)}
            >
              <img
                src={customLogo || "/logo-adqqb.png"}
                alt="adqqb AI全家桶"
                className="h-9 md:h-10 w-auto object-contain"
                style={{ maxWidth: '138px' }}
              />
            </Link>
            {showLogoTooltip && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 px-2 py-1 rounded-md text-[8.5px] whitespace-nowrap shadow-lg border pointer-events-none z-50"
                style={{
                  backgroundColor: isDarkMode ? '#333' : '#fff',
                  color: isDarkMode ? '#fff' : '#333',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                  boxShadow: isDarkMode
                    ? '0 4px 16px rgba(0,0,0,0.4)'
                    : '0 4px 16px rgba(0,0,0,0.1)',
                }}
              >
                ⭐️ Ctrl+D，或是⌘ Cmd+D 收藏我
              </div>
            )}
          </div>

          {/* 中间：搜索框 + 分类标签栏 - 参考Bing图片创建页面风格 */}
          <div className="flex-1 w-full md:w-auto max-w-full md:max-w-4xl mx-auto md:mx-4 lg:mx-8">
            {/* 搜索框 + 移动端汉堡按钮 */}
            <div className="flex items-center gap-2">
            <div
              className="flex-1 min-w-0 flex items-center gap-0 px-3 md:px-4 py-2 rounded-full border transition-all duration-200 hover:shadow-md focus-within:shadow-md"
              style={{
                backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF',
                borderColor: currentColors.border
              }}
            >
              {/* 搜索输入框 */}
              <input
                type="text"
                placeholder="搜索关键词..."
                value={externalSearchTerm}
                onChange={(e) => setExternalSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="flex-1 bg-transparent border-0 outline-none text-sm min-w-0"
                style={{ color: currentColors.text }}
              />
              
              {/* 清除按钮：有内容时显示 */}
              {externalSearchTerm && (
                <button
                  onClick={() => {
                    setExternalSearchTerm('');
                    if (selectedTag === '站内搜索') navigate('/');
                  }}
                  className="p-1 rounded-full transition-opacity ml-1 opacity-50 hover:opacity-100"
                  style={{ backgroundColor: 'transparent', cursor: 'pointer' }}
                  aria-label="清除"
                >
                  <XCircle className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
                </button>
              )}

              {/* 右侧搜索按钮 */}
              <button
                onClick={handleSearch}
                className="p-1 rounded-full transition-colors ml-1"
                style={{
                  cursor: 'pointer',
                  backgroundColor: 'transparent'
                }}
                aria-label="搜索"
              >
                <Search className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
              </button>
            </div>
              {/* 移动端汉堡按钮 - 与搜索框并排居中 */}
              <button
                className="md:hidden flex-shrink-0 p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ color: currentColors.text }}
                aria-label="菜单"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* 分类标签栏 */}
            <div className="flex items-center gap-2 mt-3 md:mt-2 overflow-x-auto flex-nowrap md:flex-wrap scrollbar-hide">
              {visibleTabs.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 select-none border flex-shrink-0"
                  style={{
                    backgroundColor: 'transparent',
                    color: selectedTag === tag.name ? '#00a7f4' : currentColors.text,
                    borderColor: selectedTag === tag.name ? '#00a7f4' : 'transparent',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                >
                  <span className="flex-shrink-0">{tag.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：导航链接 */}
          <nav className="hidden md:flex items-center gap-8 flex-shrink-0 pt-[6px] md:pt-[11px]" style={{ fontSize: '1.05em' }}>
            {navLinks.map((link) => {
              const linkEl = link.href.startsWith('/') ? (
                <Link key={link.name} to={link.href} className="transition-colors duration-200 hover:opacity-80 whitespace-nowrap" style={{ color: currentColors.textSecondary }}>{link.name}</Link>
              ) : (
                <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:opacity-80 whitespace-nowrap" style={{ color: currentColors.textSecondary }}>{link.name}</a>
              );
              return linkEl;
            })}
          </nav>
          {/* Mobile menu dropdown */}
          {isMenuOpen && (
            <div
              className="md:hidden absolute top-full left-0 right-0 border-b shadow-lg z-50"
              style={{ backgroundColor: currentColors.background, borderColor: currentColors.border }}
            >
              <nav className="flex flex-col p-4 gap-3">
                {navLinks.map(link => {
                  if (link.href.startsWith('/')) {
                    return (
                      <Link key={link.name} to={link.href} onClick={() => setIsMenuOpen(false)} className="py-2 text-base" style={{ color: currentColors.textSecondary }}>{link.name}</Link>
                    )
                  }
                  return (
                    <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="py-2 text-base" style={{ color: currentColors.textSecondary }}>{link.name}</a>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* 浮动搜索框 - 滚动时显示 */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isHeaderVisible ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100 pointer-events-auto translate-y-0'
        }`}
      >
        <div
          className="flex items-center gap-0 px-4 py-2 rounded-full border shadow-lg transition-all duration-200 backdrop-blur-md w-[calc(100vw-2rem)] max-w-[40rem]"
          style={{
            backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF',
            borderColor: currentColors.border,
            boxShadow: isDarkMode
              ? '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)'
          }}
        >
          {/* 搜索输入框 */}
          <input
            type="text"
            placeholder="搜索关键词..."
            value={externalSearchTerm}
            onChange={(e) => setExternalSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="flex-1 bg-transparent border-0 outline-none text-sm min-w-0"
            style={{ 
              color: currentColors.text
            }}
          />
          
          {/* 清除按钮 */}
          {externalSearchTerm && (
            <button
              onClick={() => { setExternalSearchTerm(''); if (selectedTag === '站内搜索') navigate('/'); }}
              className="p-1 rounded-full transition-colors"
              style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
              aria-label="清除搜索"
            >
              <X className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
            </button>
          )}
          {/* 右侧搜索按钮 */}
          <button
            onClick={handleSearch}
            className="p-1 rounded-full transition-colors ml-1"
            style={{
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
            aria-label="搜索"
          >
            <Search className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
