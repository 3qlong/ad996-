
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cog, LayoutList, FileCheck, Users, Star, Globe, Calendar, BarChart3, FileText, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const adminSections = [
  {
    title: "网站分类管理",
    description: "增删改查网站分类、图标、排序和显示控制。",
    icon: <LayoutList className="h-8 w-8 text-blue-500" />,
    link: "/admin/categories"
  },
  {
    title: "网站内容管理",
    description: "管理已上线的网站信息、使用技巧和产品介绍。",
    icon: <Cog className="h-8 w-8 text-gray-500" />,
    link: "/admin/tools"
  },
  {
    title: "推荐工具管理",
    description: "管理侧边栏推荐工具的展示和排序。",
    icon: <Star className="h-8 w-8 text-yellow-500" />,
    link: "/admin/recommended"
  },
  {
    title: "导航站点管理",
    description: "管理所有导航站点的信息、显示和排序。",
    icon: <Compass className="h-8 w-8 text-indigo-500" />,
    link: "/admin/nav-sites"
  },
  {
    title: "出海日历管理",
    description: "管理营销日历中的节日和活动事件。",
    icon: <Calendar className="h-8 w-8 text-green-500" />,
    link: "/admin/calendar"
  },
  {
    title: "点击数据统计",
    description: "查看热门AI工具的今日、7天、30天点击数据。",
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
    link: "/admin/statistics"
  },
  {
    title: "页面内容编辑",
    description: "编辑关于我们、商务合作、网站收录页面内容。",
    icon: <FileText className="h-8 w-8 text-orange-500" />,
    link: "/admin/pages"
  },
  {
    title: "网站收录审核",
    description: "审核用户提交的网站收录申请。",
    icon: <FileCheck className="h-8 w-8 text-teal-500" />,
    link: "/admin/submissions"
  },
  {
    title: "管理员账户管理",
    description: "管理后台管理员账户、角色和权限。",
    icon: <Users className="h-8 w-8 text-red-500" />,
    link: "/admin/users"
  },
];

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto py-6 md:py-12">
        <div className="space-y-8">
          <h1 className="text-2xl md:text-3xl font-bold">后台管理面板</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => (
              <Card key={section.title} className="hover:shadow-lg transition-shadow">
                <Link to={section.link} className="block h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                        {section.icon}
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">{section.description}</p>
                    </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
