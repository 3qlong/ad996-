import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MarketingCalendarPage from "./pages/MarketingCalendarPage";
import ToolDetailPage from "./pages/ToolDetailPage";
import WebsiteSubmissionPage from "./pages/WebsiteSubmissionPage";
import BusinessCooperationPage from "./pages/BusinessCooperationPage";
import { AuthProvider } from "./contexts/AuthContext";
import HotRankingPage from "./pages/HotRankingPage";
import MarketingNewsPage from "./pages/MarketingNewsPage";
import HotIndexPage from "./pages/HotIndexPage";
import AdminPage from "./pages/AdminPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminToolsPage from "./pages/AdminToolsPage";
import AdminToolEditPage from "./pages/AdminToolEditPage";
import AdminSubmissionsPage from "./pages/AdminSubmissionsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminRecommendedPage from "./pages/AdminRecommendedPage";
import AdminNavSitesPage from "./pages/AdminNavSitesPage";
import AdminCalendarPage from "./pages/AdminCalendarPage";
import AdminStatisticsPage from "./pages/AdminStatisticsPage";
import AdminPagesPage from "./pages/AdminPagesPage";
import AdminSiteSettingsPage from "./pages/AdminSiteSettingsPage";
import AdminLayout from "./components/admin/AdminLayout";
import AboutPage from "./pages/AboutPage";
import Header from "./components/Header";
import FloatingActions from "./components/FloatingActions";
import { ThemeProvider, useTheme } from "./hooks/use-theme";

const queryClient = new QueryClient();

// 内层组件，可以安全使用 useTheme()（在 ThemeProvider 内部）
const AppInner = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  return (
    <div
      className="min-h-screen pt-[145px] md:pt-[112px] transition-colors duration-300"
      style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F9FAFB' }}
    >
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tool/:id" element={<ToolDetailPage />} />
        <Route path="/hot-ranking" element={<HotRankingPage />} />
        <Route path="/marketing-news" element={<MarketingNewsPage />} />
        <Route path="/hot-index" element={<HotIndexPage />} />
        <Route path="/marketing-calendar" element={<MarketingCalendarPage />} />
        <Route path="/website-submission" element={<WebsiteSubmissionPage />} />
        <Route path="/business-cooperation" element={<BusinessCooperationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="tools" element={<AdminToolsPage />} />
          <Route path="tools/:id/edit" element={<AdminToolEditPage />} />
          <Route path="recommended" element={<AdminRecommendedPage />} />
          <Route path="nav-sites" element={<AdminNavSitesPage />} />
          <Route path="calendar" element={<AdminCalendarPage />} />
          <Route path="statistics" element={<AdminStatisticsPage />} />
          <Route path="pages" element={<AdminPagesPage />} />
          <Route path="submissions" element={<AdminSubmissionsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="site-settings" element={<AdminSiteSettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingActions />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppInner />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
