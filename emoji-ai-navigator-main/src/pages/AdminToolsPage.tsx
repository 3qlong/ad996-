
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ToolFormValues } from "@/lib/validations/tool";
import { toast } from 'sonner';
import { Tool } from '@/types/tool';
import { ToolsTable } from '@/components/admin/ToolsTable';
import { ToolFormDialog } from '@/components/admin/ToolFormDialog';
import { DeleteToolAlert } from '@/components/admin/DeleteToolAlert';
import { allTools } from '@/data/tools';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const allCategories = [...new Set(allTools.map(t => t.category))].sort();

// Load real tools from allTools data
const initialTools: Tool[] = allTools.map((t, i) => ({
  id: t.id,
  name: t.name,
  introduction: t.description,
  category: t.category,
  tags: t.tags,
  logo: t.logo,
  order: i + 1,
  pinned: false,
}));

const AdminToolsPage = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool | null>(null);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  // 搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;
  // 批量操作状态
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [batchCategory, setBatchCategory] = useState<string>('');
  const [isBatchMoveDialogOpen, setIsBatchMoveDialogOpen] = useState(false);

  const handleAddClick = () => {
    setCurrentTool(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (tool: Tool) => {
    navigate(`/admin/tools/${tool.id}/edit`);
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

  // 批量操作功能
  const handleSelectTool = (toolId: number) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTools.length === tools.length) {
      setSelectedTools([]);
    } else {
      setSelectedTools(tools.map(t => t.id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedTools.length > 0) {
      setTools(tools.filter(t => !selectedTools.includes(t.id)));
      setSelectedTools([]);
      toast.success(`已删除${selectedTools.length}个网站。`);
    }
  };

  const handleBatchMove = () => {
    if (selectedTools.length > 0 && batchCategory) {
      setTools(tools.map(t => 
        selectedTools.includes(t.id) ? { ...t, category: batchCategory } : t
      ));
      setSelectedTools([]);
      setIsBatchMoveDialogOpen(false);
      setBatchCategory('');
      toast.success(`已将${selectedTools.length}个网站移动到${batchCategory}分类。`);
    }
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
  
  const filteredTools = useMemo(() => {
    let result = tools;
    if (filterCategory !== '全部') result = result.filter(t => t.category === filterCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.order - b.order;
    });
  }, [tools, filterCategory, searchQuery]);

  const totalPages = Math.ceil(filteredTools.length / pageSize);
  const sortedTools = filteredTools.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto py-6 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">后台管理</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>网站内容管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">网站内容管理</h1>
              <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" />新增网站</Button>
            </div>

            {/* 搜索和筛选 */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="搜索工具名称..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10" />
              </div>
              <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部分类</SelectItem>
                  {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-sm">共 {filteredTools.length} 个工具</Badge>
            </div>

            {/* 批量操作栏 */}
            {selectedTools.length > 0 && (
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
                <span className="text-sm text-gray-600">已选择 {selectedTools.length} 项</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBatchDeleteOpen(true)}
                  className="ml-auto"
                >
                  批量删除
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setIsBatchMoveDialogOpen(true)}
                >
                  批量移动
                </Button>
              </div>
            )}
            
            <ToolsTable
              tools={sortedTools}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onSort={handleSort}
              onPinToggle={handlePinToggle}
              onUpdateSubTags={(toolId, subTags) => {
                setTools(tools.map(t => t.id === toolId ? { ...t, tags: Array.from(new Set([t.category, ...subTags])) } : t));
              }}
              selectedTools={selectedTools}
              onSelectTool={handleSelectTool}
              onSelectAll={handleSelectAll}
            />

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>上一页</Button>
                <span className="text-sm text-gray-500">第 {currentPage} / {totalPages} 页</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>下一页</Button>
              </div>
            )}
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

      <AlertDialog open={isBatchDeleteOpen} onOpenChange={setIsBatchDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除 {selectedTools.length} 个网站？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销。选中的站点将从列表中移除，且前台搜索结果会同步消失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleBatchDelete(); setIsBatchDeleteOpen(false); }} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量移动模态框 */}
      <Dialog open={isBatchMoveDialogOpen} onOpenChange={setIsBatchMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量移动网站</DialogTitle>
            <DialogDescription>
              选择要将已选网站移动到的分类。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="batch-category">目标分类</Label>
            <Select value={batchCategory} onValueChange={setBatchCategory}>
              <SelectTrigger id="batch-category">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchMoveDialogOpen(false)}>取消</Button>
            <Button onClick={handleBatchMove} disabled={!batchCategory}>移动</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminToolsPage;
