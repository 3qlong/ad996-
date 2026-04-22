
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
import { AuthProvider } from "./contexts/AuthContext";
import AdminPage from "./pages/AdminPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminToolsPage from "./pages/AdminToolsPage";
import AdminSubmissionsPage from "./pages/AdminSubmissionsPage";
import AdminUsersPage from "./pages/AdminUsersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tool/:id" element={<ToolDetailPage />} />
            <Route path="/marketing-calendar" element={<MarketingCalendarPage />} />
            <Route path="/website-submission" element={<WebsiteSubmissionPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/tools" element={<AdminToolsPage />} />
            <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
