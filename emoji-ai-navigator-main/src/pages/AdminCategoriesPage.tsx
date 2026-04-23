
import React, { useState, useMemo } from 'react';
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
import { PlusCircle, Trash2, FilePenLine, ArrowUp, ArrowDown, Briefcase, PenTool, Image, Video, Code, Palette, Music, Search, BookOpen, Bot, Newspaper, TrendingUp, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { allTools } from '@/data/tools';
import { Badge } from '@/components/ui/badge';

// Icon map for categories
const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, PenTool, Image, Video, Code, Palette, Music, Search, BookOpen, Bot, Newspaper, TrendingUp, MessageSquare, Sparkles,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

interface Category {
  id: number;
  name: string;
  icon: string;
  order: number;
  status: boolean;
}

const initialCategories: Category[] = [
  { id: 1, name: 'AI办公', icon: 'Briefcase', order: 1, status: true },
  { id: 2, name: 'AI写作', icon: 'PenTool', order: 2, status: true },
  { id: 3, name: 'AI图像', icon: 'Image', order: 3, status: true },
  { id: 4, name: 'AI视频', icon: 'Video', order: 4, status: true },
  { id: 5, name: 'AI编程', icon: 'Code', order: 5, status: true },
  { id: 6, name: 'AI设计', icon: 'Palette', order: 6, status: true },
  { id: 7, name: 'AI音频', icon: 'Music', order: 7, status: true },
  { id: 8, name: 'AI搜索', icon: 'Search', order: 8, status: true },
  { id: 9, name: 'AI学习', icon: 'BookOpen', order: 9, status: true },
  { id: 10, name: 'AI智能体', icon: 'Bot', order: 10, status: true },
  { id: 11, name: 'AI聊天', icon: 'MessageSquare', order: 11, status: true },
  { id: 12, name: '营销新闻', icon: 'Newspaper', order: 12, status: true },
  { id: 13, name: '热榜指数', icon: 'TrendingUp', order: 13, status: true },
];

// Count tools per category from actual data
const getToolCount = (categoryName: string) => {
  return allTools.filter(t => t.category === categoryName).length;
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Briefcase');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const sortedCategories = useMemo(() =>
    [...categories].sort((a, b) => a.order - b.order), [categories]
  );

  const handleAddClick = () => {
    setCurrentCategory(null);
    setCategoryName('');
    setCategoryIcon('Briefcase');
    setIsDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
    }
    setIsAlertOpen(false);
  };

  const handleSort = (categoryId: number, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sorted.length) return;
    const newCategories = [...sorted];
    [newCategories[currentIndex].order, newCategories[newIndex].order] = [newCategories[newIndex].order, newCategories[currentIndex].order];
    setCategories(newCategories);
  };

  const handleStatusToggle = (categoryId: number) => {
    setCategories(categories.map(c => c.id === categoryId ? { ...c, status: !c.status } : c));
  };

  const handleSubmit = () => {
    if (currentCategory) {
      setCategories(categories.map(c => c.id === currentCategory.id ? { ...c, name: categoryName, icon: categoryIcon } : c));
    } else {
      const newCategory: Category = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name: categoryName,
        icon: categoryIcon,
        order: (categories.length > 0 ? Math.max(...categories.map(c => c.order)) : 0) + 1,
        status: true,
      };
      setCategories([...categories, newCategory]);
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
            <BreadcrumbItem><BreadcrumbPage>网站分类管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">网站分类管理</h1>
            <Button onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />新增分类
            </Button>
          </div>

          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">显示</TableHead>
                  <TableHead className="w-[60px]">图标</TableHead>
                  <TableHead>分类名称</TableHead>
                  <TableHead className="w-[100px] text-center">工具数</TableHead>
                  <TableHead className="w-[80px] text-center">排序</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category, index) => {
                  const IconComp = ICON_MAP[category.icon] || Sparkles;
                  const toolCount = getToolCount(category.name);
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <button onClick={() => handleStatusToggle(category.id)}>
                          <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center ${category.status ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ml-0.5 ${category.status ? 'translate-x-4' : ''}`} />
                          </div>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                          <IconComp className="h-4 w-4 text-gray-600" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{toolCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500">{category.order}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleSort(category.id, 'up')} disabled={index === 0} title="上移">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleSort(category.id, 'down')} disabled={index === sortedCategories.length - 1} title="下移">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(category)} title="编辑">
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(category)} title="删除">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCategory ? '编辑分类' : '新增分类'}</DialogTitle>
            <DialogDescription>设置分类的名称和图标。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">分类名称</Label>
              <Input id="category-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="例如：AI 视频" />
            </div>
            <div className="space-y-2">
              <Label>图标</Label>
              <Select value={categoryIcon} onValueChange={setCategoryIcon}>
                <SelectTrigger>
                  <SelectValue placeholder="选择图标" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(iconName => {
                    const Icon = ICON_MAP[iconName];
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{iconName}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!categoryName.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。分类 "{categoryToDelete?.name}" 下有 {categoryToDelete ? getToolCount(categoryToDelete.name) : 0} 个工具。
            </AlertDialogDescription>
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

export default AdminCategoriesPage;
