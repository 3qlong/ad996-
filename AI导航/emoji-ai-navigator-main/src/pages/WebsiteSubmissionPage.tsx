import WebsiteSubmissionForm from "@/components/WebsiteSubmissionForm";
import LatestSubmissions from "@/components/LatestSubmissions";
import { List, Video, PenSquare, Image as ImageIcon, Zap } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const COLORS = {
  light: {
    background: '#F9F9F9',
    text: '#000000',
    textSecondary: '#606060',
    buttonBg: '#FFFFFF',
    buttonBorder: 'rgba(0, 0, 0, 0.1)',
    buttonText: '#374151',
    buttonActiveBg: '#00a7f4',
    buttonActiveBorder: '#00a7f4',
    buttonActiveText: '#FFFFFF',
  },
  dark: {
    background: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#8C8C8C',
    buttonBg: '#2C2C2C',
    buttonBorder: 'rgba(255, 255, 255, 0.1)',
    buttonText: '#D1D5DB',
    buttonActiveBg: '#00a7f4',
    buttonActiveBorder: '#00a7f4',
    buttonActiveText: '#FFFFFF',
  },
};

const WebsiteSubmissionPage = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const c = isDarkMode ? COLORS.dark : COLORS.light;

  const categories = [
    { name: '全部', icon: <List className="h-4 w-4" /> },
    { name: 'AI视频', icon: <Video className="h-4 w-4" /> },
    { name: 'AI写作', icon: <PenSquare className="h-4 w-4" /> },
    { name: 'AI图像', icon: <ImageIcon className="h-4 w-4" /> },
    { name: '效率工具', icon: <Zap className="h-4 w-4" /> },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: c.background }}
    >
      <main className="container mx-auto pb-12 px-4" style={{ paddingTop: '20px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: c.text }}>
                <span role="img" aria-label="inbox">📥</span>
                网站收录
              </h1>
              <p className="text-sm" style={{ color: c.textSecondary }}>提交您的网站，让更多人发现它的价值。</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                  style={{
                    backgroundColor: c.buttonBg,
                    border: `1px solid ${c.buttonBorder}`,
                    color: c.buttonText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#00a7f4';
                    e.currentTarget.style.borderColor = '#00a7f4';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = c.buttonBg;
                    e.currentTarget.style.borderColor = c.buttonBorder;
                    e.currentTarget.style.color = c.buttonText;
                  }}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>

            <WebsiteSubmissionForm />
          </div>
          <div className="lg:col-span-1">
            <LatestSubmissions />
          </div>
        </div>
      </main>
    </div>
  );
};

export default WebsiteSubmissionPage;
