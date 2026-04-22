
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cog, LayoutList, FileCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const adminSections = [
  {
    title: "网站分类管理",
    description: "增删改查网站分类。",
    icon: <LayoutList className="h-8 w-8 text-gray-500" />,
    link: "/admin/categories"
  },
  {
    title: "网站内容管理",
    description: "管理已上线的网站信息。",
    icon: <Cog className="h-8 w-8 text-gray-500" />,
    link: "/admin/tools"
  },
  {
    title: "网站收录审核",
    description: "审核用户提交的网站。",
    icon: <FileCheck className="h-8 w-8 text-gray-500" />,
    link: "/admin/submissions"
  },
  {
    title: "管理员账户管理",
    description: "管理后台管理员账户。",
    icon: <Users className="h-8 w-8 text-gray-500" />,
    link: "/admin/users"
  }
];

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="sticky top-0 z-10 shadow-sm bg-gradient-to-b from-white to-white/80 backdrop-blur-sm">
        <Header />
      </div>
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
