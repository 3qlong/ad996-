import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { allTools } from '@/data/tools';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Triangle, ExternalLink, Heart, Share2 } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import NotFound from './NotFound';
import { triggerEmojiRainFromEvent } from '@/utils/emojiRain';
import RecommendedToolsCard from '@/components/RecommendedToolsCard';
import ShareDialog from '@/components/ShareDialog';
import { generateSmartTags } from '@/utils/smartTags';

const COLORS = {
  light: {
    background: '#F9F9F9',
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.08)',
    text: '#000000',
    textSecondary: '#606060',
    tagBg: '#F0F0F0',
    tabActiveBg: '#EFEFEF',
    tabContentBg: '#FFFFFF',
  },
  dark: {
    background: '#1E1E1E',
    card: '#2C2C2C',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#FFFFFF',
    textSecondary: '#8C8C8C',
    tagBg: '#3A3A3A',
    tabActiveBg: '#3D3D3D',
    tabContentBg: '#2C2C2C',
  },
};

// 根据工具描述自动生成3个标签（每个≤6字）
function generateToolTags(tool: { name: string; description: string; category: string; longDescription: string }): string[] {
  const desc = (tool.description + tool.longDescription).toLowerCase();
  const category = tool.category;

  const categoryTags: Record<string, string[]> = {
    'AI写作': ['智能写作', '文案生成', '内容创作', 'AI续写', '文本润色', '论文辅助'],
    'AI图像': ['图片生成', '图像编辑', 'AI绘画', '智能修图', '风格转换', '图像增强'],
    'AI视频': ['视频生成', '视频编辑', 'AI剪辑', '特效制作', '字幕生成', '动画创作'],
    'AI办公': ['办公提效', '文档处理', '智能助手', '会议记录', 'PPT生成', '数据分析'],
    'AI聊天': ['智能对话', 'AI问答', '多轮对话', '知识问答', '角色扮演', '语言理解'],
    'AI编程': ['代码生成', '编程辅助', '代码补全', 'Bug修复', '智能编码', '代码审查'],
    'AI设计': ['智能设计', 'UI生成', '创意设计', '海报制作', 'Logo设计', '排版布局'],
    'AI音频': ['语音合成', '音频编辑', '语音识别', 'AI配音', '音乐生成', '降噪处理'],
    'AI智能体': ['自动化', '智能代理', '任务执行', '流程编排', '多模态', '知识库'],
    'AI搜索': ['智能搜索', '语义检索', '知识发现', '信息聚合', '精准查找', '内容推荐'],
    'AI学习': ['智能学习', '知识辅导', '练习生成', '学情分析', '个性教学', '自适应'],
    'AI开发': ['开发工具', 'API接口', '模型部署', '数据标注', '模型训练', '低代码'],
  };

  const tags: string[] = [];
  const pool = categoryTags[category] || ['AI工具', '智能处理', '效率提升', '自动化', '数据驱动', '云端服务'];

  // 根据描述关键词匹配最相关的标签
  const keywords: [string, string][] = [
    ['翻译', '智能翻译'], ['PPT', 'PPT生成'], ['演示', '演示制作'],
    ['论文', '论文辅助'], ['小说', '小说创作'], ['文案', '文案生成'],
    ['绘画', 'AI绘画'], ['图片', '图片处理'], ['视频', '视频生成'],
    ['编程', '代码辅助'], ['代码', '代码生成'], ['设计', '智能设计'],
    ['语音', '语音处理'], ['音乐', '音乐生成'], ['对话', '智能对话'],
    ['搜索', '智能搜索'], ['写作', '智能写作'], ['办公', '办公提效'],
    ['邮件', '邮件撰写'], ['会议', '会议助手'], ['数据', '数据分析'],
    ['图像', '图像处理'], ['修图', '智能修图'], ['抠图', '智能抠图'],
    ['配音', 'AI配音'], ['字幕', '字幕生成'], ['营销', '营销助手'],
    ['SEO', 'SEO优化'], ['客服', '智能客服'], ['教育', '智能教育'],
    ['免费', '免费使用'], ['模板', '模板丰富'], ['协作', '团队协作'],
  ];

  for (const [kw, tag] of keywords) {
    if (desc.includes(kw.toLowerCase()) && !tags.includes(tag) && tags.length < 3) {
      tags.push(tag);
    }
  }

  // 用分类默认标签补齐到3个
  for (const t of pool) {
    if (tags.length >= 3) break;
    if (!tags.includes(t)) tags.push(t);
  }

  return tags.slice(0, 3);
}

