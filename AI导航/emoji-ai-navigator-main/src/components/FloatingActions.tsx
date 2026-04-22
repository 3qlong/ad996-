import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const FloatingActions: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const [showTop, setShowTop] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // 客服微信号（如需替换，改这里即可）
  const WECHAT_ID = 'adqqb_service';
  // 二维码：扫码后会显示客服微信号文本
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent('微信号：' + WECHAT_ID)}`;

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bg = isDarkMode ? '#2C2C2C' : '#FFFFFF';
  const fg = isDarkMode ? '#FFFFFF' : '#000000';
  const border = isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const shadow = isDarkMode
    ? '0 8px 24px rgba(0,0,0,0.5)'
    : '0 8px 24px rgba(0,0,0,0.12)';

  return (
    <>
      {/* 浮动按钮组 */}
      <div className="fixed right-4 md:right-6 bottom-20 md:bottom-8 z-40 flex flex-col gap-3">
        {/* 客服按钮 */}
        <div className="relative group">
          <button
            onClick={() => setShowQR(true)}
            aria-label="联系客服"
            className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: bg,
              color: '#00a7f4',
              border: `1px solid ${border}`,
              boxShadow: shadow,
            }}
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          {/* 桌面端 hover 提示 */}
          <span
            className="hidden md:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              backgroundColor: isDarkMode ? '#1E1E1E' : '#000000',
              color: '#FFFFFF',
            }}
          >
            联系客服
          </span>
        </div>

        {/* 回到顶部按钮 */}
        {showTop && (
          <div className="relative group">
            <button
              onClick={scrollToTop}
              aria-label="回到顶部"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                backgroundColor: bg,
                color: '#00a7f4',
                border: `1px solid ${border}`,
                boxShadow: shadow,
              }}
            >
              <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <span
              className="hidden md:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                backgroundColor: isDarkMode ? '#1E1E1E' : '#000000',
                color: '#FFFFFF',
              }}
            >
              回到顶部
            </span>
          </div>
        )}
      </div>

      {/* 客服微信二维码弹窗 */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowQR(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs rounded-2xl p-6 flex flex-col items-center gap-4"
            style={{
              backgroundColor: bg,
              color: fg,
              border: `1px solid ${border}`,
              boxShadow: shadow,
            }}
          >
            <button
              onClick={() => setShowQR(false)}
              aria-label="关闭"
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
              style={{ color: fg }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-base font-semibold">
              <MessageCircle className="w-4 h-4" style={{ color: '#00a7f4' }} />
              <span>联系客服</span>
            </div>

            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F9F9F9' }}
            >
              <img
                src={qrUrl}
                alt="客服微信二维码"
                className="w-48 h-48 rounded-lg bg-white p-2"
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm" style={{ color: isDarkMode ? '#8C8C8C' : '#606060' }}>
                微信"扫一扫"添加客服
              </p>
              <p className="text-xs" style={{ color: isDarkMode ? '#8C8C8C' : '#999999' }}>
                微信号：<span className="font-mono" style={{ color: fg }}>{WECHAT_ID}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingActions;
