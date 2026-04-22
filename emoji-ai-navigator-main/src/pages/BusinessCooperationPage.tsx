import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import RecommendedToolsCard from '@/components/RecommendedToolsCard';

const COLORS = {
  light: {
    background: '#F9F9F9',
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.08)',
    text: '#000000',
    textSecondary: '#606060',
    textTertiary: '#999999',
    stepBg: '#E9F9EE',
    stepText: '#16A34A',
    stepBgBlue: '#EFF6FF',
    stepTextBlue: '#2563EB',
    link: '#00a7f4',
  },
  dark: {
    background: '#1E1E1E',
    card: '#2C2C2C',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#FFFFFF',
    textSecondary: '#8C8C8C',
    textTertiary: '#666666',
    stepBg: '#1A2E22',
    stepText: '#4ADE80',
    stepBgBlue: '#1E2A3A',
    stepTextBlue: '#60A5FA',
    link: '#00a7f4',
  },
};

const BusinessCooperationPage: React.FC = () => {
  const navigate = useNavigate();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const c = isDarkMode ? COLORS.dark : COLORS.light;

  const cooperationModes = [
    { title: '广告合作', desc: '在我们的网站上展示您的广告，获取更多曝光和流量。' },
    { title: '内容合作', desc: '合作创作优质内容，扩大品牌影响力。' },
    { title: 'API 合作', desc: '通过 API 接口共享数据或功能，实现互利共赢。' },
    { title: '其他合作', desc: '如有其他合作想法，欢迎联系我们共同探讨。' },
  ];

  const cooperationProcess = [
    { title: '提交需求', desc: '通过邮箱或电话联系我们，说明您的合作需求。' },
    { title: '评估讨论', desc: '我们将对您的需求进行评估，并与您讨论合作细节。' },
    { title: '签订协议', desc: '双方达成一致后，签订合作协议。' },
    { title: '执行合作', desc: '按照协议内容执行合作，并定期进行效果评估和优化。' },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: c.background }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8" style={{ paddingTop: '20px' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: c.text }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: c.text }}>
            商务合作
          </h1>
        </div>

        {/* Two-column layout: main + recommended tools */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
        <div
          className="rounded-2xl p-6 md:p-8 transition-colors duration-300"
          style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}
        >

          {/* 合作模式 */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: c.text }}>合作模式</h2>
            <div className="space-y-3">
              {cooperationModes.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: c.stepBgBlue, color: c.stepTextBlue }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-medium mb-0.5" style={{ color: c.text }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: c.textSecondary }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 联系我们 */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: c.text }}>联系我们</h2>
            <div
              className="rounded-xl p-4 space-y-2.5"
              style={{ backgroundColor: isDarkMode ? '#3A3A3A' : '#F9F9F9', border: `1px solid ${c.border}` }}
            >
              {[
                { label: '邮箱', value: 'business@example.com', href: 'mailto:business@example.com' },
                { label: '电话', value: '+86 123 4567 8901', href: 'tel:+8612345678901' },
                { label: '微信', value: 'business_cooperation', href: null },
              ].map(({ label, value, href }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="w-10 flex-shrink-0 font-medium" style={{ color: c.textTertiary }}>{label}</span>
                  {href ? (
                    <a href={href} className="hover:opacity-80 transition-opacity" style={{ color: c.link }}>{value}</a>
                  ) : (
                    <span style={{ color: c.text }}>{value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 合作流程 */}
          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: c.text }}>合作流程</h2>
            <div className="space-y-3">
              {cooperationProcess.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: c.stepBg, color: c.stepText }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-medium mb-0.5" style={{ color: c.text }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: c.textSecondary }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
          </div>
          {/* Right sidebar: recommended tools - 与商务合作内容顶部齐平 */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-[120px]">
              <RecommendedToolsCard isDarkMode={isDarkMode} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BusinessCooperationPage;
