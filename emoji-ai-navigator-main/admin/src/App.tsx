import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import ToolsPage from './pages/ToolsPage';
import NavSitesPage from './pages/NavSitesPage';
import SubmissionsPage from './pages/SubmissionsPage';
import UsersPage from './pages/UsersPage';
import CalendarPage from './pages/CalendarPage';
import BusinessPage from './pages/BusinessPage';
import RecommendedPage from './pages/RecommendedPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="nav-sites" element={<NavSitesPage />} />
          <Route path="recommended" element={<RecommendedPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="submissions" element={<SubmissionsPage />} />
          <Route path="business" element={<BusinessPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
