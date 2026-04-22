
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
import { PlusCircle, Trash2, FilePenLine, Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: string;
  description: string;
  country: string;
  color: string;
}

const EVENT_TYPES = ['节日', '营销节点', '电商大促', '行业活动', '自定义'];
const COUNTRIES = ['中国', '美国', '欧洲', '日本', '韩国', '东南亚', '全球'];

const TYPE_COLORS: Record<string, string> = {
  '节日': '#EF4444',
  '营销节点': '#F59E0B',
  '电商大促': '#8B5CF6',
  '行业活动': '#3B82F6',
  '自定义': '#6B7280',
};

const initialEvents: CalendarEvent[] = [
  { id: 1, title: '元旦', date: '2026-01-01', type: '节日', description: '新年第一天', country: '全球', color: '#EF4444' },
  { id: 2, title: '春节', date: '2026-02-17', type: '节日', description: '中国农历新年', country: '中国', color: '#EF4444' },
  { id: 3, title: '618大促', date: '2026-06-18', type: '电商大促', description: '京东年中购物节', country: '中国', color: '#8B5CF6' },
  { id: 4, title: '双十一', date: '2026-11-11', type: '电商大促', description: '全球最大购物节', country: '中国', color: '#8B5CF6' },
  { id: 5, title: '情人节', date: '2026-02-14', type: '营销节点', description: '西方情人节营销重要节点', country: '全球', color: '#F59E0B' },
  { id: 6, title: '黑色星期五', date: '2026-11-27', type: '电商大促', description: '欧美年度最大折扣日', country: '美国', color: '#8B5CF6' },
];

const AdminCalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('全部');
  const [filterCountry, setFilterCountry] = useState('全部');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formType, setFormType] = useState('节日');
  const [formDescription, setFormDescription] = useState('');
  const [formCountry, setFormCountry] = useState('中国');
  const [formColor, setFormColor] = useState('#EF4444');

  const filteredEvents = useMemo(() => {
    let result = events;
    if (filterType !== '全部') result = result.filter(e => e.type === filterType);
    if (filterCountry !== '全部') result = result.filter(e => e.country === filterCountry);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q));
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, filterType, filterCountry, searchQuery]);

  const handleAddClick = () => {
    setCurrentEvent(null);
    setFormTitle(''); setFormDate(''); setFormType('节日'); setFormDescription(''); setFormCountry('中国'); setFormColor('#EF4444');
    setIsDialogOpen(true);
  };

  const handleEditClick = (event: CalendarEvent) => {
    setCurrentEvent(event);
    setFormTitle(event.title); setFormDate(event.date); setFormType(event.type);
    setFormDescription(event.description); setFormCountry(event.country); setFormColor(event.color);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      toast.success(`已删除 "${eventToDelete.title}"`);
    }
    setIsAlertOpen(false);
  };

  const handleSubmit = () => {
    if (currentEvent) {
      setEvents(events.map(e => e.id === currentEvent.id ? {
        ...e, title: formTitle, date: formDate, type: formType,
        description: formDescription, country: formCountry, color: formColor,
      } : e));
      toast.success('日历事件已更新');
    } else {
      const newEvent: CalendarEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        title: formTitle, date: formDate, type: formType,
        description: formDescription, country: formCountry, color: formColor,
      };
      setEvents([...events, newEvent]);
      toast.success('已添加日历事件');
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
            <BreadcrumbItem><BreadcrumbPage>出海日历管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">出海日历管理</h1>
            <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" />新增事件</Button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="搜索事件标题..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部类型</SelectItem>
                {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部国别</SelectItem>
                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm">共 {filteredEvents.length} 条</Badge>
          </div>

          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead className="w-[120px]">日期</TableHead>
                  <TableHead className="w-[100px]">类型</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="w-[80px]">国别</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
                        {event.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{event.date}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: TYPE_COLORS[event.type] || '#6B7280', color: '#fff' }} className="text-xs">
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 max-w-[250px] truncate text-sm">{event.description}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{event.country}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)} title="编辑"><FilePenLine className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(event)} title="删除"><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
            <DialogTitle>{currentEvent ? '编辑事件' : '新增事件'}</DialogTitle>
            <DialogDescription>管理出海日历中的营销节点和节日信息。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="事件名称" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>日期 *</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={formType} onValueChange={(v) => { setFormType(v); setFormColor(TYPE_COLORS[v] || '#6B7280'); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>国别</Label>
                <Select value={formCountry} onValueChange={setFormCountry}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>颜色</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                  <Input value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-28" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="事件描述" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!formTitle.trim() || !formDate}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>将永久删除事件 "{eventToDelete?.title}"。</AlertDialogDescription>
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

export default AdminCalendarPage;
