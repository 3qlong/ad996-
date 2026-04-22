
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, FilePenLine, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';

interface RecommendedTool {
  id: number;
  name: string;
  logo: string;
  description: string;
  url: string;
  color: string;
  order: number;
  visible: boolean;
}

const initialTools: RecommendedTool[] = [
  { id: 1, name: 'ChatGPT', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', description: '最强大的AI对话助手', url: 'https://chat.openai.com', color: '#10A37F', order: 1, visible: true },
  { id: 2, name: 'Midjourney', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Midjourney_Emblem.svg', description: 'AI图像生成神器', url: 'https://www.midjourney.com', color: '#1F1F1F', order: 2, visible: true },
  { id: 3, name: 'Claude', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg', description: 'Anthropic的AI助手', url: 'https://claude.ai', color: '#D97757', order: 3, visible: true },
  { id: 4, name: 'Stable Diffusion', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Stable_Diffusion_logo.png', description: '开源AI绘画模型', url: 'https://stability.ai', color: '#6B4EE6', order: 4, visible: true },
];

const AdminRecommendedPage = () => {
  const [tools, setTools] = useState<RecommendedTool[]>(initialTools);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<RecommendedTool | null>(null);
  const [toolToDelete, setToolToDelete] = useState<RecommendedTool | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formColor, setFormColor] = useState('#000000');

  const sortedTools = [...tools].sort((a, b) => a.order - b.order);

  const handleAddClick = () => {
    setCurrentTool(null);
    setFormName(''); setFormLogo(''); setFormDescription(''); setFormUrl(''); setFormColor('#10A37F');
    setIsDialogOpen(true);
  };

  const handleEditClick = (tool: RecommendedTool) => {
    setCurrentTool(tool);
    setFormName(tool.name); setFormLogo(tool.logo); setFormDescription(tool.description); setFormUrl(tool.url); setFormColor(tool.color);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (tool: RecommendedTool) => {
    setToolToDelete(tool);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (toolToDelete) {
      setTools(tools.filter(t => t.id !== toolToDelete.id));
      toast.success(`已删除推荐工具 "${toolToDelete.name}"`);
    }
    setIsAlertOpen(false);
  };

  const handleSort = (id: number, direction: 'up' | 'down') => {
    const sorted = [...tools].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(t => t.id === id);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const updated = [...sorted];
    [updated[idx].order, updated[newIdx].order] = [updated[newIdx].order, updated[idx].order];
    setTools(updated);
  };

  const handleVisibleToggle = (id: number) => {
    setTools(tools.map(t => t.id === id ? { ...t, visible: !t.visible } : t));
  };

  const handleSubmit = () => {
    if (currentTool) {
      setTools(tools.map(t => t.id === currentTool.id ? { ...t, name: formName, logo: formLogo, description: formDescription, url: formUrl, color: formColor } : t));
      toast.success('推荐工具已更新');
    } else {
      const newTool: RecommendedTool = {
        id: tools.length > 0 ? Math.max(...tools.map(t => t.id)) + 1 : 1,
        name: formName, logo: formLogo, description: formDescription, url: formUrl, color: formColor,
        order: (tools.length > 0 ? Math.max(...tools.map(t => t.order)) : 0) + 1,
        visible: true,
      };
      setTools([...tools, newTool]);
      toast.success('已添加推荐工具');
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto py-6 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">后台管理</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>推荐工具管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">推荐工具管理</h1>
            <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" />新增推荐</Button>
          </div>

          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">显示</TableHead>
                  <TableHead className="w-[60px]">图标</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>简介</TableHead>
                  <TableHead>立即体验</TableHead>
                  <TableHead className="w-[80px] text-center">排序</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTools.map((tool, index) => (
                  <TableRow key={tool.id} className={!tool.visible ? 'opacity-50' : ''}>
                    <TableCell>
                      <button onClick={() => handleVisibleToggle(tool.id)}>
                        <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center ${tool.visible ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ml-0.5 ${tool.visible ? 'translate-x-4' : ''}`} />
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={tool.logo} alt={tool.name} className="object-cover" />
                        <AvatarFallback className="rounded-md" style={{ backgroundColor: tool.color, color: '#fff' }}>{tool.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell className="text-gray-500 max-w-[200px] truncate">{tool.description}</TableCell>
                    <TableCell>
                      <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink className="h-3 w-3" />访问
                      </a>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500">{tool.order}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleSort(tool.id, 'up')} disabled={index === 0} title="上移"><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleSort(tool.id, 'down')} disabled={index === sortedTools.length - 1} title="下移"><ArrowDown className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(tool)} title="编辑"><FilePenLine className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(tool)} title="删除"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentTool ? '编辑推荐工具' : '新增推荐工具'}</DialogTitle>
            <DialogDescription>设置推荐工具在侧边栏中的展示信息。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>名称</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="例如：ChatGPT" />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={formLogo} onChange={(e) => setFormLogo(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>简介</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="一句话介绍" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>立即体验链接</Label>
              <Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>主题色</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                <Input value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-32" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!formName.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>将从推荐列表中移除 "{toolToDelete?.name}"。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRecommendedPage;
