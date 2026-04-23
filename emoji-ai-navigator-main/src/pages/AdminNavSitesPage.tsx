import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowDown, ArrowUp, ExternalLink, FilePenLine, Lock, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_SEARCH_TABS,
  loadSearchTabs,
  resetSearchTabs,
  saveSearchTabs,
  SearchTab,
} from '@/lib/searchTabs';

interface EditorState {
  mode: 'create' | 'edit';
  tab: SearchTab;
}

const BLANK_TAB: SearchTab = { id: '', name: '', url: '', visible: true };

const genId = () => `tab_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const AdminNavSitesPage: React.FC = () => {
  const [tabs, setTabs] = useState<SearchTab[]>([]);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  useEffect(() => {
    setTabs(loadSearchTabs());
  }, []);

  const persist = (next: SearchTab[]) => {
    setTabs(next);
    saveSearchTabs(next);
  };

  const validate = (t: SearchTab): { name?: string; url?: string } => {
    const e: { name?: string; url?: string } = {};
    if (!t.name.trim()) e.name = '标签名称不能为空';
    if (!t.internal) {
      if (!t.url.trim()) e.url = '搜索 URL 不能为空';
      else if (!/^https?:\/\//i.test(t.url.trim())) e.url = 'URL 必须以 http(s):// 开头';
    }
    return e;
  };

  const openCreate = () => {
    setEditor({ mode: 'create', tab: { ...BLANK_TAB, id: genId() } });
    setErrors({});
  };
  const openEdit = (tab: SearchTab) => {
    setEditor({ mode: 'edit', tab: { ...tab } });
    setErrors({});
  };
  const closeEditor = () => {
    setEditor(null);
    setErrors({});
  };

  const handleEditorChange = <K extends keyof SearchTab>(key: K, value: SearchTab[K]) => {
    if (!editor) return;
    const next = { ...editor.tab, [key]: value };
    setEditor({ ...editor, tab: next });
    setErrors(validate(next));
  };

  const handleEditorSave = () => {
    if (!editor) return;
    const e = validate(editor.tab);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('请修正表单错误后再保存');
      return;
    }
    const t = { ...editor.tab, name: editor.tab.name.trim(), url: editor.tab.url.trim() };
    if (editor.mode === 'create') {
      persist([...tabs, t]);
      toast.success(`已新增「${t.name}」`);
    } else {
      persist(tabs.map(x => (x.id === t.id ? t : x)));
      toast.success(`已保存「${t.name}」`);
    }
    closeEditor();
  };

  const handleToggleVisible = (id: string) => {
    persist(tabs.map(t => (t.id === id ? { ...t, visible: !t.visible } : t)));
  };

  const handleMove = (id: string, dir: -1 | 1) => {
    const idx = tabs.findIndex(t => t.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= tabs.length) return;
    // internal 不能被移动到非首位，且不能有其它标签移到它前面
    if (tabs[idx].internal || tabs[target].internal) return;
    const next = [...tabs];
    [next[idx], next[target]] = [next[target], next[idx]];
    persist(next);
  };

  const handleDelete = (id: string) => {
    const t = tabs.find(x => x.id === id);
    if (!t) return;
    if (t.internal) {
      toast.error('站内搜索不可删除');
      return;
    }
    persist(tabs.filter(x => x.id !== id));
    setDeletingId(null);
    toast.success(`已删除「${t.name}」`);
  };

  const handleReset = () => {
    const next = resetSearchTabs();
    setTabs(next);
    toast.success('已恢复为默认标签');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">后台管理</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>搜索标签管理</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6" />搜索标签管理
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            管理首页搜索框下方的搜索渠道标签。支持新增、编辑、排序、显示/隐藏。「站内搜索」为内置标签，不可删除。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline"><RotateCcw className="h-4 w-4 mr-2" />恢复默认</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>恢复为默认标签？</AlertDialogTitle>
                <AlertDialogDescription>
                  当前的自定义配置将被覆盖为默认的 11 个搜索标签，操作不可撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>确认恢复</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />新增搜索标签</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
            共 {tabs.length} 个标签 · {tabs.filter(t => t.visible).length} 个前台显示
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">显示</TableHead>
                <TableHead className="w-[160px]">标签名称</TableHead>
                <TableHead>搜索 URL</TableHead>
                <TableHead className="w-[140px] text-right">排序</TableHead>
                <TableHead className="w-[180px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabs.map((t, idx) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Switch
                      checked={t.visible}
                      onCheckedChange={() => handleToggleVisible(t.id)}
                      aria-label={`切换 ${t.name} 显示状态`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {t.name}
                      {t.internal && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                          <Lock className="h-3 w-3" />内置
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[420px]">
                    {t.internal ? (
                      <span className="text-xs text-gray-400">—（站内路由）</span>
                    ) : (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{t.url}</span>
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(t.id, -1)}
                      disabled={idx === 0 || tabs[idx - 1]?.internal || t.internal}
                      title="上移"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(t.id, 1)}
                      disabled={idx === tabs.length - 1 || t.internal}
                      title="下移"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)} title="编辑">
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(t.id)}
                      disabled={t.internal}
                      title={t.internal ? '内置标签不可删除' : '删除'}
                    >
                      <Trash2 className={`h-4 w-4 ${t.internal ? 'text-gray-300' : 'text-red-500'}`} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tabs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-12">
                    暂无标签，点击右上角「新增搜索标签」开始
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 新增 / 编辑弹窗 */}
      <Dialog open={!!editor} onOpenChange={v => !v && closeEditor()}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editor?.mode === 'create' ? '新增搜索标签' : '编辑搜索标签'}</DialogTitle>
            <DialogDescription>
              关键词会被 URL-encode 后自动拼接到搜索 URL 末尾，请确保 URL 以 <code className="px-1 bg-gray-100 rounded">?q=</code>、<code className="px-1 bg-gray-100 rounded">?wd=</code> 等查询参数结尾。
            </DialogDescription>
          </DialogHeader>
          {editor && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>标签名称<span className="text-red-500 ml-0.5">*</span></Label>
                <Input
                  value={editor.tab.name}
                  onChange={e => handleEditorChange('name', e.target.value)}
                  placeholder="例如：谷歌"
                  maxLength={16}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>搜索 URL{!editor.tab.internal && <span className="text-red-500 ml-0.5">*</span>}</Label>
                <Input
                  value={editor.tab.url}
                  onChange={e => handleEditorChange('url', e.target.value)}
                  placeholder="https://www.google.com/search?q="
                  disabled={editor.tab.internal}
                />
                {editor.tab.internal ? (
                  <p className="text-xs text-gray-500">内置「站内搜索」跳转站内路由，无需 URL</p>
                ) : (
                  errors.url ? (
                    <p className="text-xs text-red-500">{errors.url}</p>
                  ) : (
                    <p className="text-xs text-gray-500">示例：百度 https://www.baidu.com/s?wd=</p>
                  )
                )}
              </div>
              <div className="flex items-center justify-between pt-1 border-t">
                <Label>前台显示</Label>
                <Switch
                  checked={editor.tab.visible}
                  onCheckedChange={v => handleEditorChange('visible', v)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeEditor}>取消</Button>
            <Button onClick={handleEditorSave}>
              {editor?.mode === 'create' ? '新增' : '保存修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deletingId} onOpenChange={v => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认删除「{tabs.find(t => t.id === deletingId)?.name}」？
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销。删除后该标签会立即从前台搜索栏消失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 默认配置提示（当用户清空后引导恢复） */}
      {tabs.length === 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />一键恢复 {DEFAULT_SEARCH_TABS.length} 个默认标签
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminNavSitesPage;
