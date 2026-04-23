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
import { ExternalLink, Heart, Save, ThumbsUp, Trash2, ArrowLeft, Image as ImageIcon, Tag, FileText, Settings2, Plus, ArrowUp, ArrowDown, X } from 'lucide-react';
import { allTools } from '@/data/tools';
import { CATEGORY_SUB_TAGS } from '@/lib/categorySubTags';

interface EditFormState {
  name: string;
  description: string;
  category: string;
  url: string;
  subTags: string[];
  usageTips: string;
  productIntro: string;
  upvotes: number;
  favorites: number;
  order: number;
  pinned: boolean;
  visible: boolean;
  logo: string;
}

const categories = Object.keys(CATEGORY_SUB_TAGS);

const AdminToolEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        usageTips: (raw as any).details?.usageTips || '',
        productIntro: (raw as any).details?.productIntro || '',
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
  };

  const toggleSub = (tag: string) => {
    if (!form) return;
    const next = form.subTags.includes(tag) ? form.subTags.filter(t => t !== tag) : [...form.subTags, tag];
    update('subTags', next);
  };

  const handleSave = () => {
    if (!form) return;
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('请修正表单错误后再保存');
      return;
    }
    toast.success(`"${form.name}" 已保存`);
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
              <h1 className="text-2xl md:text-3xl font-bold">{form.name}</h1>
              <p className="text-sm text-gray-500 mt-1">编辑该站点的所有展示内容与元数据</p>
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
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />保存
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />二级页面内容
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>使用技巧</Label>
              <Textarea value={form.usageTips} onChange={e => update('usageTips', e.target.value)} rows={8} className="font-mono text-sm" placeholder="支持换行的纯文本，前端会按段落渲染" />
              <p className="text-xs text-gray-500">对应站点详情页「使用技巧」板块</p>
            </div>
            <div className="space-y-1.5">
              <Label>网站介绍</Label>
              <Textarea value={form.productIntro} onChange={e => update('productIntro', e.target.value)} rows={10} className="font-mono text-sm" placeholder="完整的产品介绍内容" />
              <p className="text-xs text-gray-500">对应站点详情页「网站介绍」板块</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pb-8">
          <Button variant="outline" onClick={() => navigate('/admin/tools')}>取消</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />保存修改
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminToolEditPage;
