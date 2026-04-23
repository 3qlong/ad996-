
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, FilePenLine, ArrowUp, ArrowDown, ExternalLink, Eye, EyeOff, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { allTools } from '@/data/tools';
import { toast } from 'sonner';

interface NavSite {
  id: number;
  name: string;
  description: string;
  logo: string;
  url: string;
  category: string;
  tags: string[];
  order: number;
  visible: boolean;
  emoji: string;
  upvotes: number;
}

// Extract unique categories from allTools
const allCategories = [...new Set(allTools.map(t => t.category))].sort();

const AdminNavSitesPage = () => {
  const [sites, setSites] = useState<NavSite[]>(() =>
    allTools.map((t, i) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      logo: t.logo,
      url: t.url,
      category: t.category,
      tags: t.tags,
      order: i + 1,
      visible: true,
      emoji: t.emoji,
      upvotes: t.upvotes,
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<NavSite | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<NavSite | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formEmoji, setFormEmoji] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filteredSites = useMemo(() => {
    let result = sites;
    if (filterCategory !== '全部') {
      result = result.filter(s => s.category === filterCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q));
    }
    return result.sort((a, b) => a.order - b.order);
  }, [sites, filterCategory, searchQuery]);

  const totalPages = Math.ceil(filteredSites.length / pageSize);
  const paginatedSites = filteredSites.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddClick = () => {
    setCurrentSite(null);
    setFormName(''); setFormDescription(''); setFormLogo(''); setFormUrl(''); setFormCategory('AI办公'); setFormTags(''); setFormEmoji('');
    setIsDialogOpen(true);
  };

  const handleEditClick = (site: NavSite) => {
    setCurrentSite(site);
    setFormName(site.name); setFormDescription(site.description); setFormLogo(site.logo); setFormUrl(site.url);
    setFormCategory(site.category); setFormTags(site.tags.join(', ')); setFormEmoji(site.emoji);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (site: NavSite) => {
    setSiteToDelete(site);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (siteToDelete) {
      setSites(sites.filter(s => s.id !== siteToDelete.id));
      toast.success(`已删除站点 "${siteToDelete.name}"`);
    }
    setIsAlertOpen(false);
  };

  const handleVisibleToggle = (id: number) => {
    setSites(sites.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const handleSort = (id: number, direction: 'up' | 'down') => {
    const idx = paginatedSites.findIndex(s => s.id === id);
    if (idx === -1) return;
    const currentItem = paginatedSites[idx];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= paginatedSites.length) return;
    const swapItem = paginatedSites[swapIdx];
    setSites(sites.map(s => {
      if (s.id === currentItem.id) return { ...s, order: swapItem.order };
      if (s.id === swapItem.id) return { ...s, order: currentItem.order };
      return s;
    }));
  };

  const handleSubmit = () => {
    const tags = formTags.split(',').map(t => t.trim()).filter(Boolean);
    if (currentSite) {
      setSites(sites.map(s => s.id === currentSite.id ? {
        ...s, name: formName, description: formDescription, logo: formLogo,
        url: formUrl, category: formCategory, tags, emoji: formEmoji,
      } : s));
      toast.success('站点已更新');
    } else {
      const newSite: NavSite = {
        id: sites.length > 0 ? Math.max(...sites.map(s => s.id)) + 1 : 1,
        name: formName, description: formDescription, logo: formLogo,
        url: formUrl, category: formCategory, tags, emoji: formEmoji,
        order: sites.length + 1, visible: true, upvotes: 0,
      };
      setSites([...sites, newSite]);
      toast.success('新站点已添加');
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
            <BreadcrumbItem><BreadcrumbPage>导航站点管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">导航站点管理</h1>
            <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" />新增站点</Button>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="搜索站点名称或URL..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10" />
            </div>
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="筛选分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部分类</SelectItem>
                {allCategories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm">共 {filteredSites.length} 个站点</Badge>
          </div>

          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">显示</TableHead>
                  <TableHead className="w-[50px]">图标</TableHead>
                  <TableHead>站点名称</TableHead>
                  <TableHead>跳转URL</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead className="w-[60px] text-center">排序</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSites.map((site, index) => (
                  <TableRow key={site.id} className={!site.visible ? 'opacity-50' : ''}>
                    <TableCell>
                      <button onClick={() => handleVisibleToggle(site.id)}>
                        <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center ${site.visible ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ml-0.5 ${site.visible ? 'translate-x-4' : ''}`} />
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8 rounded-md">
                        <AvatarImage src={site.logo} alt={site.name} className="object-cover" />
                        <AvatarFallback className="rounded-md text-xs">{site.emoji || site.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium max-w-[160px] truncate">{site.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm flex items-center gap-1">
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{site.url}</span>
                      </a>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{site.category}</Badge></TableCell>
                    <TableCell className="text-center text-sm text-gray-500">{site.order}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleSort(site.id, 'up')} disabled={index === 0} title="上移"><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleSort(site.id, 'down')} disabled={index === paginatedSites.length - 1} title="下移"><ArrowDown className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(site)} title="编辑"><FilePenLine className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(site)} title="删除"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>上一页</Button>
              <span className="text-sm text-gray-500">第 {currentPage} / {totalPages} 页</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>下一页</Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{currentSite ? '编辑站点' : '新增站点'}</DialogTitle>
            <DialogDescription>管理导航站点的基本信息。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>站点名称 *</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="站点名称" />
              </div>
              <div className="space-y-2">
                <Label>Emoji</Label>
                <Input value={formEmoji} onChange={(e) => setFormEmoji(e.target.value)} placeholder="例如：✍️" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>站点简介 *</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="一句话描述" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>图标URL（支持PNG/JPG/SVG/GIF）</Label>
              <Input value={formLogo} onChange={(e) => setFormLogo(e.target.value)} placeholder="https://..." />
              {formLogo && (
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage src={formLogo} className="object-cover" />
                    <AvatarFallback className="rounded-md">?</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-400">预览</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>跳转URL *</Label>
              <Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>分类 *</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger>
                <SelectContent>
                  {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>标签（逗号分隔）</Label>
              <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="例如：AI写作, 效率" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!formName.trim() || !formUrl.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>将永久删除站点 "{siteToDelete?.name}"。</AlertDialogDescription>
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

export default AdminNavSitesPage;
