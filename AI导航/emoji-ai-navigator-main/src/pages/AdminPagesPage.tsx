
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FileText, Handshake, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PageContent {
  title: string;
  subtitle: string;
  content: string;
  contactEmail: string;
  contactPhone: string;
  extra: string;
}

const initialPages: Record<string, PageContent> = {
  about: {
    title: '关于我们',
    subtitle: 'AI导航 - 发现最好的AI工具',
    content: 'AI导航是一个专注于收集和推荐优质AI工具的导航平台。我们致力于帮助用户发现、了解和使用各种人工智能工具，提升工作效率和创造力。\n\n我们的团队持续追踪AI领域的最新发展，确保为用户提供最新、最全面的AI工具信息。无论你是开发者、设计师、内容创作者还是商务人士，都能在这里找到适合你的AI工具。',
    contactEmail: 'contact@ai-nav.com',
    contactPhone: '',
    extra: '成立于2024年，已收录1400+款AI工具',
  },
  cooperation: {
    title: '商务合作',
    subtitle: '与我们一起推动AI工具的发展',
    content: '我们欢迎各种形式的商务合作，包括但不限于：\n\n• 品牌推广与广告投放\n• AI工具评测与推荐\n• 内容合作与联合营销\n• 技术合作与API对接\n• 线下活动与行业会议\n\n如果您有合作意向，请通过以下方式联系我们。',
    contactEmail: 'business@ai-nav.com',
    contactPhone: '400-888-8888',
    extra: '合作伙伴：OpenAI, Anthropic, Google, Microsoft 等',
  },
  submission: {
    title: '网站收录',
    subtitle: '提交你的AI工具，让更多人发现',
    content: '如果你开发了一款优秀的AI工具，欢迎提交到我们的平台。收录流程如下：\n\n1. 填写收录申请表单，提供工具基本信息\n2. 我们的编辑团队会在3个工作日内审核\n3. 审核通过后，工具将出现在对应分类中\n4. 我们会为优质工具提供首页推荐位\n\n收录标准：工具功能完善、界面友好、有实际使用价值。',
    contactEmail: 'submit@ai-nav.com',
    contactPhone: '',
    extra: '平均审核时间：1-3个工作日',
  },
};

const AdminPagesPage = () => {
  const [pages, setPages] = useState(initialPages);
  const [activeTab, setActiveTab] = useState('about');

  const handleFieldChange = (page: string, field: keyof PageContent, value: string) => {
    setPages(prev => ({
      ...prev,
      [page]: { ...prev[page], [field]: value },
    }));
  };

  const handleSave = (page: string) => {
    // In real app, save to API
    toast.success(`"${pages[page].title}" 页面内容已保存`);
  };

  const renderPageForm = (pageKey: string) => {
    const page = pages[pageKey];
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>页面标题</Label>
            <Input value={page.title} onChange={e => handleFieldChange(pageKey, 'title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>副标题</Label>
            <Input value={page.subtitle} onChange={e => handleFieldChange(pageKey, 'subtitle', e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>页面内容</Label>
          <Textarea value={page.content} onChange={e => handleFieldChange(pageKey, 'content', e.target.value)} rows={10} className="font-mono text-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>联系邮箱</Label>
            <Input value={page.contactEmail} onChange={e => handleFieldChange(pageKey, 'contactEmail', e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label>联系电话</Label>
            <Input value={page.contactPhone} onChange={e => handleFieldChange(pageKey, 'contactPhone', e.target.value)} placeholder="400-xxx-xxxx" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>附加信息</Label>
          <Input value={page.extra} onChange={e => handleFieldChange(pageKey, 'extra', e.target.value)} placeholder="其他说明..." />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => handleSave(pageKey)}>
            <Save className="mr-2 h-4 w-4" />保存修改
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto py-6 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">后台管理</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>页面内容编辑</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold">页面内容编辑</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="about" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />关于我们
              </TabsTrigger>
              <TabsTrigger value="cooperation" className="flex items-center gap-1.5">
                <Handshake className="h-3.5 w-3.5" />商务合作
              </TabsTrigger>
              <TabsTrigger value="submission" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />网站收录
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />关于我们
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderPageForm('about')}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cooperation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5" />商务合作
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderPageForm('cooperation')}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submission">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />网站收录
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderPageForm('submission')}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPagesPage;
