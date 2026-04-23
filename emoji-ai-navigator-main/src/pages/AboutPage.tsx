import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { ArrowLeft, ChevronDown, ChevronUp, Upload, Send } from 'lucide-react';

const COLORS = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F9F9F9',
    border: 'rgba(0, 0, 0, 0.1)',
    text: '#000000',
    textSecondary: '#606060',
    textTertiary: '#999999',
    cardBg: '#FFFFFF',
  },
  dark: {
    background: '#1E1E1E',
    backgroundSecondary: '#2C2C2C',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',
    cardBg: '#2C2C2C',
  },
};

const CATEGORIES = [
  'AI办公', 'AI写作', 'AI图像', 'AI视频', 'AI编程',
  'AI设计', 'AI音频', 'AI搜索', 'AI学习', 'AI智能体',
  '热榜指数', '营销新闻',
];

export default function AboutPage() {
  const navigate = useNavigate();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const c = isDarkMode ? COLORS.dark : COLORS.light;

  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    siteName: '',
    domain: '',
    description: '',
    category: '',
    tags: '',
    tips: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: c.backgroundSecondary }}
    >
      <div className="max-w-3xl mx-auto px-4 py-8" style={{ paddingTop: '20px' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: c.text }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: c.text }}>
            关于我们
          </h1>
        </div>

        {/* About Section */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ backgroundColor: c.cardBg, border: `1px solid ${c.border}` }}
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌐</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: c.text }}>
              www.ad996.com
            </h2>
            <p className="text-lg mb-2" style={{ color: c.textSecondary }}>
              最全面的AI营销内容导航站点
            </p>
          </div>

          <div className="space-y-4 mb-8" style={{ color: c.textSecondary }}>
            <p className="leading-relaxed text-center">
              ad996.com 致力于为出海营销从业者提供一站式AI工具导航服务。我们精选收录了覆盖办公、写作、图像、视频、编程、设计、音频、搜索等多个领域的优质AI工具，帮助营销人员提升工作效率，紧跟AI技术前沿。
            </p>
            <p className="leading-relaxed text-center">
              同时，我们提供出海营销日历、热榜指数、营销资讯等实用功能，助力品牌全球化布局。
            </p>
          </div>

          {/* WeChat QR Code */}
          <div className="flex flex-col items-center py-6 border-t" style={{ borderColor: c.border }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: c.text }}>
              关注公众号
            </h3>
            <div
              className="w-48 h-48 rounded-xl flex items-center justify-center mb-3"
              style={{
                backgroundColor: isDarkMode ? '#3A3A3A' : '#F0F0F0',
                border: `2px dashed ${c.border}`,
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-xs" style={{ color: c.textTertiary }}>公众号二维码</p>
                <p className="text-[10px] mt-1" style={{ color: c.textTertiary }}>（请替换为实际二维码图片）</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: c.textSecondary }}>
              扫码关注，获取最新AI营销资讯
            </p>
          </div>
        </div>

        {/* Website Submission - Collapsible */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: c.cardBg, border: `1px solid ${c.border}` }}
        >
          <button
            onClick={() => setIsSubmissionOpen(!isSubmissionOpen)}
            className="w-full flex items-center justify-between p-6 transition-colors hover:opacity-80"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📥</span>
              <div className="text-left">
                <h3 className="text-lg font-semibold" style={{ color: c.text }}>网站收录</h3>
                <p className="text-sm" style={{ color: c.textSecondary }}>提交您的网站，让更多人发现它的价值</p>
              </div>
            </div>
            {isSubmissionOpen ? (
              <ChevronUp size={20} style={{ color: c.textSecondary }} />
            ) : (
              <ChevronDown size={20} style={{ color: c.textSecondary }} />
            )}
          </button>

          {isSubmissionOpen && (
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5 border-t" style={{ borderColor: c.border }}>
              {/* Logo Upload */}
              <div className="pt-5">
                <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                  Logo 上传
                </label>
                <div className="flex items-center gap-4">
                  <label
                    className="w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:opacity-80 overflow-hidden"
                    style={{
                      backgroundColor: isDarkMode ? '#3A3A3A' : '#F0F0F0',
                      border: `2px dashed ${c.border}`,
                    }}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={24} style={{ color: c.textTertiary }} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs" style={{ color: c.textTertiary }}>
                    建议尺寸 200x200，支持 PNG/JPG
                  </p>
                </div>
              </div>

              {/* Site Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                  站点名称 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.siteName}
                  onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder="请输入站点名称"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? '#3A3A3A' : '#F5F5F5',
                    color: c.text,
                    border: `1px solid ${c.border}`,
                  }}
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                  域名 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.domain}
                  onChange={e => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? '#3A3A3A' : '#F5F5F5',
                    color: c.text,
                    border: `1px solid ${c.border}`,
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                  网站介绍 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简要介绍您的网站功能和特点"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none"
                  style={{
                    backgroundColor: isDarkMode ? '#3A3A3A' : '#F5F5F5',
                    color: c.text,
                    border: `1px solid ${c.border}`,
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                  分类 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        backgroundColor: formData.category === cat ? '#00a7f4' : (isDarkMode ? '#3A3A3A' : '#F0F0F0'),
                        color: formData.category === cat ? '#FFFFFF' : c.textSecondary,
                        border: `1px solid ${formData.category === cat ? '#00a7f4' : c.border}`,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                  标签
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="多个标签用逗号分隔，如：AI写作,文案生成"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? '#3A3A3A' : '#F5F5F5',
                    color: c.text,
                    border: `1px solid ${c.border}`,
                  }}
                />
              </div>

              {/* Usage Tips */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                  使用技巧
                </label>
                <textarea
                  value={formData.tips}
                  onChange={e => setFormData({ ...formData, tips: e.target.value })}
                  placeholder="分享一些使用该工具的技巧或最佳实践"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none"
                  style={{
                    backgroundColor: isDarkMode ? '#3A3A3A' : '#F5F5F5',
                    color: c.text,
                    border: `1px solid ${c.border}`,
                  }}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#00a7f4' }}
                >
                  {isSubmitting ? (
                    '提交中...'
                  ) : submitSuccess ? (
                    '提交成功 ✓'
                  ) : (
                    <>
                      <Send size={16} />
                      提交审核
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
