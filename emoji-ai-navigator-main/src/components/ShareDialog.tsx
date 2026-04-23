import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, MessageCircle, Share2 } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
  isDarkMode?: boolean;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ open, onOpenChange, url, title, description, isDarkMode }) => {
  const [copied, setCopied] = useState(false);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const isInWeChat = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-w-[92vw] rounded-2xl"
        style={{
          backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#000000',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg flex items-center gap-2">
            <Share2 className="w-4 h-4" /> 分享到朋友圈 / 微信好友
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 二维码区 */}
          <div
            className="flex flex-col items-center gap-3 py-4 rounded-xl"
            style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F9F9F9' }}
          >
            <img
              src={qrCodeUrl}
              alt="分享二维码"
              className="w-44 h-44 md:w-52 md:h-52 rounded-lg bg-white p-2"
            />
            <p className="text-xs md:text-sm text-center px-4" style={{ color: isDarkMode ? '#8C8C8C' : '#606060' }}>
              微信"扫一扫"，即可分享到朋友圈
            </p>
          </div>

          {/* 微信内分享提示 */}
          {isInWeChat && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl text-xs md:text-sm"
              style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F9FF', color: isDarkMode ? '#8C8C8C' : '#0369A1' }}
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>请点击右上角"⋯"，选择"分享到朋友圈"或"发送给朋友"</span>
            </div>
          )}

          {/* 链接复制 */}
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={url}
              className="flex-1 min-w-0 text-xs md:text-sm px-3 py-2 rounded-lg outline-none"
              style={{
                backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F0F0',
                color: isDarkMode ? '#FFFFFF' : '#000000',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              }}
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0 h-9 rounded-lg text-white"
              style={{ backgroundColor: '#00a7f4' }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-1 text-xs md:text-sm">{copied ? '已复制' : '复制链接'}</span>
            </Button>
          </div>

          {/* 系统分享（移动端） */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button
              variant="outline"
              className="w-full rounded-full h-10"
              onClick={handleNativeShare}
              style={{
                borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                color: isDarkMode ? '#FFFFFF' : '#000000',
              }}
            >
              <Share2 className="w-4 h-4 mr-2" /> 调用系统分享
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
