
import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ToolFormValues } from "@/lib/validations/tool";
import { toast } from 'sonner';
import { Tool } from '@/types/tool';
import { SearchBackgroundManager } from '@/components/admin/SearchBackgroundManager';
import { ToolsTable } from '@/components/admin/ToolsTable';
import { ToolFormDialog } from '@/components/admin/ToolFormDialog';
import { DeleteToolAlert } from '@/components/admin/DeleteToolAlert';

const initialTools: Tool[] = [
  { id: 1, name: 'ChatGPT', introduction: '一个由OpenAI开发的对话式人工智能模型。', category: 'AI 写作', tags: ['对话', '写作'], logo: '/placeholder.svg', order: 1, pinned: true },
  { id: 2, name: 'Midjourney', introduction: '一个独立的研究实验室，探索新的思想媒介，扩大人类的想象力。', category: 'AI 图像', tags: ['图像生成', '艺术'], logo: '/placeholder.svg', order: 2, pinned: false },
  { id: 3, name: 'Runway', introduction: '利用人工智能的力量，让视频编辑变得前所未有的简单快捷。', category: 'AI 视频', tags: ['视频编辑', 'AI工具'], logo: '/placeholder.svg', order: 3, pinned: false },
];

const AdminToolsPage = () => {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool | null>(null);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);

  const handleAddClick = () => {
    setCurrentTool(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (tool: Tool) => {
    setCurrentTool(tool);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (toolToDelete) {
      setTools(tools.filter(t => t.id !== toolToDelete.id));
      setToolToDelete(null);
      toast.success('网站已删除。');
    }
    setIsAlertOpen(false);
  };

  const onSubmit = (values: ToolFormValues) => {
    const newToolData = {
      name: values.siteName,
      introduction: values.introduction,
      category: values.category,
      tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    
    const handleLogo = (logo: any, callback: (logoUrl: string) => void) => {
      if (logo instanceof FileList && logo.length > 0) {
        const file = logo[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          callback(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (typeof logo === 'string') {
        callback(logo);
      }
    };
    
    handleLogo(values.logo, (logoUrl) => {
      if (currentTool) {
        setTools(tools.map(t => t.id === currentTool.id ? { ...t, ...newToolData, logo: logoUrl } : t));
        toast.success('网站已更新。');
      } else {
        const newTool: Tool = {
          id: tools.length > 0 ? Math.max(...tools.map(t => t.id)) + 1 : 1,
          ...newToolData,
          logo: logoUrl,
          order: (tools.length > 0 ? Math.max(...tools.map(t => t.order)) : 0) + 1,
          pinned: false,
        };
        setTools([...tools, newTool]);
        toast.success('新网站已添加。');
      }
      setIsDialogOpen(false);
    });
  };

  const handleSort = (toolId: number, direction: 'up' | 'down') => {
    const currentIndex = tools.findIndex(t => t.id === toolId);
    if (currentIndex === -1) return;
  
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  
    if (newIndex < 0 || newIndex >= tools.length) return;
  
    const newTools = [...tools];
    // Swap order property
    [newTools[currentIndex].order, newTools[newIndex].order] = [newTools[newIndex].order, newTools[currentIndex].order];
  
    setTools(newTools);
  };
  
  const handlePinToggle = (toolId: number) => {
    setTools(tools.map(t => t.id === toolId ? { ...t, pinned: !t.pinned } : t));
  };
  
  const sortedTools = useMemo(() => {
    return [...tools].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.order - b.order;
    });
  }, [tools]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="sticky top-0 z-10 shadow-sm bg-gradient-to-b from-white to-white/80 backdrop-blur-sm">
        <Header />
      </div>
      <main className="container mx-auto py-6 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">后台管理</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>网站内容管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="space-y-8">
          <SearchBackgroundManager />
        
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">网站内容管理</h1>
              <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" />新增网站</Button>
            </div>
            <ToolsTable 
              tools={sortedTools}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onSort={handleSort}
              onPinToggle={handlePinToggle}
            />
          </div>
        </div>
      </main>

      <ToolFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        currentTool={currentTool}
      />
      
      <DeleteToolAlert
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmDelete}
        toolToDelete={toolToDelete}
      />
    </div>
  );
};

export default AdminToolsPage;
