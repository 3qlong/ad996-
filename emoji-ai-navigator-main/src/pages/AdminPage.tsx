import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { allTools } from '@/data/tools';
import {
  Cog, LayoutList, FileCheck, Users, Star, Compass, Calendar, BarChart3, FileText, Settings,
} from 'lucide-react';

const quickLinks = [
  { title: '网站分类管理', desc: '分类名称、图标、排序、显示、工具数', icon: LayoutList, to: '/admin/categories', tone: 'text-blue-500' },
  { title: '网站内容管理', desc: '站点信息、使用技巧、产品介绍、标签', icon: Cog, to: '/admin/tools', tone: 'text-gray-600' },
  { title: '推荐工具管理', desc: '侧边栏推荐位的内容与排序', icon: Star, to: '/admin/recommended', tone: 'text-yellow-500' },
  { title: '搜索标签管理', desc: '首页搜索框下方渠道标签的名称、URL 与显示', icon: Compass, to: '/admin/nav-sites', tone: 'text-indigo-500' },
  { title: '出海日历管理', desc: '日历事件、类型、国别、描述', icon: Calendar, to: '/admin/calendar', tone: 'text-green-500' },
  { title: '点击数据统计', desc: '今日 / 7天 / 30天 点击排行', icon: BarChart3, to: '/admin/statistics', tone: 'text-purple-500' },
  { title: '页面内容编辑', desc: 'AI榜单/海外创意/日历/商务合作/关于我们', icon: FileText, to: '/admin/pages', tone: 'text-orange-500' },
  { title: '网站收录审核', desc: '审核用户提交的 AI 工具', icon: FileCheck, to: '/admin/submissions', tone: 'text-teal-500' },
  { title: '管理员账户', desc: '账号、角色、权限', icon: Users, to: '/admin/users', tone: 'text-red-500' },
  { title: '站点设置 / Logo', desc: '主页 Logo 上传（支持 GIF）', icon: Settings, to: '/admin/site-settings', tone: 'text-pink-500' },
];

const AdminPage = () => {
  const toolCount = allTools.length;
  const categoryCount = new Set(allTools.map(t => t.category)).size;
  const hotCount = allTools.filter(t => t.category === '热榜指数').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '工具总数', value: toolCount, tone: 'text-blue-600' },
          { label: '分类数', value: categoryCount, tone: 'text-green-600' },
          { label: '热榜指数', value: hotCount, tone: 'text-orange-500' },
          { label: '待审核', value: 0, tone: 'text-gray-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.tone}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(q => {
          const Icon = q.icon;
          return (
            <Card key={q.to} className="hover:shadow-md transition-shadow">
              <Link to={q.to} className="block h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">{q.title}</CardTitle>
                  <Icon className={`h-6 w-6 ${q.tone}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{q.desc}</p>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPage;
