import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ExternalLink, Heart, Save, ThumbsUp, Trash2, ArrowLeft, Image as ImageIcon, Tag, FileText, Settings2, Plus, ArrowUp, ArrowDown, X, Eye, Send, CheckCircle2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { allTools } from '@/data/tools';
import { CATEGORY_SUB_TAGS } from '@/lib/categorySubTags';

type SectionKind = 'intro' | 'item' | 'tips';
interface ContentSection {
  kind: SectionKind;
  icon: string;
  title: string;
  body: string;
}

interface EditFormState {
  name: string;
  description: string;
  category: string;
  url: string;
  subTags: string[];
  usageTipsCards: ContentSection[];
  productIntroCards: ContentSection[];
  upvotes: number;
  favorites: number;
  order: number;
  pinned: boolean;
  visible: boolean;
  logo: string;
}

const categories = Object.keys(CATEGORY_SUB_TAGS);
const CARD_ICONS = ['💡', '🚀', '📝', '🔧', '📊', '🎯', '⚡', '🔍', '📋', '🛠️'];

// 与前端 ContentCards 一致的解析逻辑
function parseContent(content: string): ContentSection[] {
  if (!content) return [];
  const lines = content.split('\n').filter(l => l.trim());
  const items: ContentSection[] = [];
  const introLines: string[] = [];
  const tipLines: string[] = [];
  let inTips = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const numMatch = trimmed.match(/^(\d+)\.\s*(.+?)[:：]\s*(.+)$/);
    if (numMatch) {
      const idx = parseInt(numMatch[1]) - 1;
      items.push({
        kind: 'item',
        icon: CARD_ICONS[idx % CARD_ICONS.length],
        title: numMatch[2],
        body: numMatch[3],
      });
      inTips = false;
      continue;
    }
    if (trimmed.includes('小贴士') || trimmed.includes('使用建议')) {
      inTips = true;
      continue;
    }
    if ((trimmed.startsWith('•') || trimmed.startsWith('·') || trimmed.startsWith('-')) && inTips) {
      tipLines.push(trimmed.replace(/^[•·\-]\s*/, ''));
      continue;
    }
    if (items.length === 0 && !inTips && trimmed.length < 30) continue;
    if (items.length === 0 && !inTips) introLines.push(trimmed);
  }

  const cards: ContentSection[] = [];
  if (introLines.length > 0) {
    cards.push({ kind: 'intro', icon: '📖', title: '概述', body: introLines.join('') });
  }
  cards.push(...items);
  if (tipLines.length > 0) {
    cards.push({ kind: 'tips', icon: '✨', title: '使用小贴士', body: tipLines.join('\n') });
  }
  return cards;
}

// 序列化为前端可解析的纯文本
function serializeContent(cards: ContentSection[]): string {
  const out: string[] = [];
  let itemIdx = 0;
  for (const card of cards) {
    if (card.kind === 'intro') {
      if (card.body.trim()) out.push(card.body.trim());
    } else if (card.kind === 'item') {
      itemIdx += 1;
      out.push(`${itemIdx}. ${card.title.trim()}: ${card.body.trim()}`);
    } else if (card.kind === 'tips') {
      out.push(`${card.title.trim() || '使用小贴士'}：`);
      const bullets = card.body.split('\n').map(s => s.trim()).filter(Boolean);
      for (const b of bullets) out.push(`• ${b}`);
    }
  }
  return out.join('\n');
}

const AdminToolEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !id) return null;
    return localStorage.getItem(`tool.${id}.publishedAt`);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const raw = allTools.find(t => String(t.id) === id);
      if (!raw) {
        toast.error('未找到该站点');
        navigate('/admin/tools');
        return;
      }
      const subs = (CATEGORY_SUB_TAGS[raw.category] || []).filter(t => raw.tags.includes(t));
      setForm({
        name: raw.name,
        description: raw.description,
        category: raw.category,
        url: (raw as any).url || '',
        subTags: subs,
        usageTipsCards: parseContent((raw as any).details?.usageTips || ''),
        productIntroCards: parseContent((raw as any).details?.productIntro || ''),
        upvotes: (raw as any).upvotes ?? 0,
        favorites: (raw as any).favorites ?? 0,
        order: 0,
        pinned: false,
        visible: true,
        logo: raw.logo,
      });
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [id, navigate]);

  const subOptions = useMemo(() => (form ? CATEGORY_SUB_TAGS[form.category] || [] : []), [form]);

  const validate = (f: EditFormState) => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = '名称不能为空';
    if (!f.description.trim()) e.description = '介绍不能为空';
    if (!f.category) e.category = '必须选择分类';
    if (f.url && !/^https?:\/\//.test(f.url)) e.url = 'URL 必须以 http(s):// 开头';
    return e;
  };

  const update = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
    setForm(prev => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      setErrors(validate(next));
      return next;
    });
    setIsDirty(true);
  };

  const toggleSub = (tag: string) => {
    if (!form) return;
    const next = form.subTags.includes(tag) ? form.subTags.filter(t => t !== tag) : [...form.subTags, tag];
    update('subTags', next);
  };

  const buildSnapshot = (f: EditFormState) => ({
    id,
    name: f.name,
    description: f.description,
    category: f.category,
    url: f.url,
    logo: f.logo,
    upvotes: f.upvotes,
    favorites: f.favorites,
    order: f.order,
    pinned: f.pinned,
    visible: f.visible,
    subTags: f.subTags,
    usageTips: serializeContent(f.usageTipsCards),
    productIntro: serializeContent(f.productIntroCards),
  });

  const handleSave = () => {
    if (!form) return;
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('请修正表单错误后再保存');
      return;
    }
    const snapshot = buildSnapshot(form);
    if (id) localStorage.setItem(`tool.${id}.draft`, JSON.stringify(snapshot));
    setIsDirty(false);
    console.debug('[AdminToolEdit] save draft', snapshot);
    toast.success(`"${form.name}" 已保存为草稿`);
  };

  const handlePublish = () => {
    if (!form) return;
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('请修正表单错误后再发布');
      setPublishOpen(false);
      return;
    }
    const snapshot = buildSnapshot(form);
    const now = new Date().toISOString();
    if (id) {
      localStorage.setItem(`tool.${id}.published`, JSON.stringify(snapshot));
      localStorage.setItem(`tool.${id}.publishedAt`, now);
      localStorage.removeItem(`tool.${id}.draft`);
    }
    window.dispatchEvent(new CustomEvent('tool-published', { detail: { id } }));
    setPublishedAt(now);
    setIsDirty(false);
    setPublishOpen(false);
    console.debug('[AdminToolEdit] publish', snapshot);
    toast.success(`"${form.name}" 已发布到前台`, {
      description: '前端列表与详情页将在下次刷新时使用最新内容',
    });
  };

  // 卡片操作
  type CardField = 'usageTipsCards' | 'productIntroCards';
  const updateCard = (field: CardField, idx: number, patch: Partial<ContentSection>) => {
    if (!form) return;
    const next = form[field].map((c, i) => (i === idx ? { ...c, ...patch } : c));
    update(field, next);
  };
  const addCard = (field: CardField, kind: SectionKind) => {
    if (!form) return;
    const list = form[field];
    const itemCount = list.filter(c => c.kind === 'item').length;
    let card: ContentSection;
    if (kind === 'intro') card = { kind: 'intro', icon: '📖', title: '概述', body: '' };
    else if (kind === 'tips') card = { kind: 'tips', icon: '✨', title: '使用小贴士', body: '' };
    else card = { kind: 'item', icon: CARD_ICONS[itemCount % CARD_ICONS.length], title: '', body: '' };
    update(field, [...list, card]);
  };
  const removeCard = (field: CardField, idx: number) => {
    if (!form) return;
    update(field, form[field].filter((_, i) => i !== idx));
  };
  const moveCard = (field: CardField, idx: number, dir: -1 | 1) => {
    if (!form) return;
    const list = [...form[field]];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    update(field, list);
  };

  const handleDelete = () => {
    toast.success(`"${form?.name}" 已删除`);
    navigate('/admin/tools');
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto py-6 md:py-12 space-y-6">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto py-6 md:py-12 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">后台管理</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/tools">网站内容管理</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{form.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/tools')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{form.name}</h1>
                {isDirty ? (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                    未保存修改
                  </Badge>
                ) : publishedAt ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" />已发布
                  </Badge>
                ) : (
                  <Badge variant="outline">草稿</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                编辑该站点的所有展示内容与元数据
                {publishedAt && <span className="ml-2 text-xs text-gray-400">· 上次发布 {new Date(publishedAt).toLocaleString('zh-CN')}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {form.url && (
              <Button variant="outline" asChild>
                <a href={form.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />访问网站
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />预览
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />删除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除「{form.name}」？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作不可撤销。删除后该站点将从前端列表与搜索结果中消失。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />保存草稿
            </Button>
            <Button onClick={() => setPublishOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4 mr-2" />发布
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4" />基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-5">
                <Avatar className="h-20 w-20 rounded-xl border">
                  <AvatarImage src={form.logo} alt={form.name} className="object-cover" />
                  <AvatarFallback className="rounded-xl text-xl">{form.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Label>Logo URL</Label>
                  <Input value={form.logo} onChange={e => update('logo', e.target.value)} placeholder="/icons/.../xxx.png" />
                  <p className="text-xs text-gray-500">支持相对路径或 CDN URL，建议尺寸 120×120，大小 &lt; 1MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>网站名称<span className="text-red-500 ml-0.5">*</span></Label>
                  <Input value={form.name} onChange={e => update('name', e.target.value)} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>分类<span className="text-red-500 ml-0.5">*</span></Label>
                  <Select value={form.category} onValueChange={v => update('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>一句话介绍<span className="text-red-500 ml-0.5">*</span></Label>
                <Input value={form.description} onChange={e => update('description', e.target.value)} />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>访问 URL</Label>
                <Input value={form.url} onChange={e => update('url', e.target.value)} placeholder="https://..." />
                {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4" />展示与互动
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs text-gray-600"><ThumbsUp className="h-3 w-3" />投票</Label>
                  <Input type="number" value={form.upvotes} onChange={e => update('upvotes', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs text-gray-600"><Heart className="h-3 w-3" />收藏</Label>
                  <Input type="number" value={form.favorites} onChange={e => update('favorites', Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">排序值</Label>
                <Input type="number" value={form.order} onChange={e => update('order', Number(e.target.value))} />
                <p className="text-xs text-gray-500">值越小越靠前</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Label>前台置顶</Label>
                <Switch checked={form.pinned} onCheckedChange={v => update('pinned', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>前台可见</Label>
                <Switch checked={form.visible} onCheckedChange={v => update('visible', v)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" />二级分类与标签
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subOptions.length === 0 ? (
              <p className="text-sm text-gray-500">当前分类暂未配置二级分类</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subOptions.map(tag => {
                  const active = form.subTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSub(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent border-input'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-500">点击切换选中；只能从 {form.category} 允许的二级分类中选择</p>
          </CardContent>
        </Card>

        <ContentCardEditor
          title="使用技巧"
          field="usageTipsCards"
          cards={form.usageTipsCards}
          onUpdate={(idx, patch) => updateCard('usageTipsCards', idx, patch)}
          onAdd={(kind) => addCard('usageTipsCards', kind)}
          onRemove={(idx) => removeCard('usageTipsCards', idx)}
          onMove={(idx, dir) => moveCard('usageTipsCards', idx, dir)}
        />

        <ContentCardEditor
          title="网站介绍"
          field="productIntroCards"
          cards={form.productIntroCards}
          onUpdate={(idx, patch) => updateCard('productIntroCards', idx, patch)}
          onAdd={(kind) => addCard('productIntroCards', kind)}
          onRemove={(idx) => removeCard('productIntroCards', idx)}
          onMove={(idx, dir) => moveCard('productIntroCards', idx, dir)}
        />

        <div className="flex items-center justify-end gap-2 pb-8">
          <Button variant="outline" onClick={() => navigate('/admin/tools')}>取消</Button>
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />预览
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />保存草稿
          </Button>
          <Button onClick={() => setPublishOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Send className="h-4 w-4 mr-2" />发布上线
          </Button>
        </div>

        {/* 预览抽屉 - 模拟前端详情页效果 */}
        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />前端预览
                {isDirty && <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">含未保存修改</Badge>}
              </SheetTitle>
              <SheetDescription>
                以下为「{form.name}」在前端详情页的渲染效果。预览基于当前编辑器中的实时数据，无需保存。
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-4">
              {/* 头部 */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-xl border">
                  <AvatarImage src={form.logo} alt={form.name} className="object-cover" />
                  <AvatarFallback className="rounded-xl text-xl">{form.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold truncate">{form.name || '（未填名称）'}</h2>
                  <p className="text-sm text-gray-500 truncate">{form.description || '（未填介绍）'}</p>
                </div>
              </div>

              {/* 元数据 */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">{form.category}</Badge>
                {form.subTags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {t}
                  </span>
                ))}
                <span className="text-gray-500 ml-2">👍 {form.upvotes}</span>
                <span className="text-gray-500">❤️ {form.favorites}</span>
              </div>

              {/* 二级页面内容卡片 */}
              <Tabs defaultValue="usage">
                <TabsList>
                  <TabsTrigger value="usage">使用技巧</TabsTrigger>
                  <TabsTrigger value="intro">网站介绍</TabsTrigger>
                </TabsList>
                <TabsContent value="usage" className="mt-3">
                  <PreviewCardGrid cards={form.usageTipsCards} />
                </TabsContent>
                <TabsContent value="intro" className="mt-3">
                  <PreviewCardGrid cards={form.productIntroCards} />
                </TabsContent>
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>

        {/* 发布二次确认 */}
        <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认发布「{form.name}」到前台？</AlertDialogTitle>
              <AlertDialogDescription>
                发布后，前台用户将立即看到当前编辑的内容（包括基本信息、二级分类、使用技巧、网站介绍）。
                {publishedAt && (
                  <span className="block mt-2 text-xs text-gray-500">
                    上次发布时间：{new Date(publishedAt).toLocaleString('zh-CN')}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handlePublish} className="bg-emerald-600 hover:bg-emerald-700">
                <Send className="h-4 w-4 mr-2" />确认发布
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

// 预览用的卡片网格 - 与前端 ContentCards 视觉一致
const PreviewCardGrid: React.FC<{ cards: ContentSection[] }> = ({ cards }) => {
  if (cards.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8 border border-dashed rounded-lg">暂无内容</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 flex flex-col gap-2 border bg-white hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{card.icon}</span>
            <h4 className="font-bold text-sm break-words">{card.title}</h4>
          </div>
          <p className="text-xs leading-relaxed whitespace-pre-wrap text-gray-600 break-words">
            {card.body || <span className="text-gray-300">（空）</span>}
          </p>
        </div>
      ))}
    </div>
  );
};

interface ContentCardEditorProps {
  title: string;
  field: 'usageTipsCards' | 'productIntroCards';
  cards: ContentSection[];
  onUpdate: (idx: number, patch: Partial<ContentSection>) => void;
  onAdd: (kind: SectionKind) => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
}

const KIND_LABEL: Record<SectionKind, string> = {
  intro: '概述段',
  item: '功能卡片',
  tips: '使用小贴士',
};

const ContentCardEditor: React.FC<ContentCardEditorProps> = ({ title, cards, onUpdate, onAdd, onRemove, onMove }) => {
  const hasIntro = cards.some(c => c.kind === 'intro');
  const hasTips = cards.some(c => c.kind === 'tips');
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />二级页面内容 · {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {!hasIntro && (
            <Button size="sm" variant="outline" onClick={() => onAdd('intro')}>
              <Plus className="h-3.5 w-3.5 mr-1" />概述
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onAdd('item')}>
            <Plus className="h-3.5 w-3.5 mr-1" />功能卡片
          </Button>
          {!hasTips && (
            <Button size="sm" variant="outline" onClick={() => onAdd('tips')}>
              <Plus className="h-3.5 w-3.5 mr-1" />小贴士
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {cards.length === 0 && (
          <p className="text-sm text-gray-500 py-6 text-center border border-dashed rounded-lg">
            暂无内容卡片，点击右上角按钮添加
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-white p-3 space-y-2.5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={card.icon}
                  onChange={e => onUpdate(idx, { icon: e.target.value })}
                  className="w-14 h-9 text-center text-lg px-1"
                  maxLength={4}
                  title="表情图标"
                />
                <Input
                  value={card.title}
                  onChange={e => onUpdate(idx, { title: e.target.value })}
                  className="flex-1 h-9 font-semibold"
                  placeholder="卡片标题"
                  disabled={card.kind === 'tips'}
                />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 whitespace-nowrap">
                  {KIND_LABEL[card.kind]}
                </span>
              </div>
              <Textarea
                value={card.body}
                onChange={e => onUpdate(idx, { body: e.target.value })}
                rows={card.kind === 'item' ? 3 : 5}
                className="text-sm resize-none"
                placeholder={card.kind === 'tips' ? '每行一条建议，保存时会自动加上 • 前缀' : '卡片内容'}
              />
              <div className="flex items-center justify-end gap-1 pt-1 border-t">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMove(idx, -1)} disabled={idx === 0} title="上移">
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMove(idx, 1)} disabled={idx === cards.length - 1} title="下移">
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => onRemove(idx)} title="删除卡片">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          功能卡片对应详情页「{title}」中的编号项；保存时会按当前顺序重新编号，前端将根据序号自动分配图标。
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminToolEditPage;
