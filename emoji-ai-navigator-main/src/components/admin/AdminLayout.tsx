import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LayoutList,
  Cog,
  Star,
  Compass,
  Calendar,
  BarChart3,
  FileText,
  FileCheck,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', label: '概览仪表盘', icon: LayoutDashboard, end: true },
  { to: '/admin/categories', label: '网站分类管理', icon: LayoutList },
  { to: '/admin/tools', label: '网站内容管理', icon: Cog },
  { to: '/admin/recommended', label: '推荐工具管理', icon: Star },
  { to: '/admin/nav-sites', label: '搜索标签管理', icon: Compass },
  { to: '/admin/calendar', label: '出海日历管理', icon: Calendar },
  { to: '/admin/statistics', label: '点击数据统计', icon: BarChart3 },
  { to: '/admin/pages', label: '页面内容编辑', icon: FileText },
  { to: '/admin/submissions', label: '网站收录审核', icon: FileCheck },
  { to: '/admin/users', label: '管理员账户', icon: Users },
  { to: '/admin/site-settings', label: '站点设置 / Logo', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const current = navItems.find(n =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#1E1E1E]">
      {/* Left Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2C2C2C]">
        <div className="sticky top-0 h-screen overflow-y-auto p-3">
          <div className="px-3 py-3 mb-2">
            <div className="text-base font-bold text-gray-800 dark:text-gray-100">后台管理</div>
            <div className="text-xs text-gray-500 mt-0.5">AI导航控制台</div>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-[#1E1E1E]/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-3">
          <div className="text-sm text-gray-500">后台管理 / {current?.label || ''}</div>
          <h1 className="text-lg font-semibold mt-0.5 text-gray-800 dark:text-gray-100">
            {current?.label || '后台管理'}
          </h1>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