// 卡片图标集
const CARD_ICONS = ['💡', '🚀', '📝', '🔧', '📊', '🎯', '⚡', '🔍', '📋', '🛠️'];

// 将纯文本内容解析为分类卡片
function ContentCards({ content, colors: c, toolUrl, toolName }: { content: string; colors: typeof COLORS.light; toolUrl?: string; toolName?: string }) {
  const sections = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n').filter(l => l.trim());
    const result: { title: string; body: string; icon: string }[] = [];
    let introLines: string[] = [];
    let tipLines: string[] = [];
    let inTips = false;

    for (const line of lines) {
      const trimmed = line.trim();
      // Numbered item: "1. Title：Description" or "1. Title: Description"
      const numMatch = trimmed.match(/^(\d+)\.\s*(.+?)[:：]\s*(.+)$/);
      if (numMatch) {
        const idx = parseInt(numMatch[1]) - 1;
        result.push({
          title: numMatch[2],
          body: numMatch[3],
          icon: CARD_ICONS[idx % CARD_ICONS.length],
        });
        inTips = false;
        continue;
      }
      // Tips header
      if (trimmed.includes('小贴士') || trimmed.includes('使用建议')) {
        inTips = true;
        continue;
      }
      // Bullet tip
      if ((trimmed.startsWith('•') || trimmed.startsWith('·') || trimmed.startsWith('-')) && inTips) {
        tipLines.push(trimmed.replace(/^[•·\-]\s*/, ''));
        continue;
      }
      // Skip title-like lines (first line or very short)
      if (result.length === 0 && !inTips && trimmed.length < 30) continue;
      // Intro paragraph
      if (result.length === 0 && !inTips) {
        introLines.push(trimmed);
      }
    }

    const cards: { title: string; body: string; icon: string }[] = [];
    if (introLines.length > 0) {
      cards.push({ title: '概述', body: introLines.join(''), icon: '📖' });
    }
    cards.push(...result);
    if (tipLines.length > 0) {
      cards.push({ title: '使用小贴士', body: tipLines.join('\n'), icon: '✨' });
    }
    return cards;
  }, [content]);

  if (sections.length === 0) {
    return (
      <div
        className="p-4 md:p-6 rounded-xl"
        style={{ backgroundColor: c.tabContentBg, border: `1px solid ${c.border}`, color: c.textSecondary }}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
      {sections.map((section, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 md:p-6 flex flex-col gap-3 transition-shadow hover:shadow-md"
          style={{ backgroundColor: c.tabContentBg, border: `1px solid ${c.border}` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{section.icon}</span>
            <h4 className="font-bold text-base" style={{ color: c.text }}>{section.title}</h4>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: c.textSecondary }}>
            {(() => {
              let text = section.body;
              // 匹配URL和工具名，转为可点击链接
              const urlRegex = /(https?:\/\/[^\s，。、）\)]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s，。、）\)]*)?)/g;
              const parts: (string | React.ReactElement)[] = [];
              let lastIndex = 0;
              let match;
              while ((match = urlRegex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                  parts.push(text.slice(lastIndex, match.index));
                }
                const url = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
                parts.push(
                  <a key={match.index} href={url} target="_blank" rel="noopener noreferrer"
                    className="underline hover:opacity-80" style={{ color: '#00a7f4' }}>{match[0]}</a>
                );
                lastIndex = match.index + match[0].length;
              }
              if (lastIndex < text.length) parts.push(text.slice(lastIndex));
              return parts.length > 0 ? parts : text;
            })()}
          </p>
        </div>
      ))}
    </div>
  );
}

const ToolDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const tool = allTools.find(t => t.id === Number(id));
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const c = isDarkMode ? COLORS.dark : COLORS.light;
  const { isAuthenticated, openLoginDialog } = useAuth();

  const [activeTab, setActiveTab] = useState('usageTips');
  const [currentUpvotes, setCurrentUpvotes] = useState(tool?.upvotes || 0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // 动态更新页面标题与分享 meta（朋友圈 / 微信预览用）
  useEffect(() => {
    if (!tool) return;
    const prevTitle = document.title;
    const shareTitle = `${tool.name} · ${tool.description} | adqqb AI全家桶`;
    const shareDesc = tool.longDescription || tool.description;
    const shareImage = tool.logo || '/logo-adqqb.png';

    document.title = shareTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const [k, v] = selector.replace(/[\[\]"]/g, '').split('=');
        el.setAttribute(k, v);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[property="og:title"]', 'content', shareTitle);
    setMeta('meta[property="og:description"]', 'content', shareDesc);
    setMeta('meta[property="og:image"]', 'content', shareImage);
    setMeta('meta[property="og:url"]', 'content', window.location.href);
    setMeta('meta[itemprop="name"]', 'content', shareTitle);
    setMeta('meta[itemprop="description"]', 'content', shareDesc);
    setMeta('meta[itemprop="image"]', 'content', shareImage);
    setMeta('meta[name="description"]', 'content', shareDesc);
    setMeta('meta[name="twitter:title"]', 'content', shareTitle);
    setMeta('meta[name="twitter:description"]', 'content', shareDesc);
    setMeta('meta[name="twitter:image"]', 'content', shareImage);

    return () => {
      document.title = prevTitle;
    };
  }, [tool]);

  // Sync favorite state from localStorage
  useEffect(() => {
    if (isAuthenticated && tool) {
      const stored = localStorage.getItem('favoritedTools');
      if (stored) {
        const ids: number[] = JSON.parse(stored);
        setIsFavorited(ids.includes(tool.id));
      }
    } else {
      setIsFavorited(false);
    }
  }, [isAuthenticated, tool]);

  const handleFavorite = () => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }
    if (!tool) return;
    const stored = localStorage.getItem('favoritedTools');
    const ids: number[] = stored ? JSON.parse(stored) : [];
    let next: number[];
    if (ids.includes(tool.id)) {
      next = ids.filter(id => id !== tool.id);
      setIsFavorited(false);
    } else {
      next = [...ids, tool.id];
      setIsFavorited(true);
    }
    localStorage.setItem('favoritedTools', JSON.stringify(next));
  };
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);

  useEffect(() => {
    if (tool) {
      setCurrentUpvotes(tool.upvotes);
      setIsUpvoted(false);
      setShowPlusOne(false);
    }
  }, [tool]);

  useEffect(() => {
    if (showPlusOne) {
      const timer = setTimeout(() => {
        setShowPlusOne(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showPlusOne]);

  const handleUpvote = (e: React.MouseEvent) => {
    if (!isUpvoted) {
      setCurrentUpvotes(currentUpvotes + 1);
      setIsUpvoted(true);
      setShowPlusOne(true);
      triggerEmojiRainFromEvent(e);
    }
  };

  if (!tool) {
    return <NotFound />;
  }

  const navigate = useNavigate();

  // Related tools: same category, excluding current tool
  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return allTools
      .filter(t => t.category === tool.category && t.id !== tool.id)
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 8);
  }, [tool]);

  const sortedTools = [...allTools].sort((a, b) => b.upvotes - a.upvotes);
  const currentIndex = sortedTools.findIndex(t => t.id === tool.id);
  const prevTool = currentIndex > 0 ? sortedTools[currentIndex - 1] : null;
  const nextTool = currentIndex < sortedTools.length - 1 ? sortedTools[currentIndex + 1] : null;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: c.background, color: c.text }}
    >
      <main className="container mx-auto pb-12 px-3 md:px-4 pt-4 md:pt-[45px]">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* 工具头部 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 text-center sm:text-left">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-4xl md:text-5xl flex-shrink-0"
                style={{ backgroundColor: c.tagBg }}
              >
                {tool.logo ? (
                  <img src={tool.logo} alt={tool.name} className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg" />
                ) : (
                  tool.emoji
                )}
              </div>
              <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
                <h1 className="text-xl md:text-4xl font-bold break-words" style={{ color: c.text }}>{tool.name}</h1>
                <p className="text-sm md:text-lg break-words" style={{ color: c.textSecondary }}>{tool.description}</p>
              </div>
            </div>

            {/* 操作按钮组（移动端 + 桌面端） */}
            <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
              {tool.url && (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#00a7f4', color: '#FFFFFF' }}
                >
                  🔗 访问网站
                </a>
              )}
              <button
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: c.tagBg, color: c.text, border: `1px solid ${c.border}` }}
              >
                <Share2 className="w-3.5 h-3.5" /> 分享朋友圈
              </button>
            </div>

            {/* 详细描述 */}
            <div className="text-base leading-relaxed" style={{ color: c.textSecondary }}>
              <p>{tool.longDescription}</p>
            </div>

            {/* 标签页 */}
            <Tabs defaultValue="usageTips" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-transparent p-0 h-auto gap-2">
                {[
                  { value: 'usageTips', label: '使用技巧' },
                  { value: 'productIntro', label: '网站介绍' },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-sm font-medium rounded-full px-4 py-2 bg-transparent border transition-colors"
                    style={{
                      color: activeTab === tab.value ? '#00a7f4' : c.textSecondary,
                      borderColor: activeTab === tab.value ? '#00a7f4' : 'transparent',
                      backgroundColor: 'transparent',
                    }}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {[
                { value: 'usageTips', content: tool.details.usageTips },
                { value: 'productIntro', content: tool.details.productIntro },
              ].map(tab => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="mt-4"
                >
                  <ContentCards content={tab.content} colors={c} toolUrl={tool.url} toolName={tool.name} />
                </TabsContent>
              ))}
            </Tabs>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 items-center">
              {generateSmartTags(tool).map(tag => (
                <span
                  key={tag}
                  onClick={() => navigate(`/?q=${encodeURIComponent(tag)}`)}
                  className="text-sm px-3 py-1.5 rounded-full cursor-pointer transition-all hover:opacity-80"
                  style={{
                    backgroundColor: c.tagBg,
                    color: '#00a7f4',
                    border: `1px solid ${c.border}`,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 相关工具推荐 */}
            {relatedTools.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: c.text }}>
                  相关{tool.category}推荐
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedTools.map(rt => (
                    <div
                      key={rt.id}
                      onClick={() => navigate(`/tool/${rt.id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:shadow-md"
                      style={{
                        backgroundColor: c.card,
                        border: `1px solid ${c.border}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: c.tagBg }}
                      >
                        {rt.logo ? (
                          <img src={rt.logo} alt={rt.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-xl">{rt.emoji}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate" style={{ color: c.text }}>{rt.name}</div>
                        <div className="text-xs truncate" style={{ color: c.textSecondary }}>{rt.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧操作栏（移动端在内容下方，桌面端固定右侧） */}
          <div className="lg:col-span-1 lg:sticky lg:top-28 order-last">
            <div
              className="rounded-2xl p-4 md:p-5 space-y-3 md:space-y-4"
              style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold" style={{ color: c.text }}>#{currentIndex + 1}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    style={{ borderColor: c.border, backgroundColor: 'transparent', color: c.text }}
                    disabled={!prevTool}
                    asChild
                  >
                    <Link to={prevTool ? `/tool/${prevTool.id}` : '#'}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    style={{ borderColor: c.border, backgroundColor: 'transparent', color: c.text }}
                    disabled={!nextTool}
                    asChild
                  >
                    <Link to={nextTool ? `/tool/${nextTool.id}` : '#'}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <p className="text-sm" style={{ color: c.textSecondary }}>今日排名</p>

              <Button
                className="w-full text-white text-base py-6 font-semibold relative rounded-full"
                style={{ backgroundColor: '#00a7f4' }}
                onClick={handleUpvote}
                disabled={isUpvoted}
              >
                {showPlusOne && (
                  <span className="absolute inset-0 flex items-center justify-center text-white font-semibold animate-plus-one pointer-events-none">
                    +1
                  </span>
                )}
                <Triangle className="mr-2 -ml-1 h-4 w-4" fill="white" strokeWidth={0} />
                投票支持・{currentUpvotes} 票
              </Button>

              <Button
                variant="outline"
                className="w-full text-base py-6 font-semibold rounded-full"
                style={{
                  borderColor: isFavorited ? '#ffe412' : c.border,
                  backgroundColor: 'transparent',
                  color: isFavorited ? '#ffe412' : c.text,
                  borderWidth: '2px',
                }}
                onClick={handleFavorite}
              >
                <Heart
                  className="mr-2 -ml-1 h-4 w-4"
                  fill={isFavorited ? '#ffe412' : 'none'}
                  stroke={isFavorited ? '#ffe412' : 'currentColor'}
                />
                {isFavorited ? '已收藏' : '收藏网站'}
              </Button>

              <Button
                variant="outline"
                className="w-full text-base py-6 font-semibold rounded-full"
                style={{
                  borderColor: c.border,
                  backgroundColor: 'transparent',
                  color: c.text,
                  borderWidth: '2px',
                }}
                onClick={() => window.open(tool.url, '_blank')}
              >
                <ExternalLink className="mr-2 -ml-1 h-4 w-4" />
                访问网站
              </Button>
            </div>

            {/* 推荐工具 - 投票模块下方 */}
            <div className="mt-4">
              <RecommendedToolsCard isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      </main>

      {/* 分享对话框（朋友圈/微信好友） */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={`${tool.name} · ${tool.description}`}
        description={tool.longDescription || tool.description}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ToolDetailPage;
