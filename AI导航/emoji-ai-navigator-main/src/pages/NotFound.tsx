import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Home } from "lucide-react";

const COLORS = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#606060',
    border: 'rgba(0, 0, 0, 0.1)',
    card: '#F9F9F9',
  },
  dark: {
    background: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#8C8C8C',
    border: 'rgba(255, 255, 255, 0.1)',
    card: '#2C2C2C',
  },
};

const NotFound = () => {
  const location = useLocation();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const currentColors = isDarkMode ? COLORS.dark : COLORS.light;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: currentColors.background }}
    >
      <div className="text-center px-6">
        {/* 大号数字 */}
        <div
          className="text-[120px] font-bold leading-none mb-4 select-none"
          style={{ color: '#00a7f4', opacity: 0.15 }}
        >
          404
        </div>

        {/* 图标 */}
        <div className="text-6xl mb-6">🔍</div>

        {/* 标题 */}
        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: currentColors.text }}
        >
          页面不存在
        </h1>

        {/* 描述 */}
        <p
          className="text-sm mb-8 max-w-sm mx-auto leading-relaxed"
          style={{ color: currentColors.textSecondary }}
        >
          你访问的页面 <code
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              backgroundColor: isDarkMode ? '#3A3A3A' : '#F0F0F0',
              color: currentColors.text,
            }}
          >{location.pathname}</code> 不存在或已被移除。
        </p>

        {/* 返回按钮 */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: '#00a7f4',
            color: '#FFFFFF',
          }}
        >
          <Home className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
