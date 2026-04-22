
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Eye, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { allTools } from '@/data/tools';

interface ToolStats {
  id: number;
  name: string;
  logo: string;
  emoji: string;
  category: string;
  clicksToday: number;
  clicks7d: number;
  clicks30d: number;
  trend: 'up' | 'down' | 'stable';
}

// Generate mock click stats from allTools
const generateStats = (): ToolStats[] => {
  return allTools.slice(0, 200).map(tool => {
    const clicksToday = Math.floor(Math.random() * 500) + 10;
    const clicks7d = clicksToday * 7 + Math.floor(Math.random() * 1000);
    const clicks30d = clicks7d * 4 + Math.floor(Math.random() * 5000);
    const trend = clicksToday > clicks7d / 7 ? 'up' : clicksToday < clicks7d / 7 * 0.8 ? 'down' : 'stable';
    return {
      id: tool.id,
      name: tool.name,
      logo: tool.logo,
      emoji: tool.emoji,
      category: tool.category,
      clicksToday,
      clicks7d,
      clicks30d,
      trend,
    };
  });
};

const allCategories = [...new Set(allTools.map(t => t.category))].sort();

const AdminStatisticsPage = () => {
  const [stats] = useState<ToolStats[]>(() => generateStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<'clicksToday' | 'clicks7d' | 'clicks30d'>('clicksToday');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  const filteredStats = useMemo(() => {
    let result = stats;
    if (filterCategory !== '全部') result = result.filter(s => s.category === filterCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [stats, filterCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredStats.length / pageSize);
  const paginatedStats = filteredStats.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalToday = stats.reduce((sum, s) => sum + s.clicksToday, 0);
  const total7d = stats.reduce((sum, s) => sum + s.clicks7d, 0);
  const total30d = stats.reduce((sum, s) => sum + s.clicks30d, 0);

  const formatNumber = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}万` : n.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto py-6 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">后台管理</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>点击统计</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold">热门AI工具点击统计</h1>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">今日总点击</CardTitle>
                <Eye className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalToday)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">近7天总点击</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(total7d)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">近30天总点击</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(total30d)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
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
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="clicksToday">按今日排序</SelectItem>
                <SelectItem value="clicks7d">按7天排序</SelectItem>
                <SelectItem value="clicks30d">按30天排序</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm">共 {filteredStats.length} 个工具</Badge>
          </div>

          {/* Table */}
          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">排名</TableHead>
                  <TableHead className="w-[50px]">图标</TableHead>
                  <TableHead>工具名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead className="text-right">今日点击</TableHead>
                  <TableHead className="text-right">7天点击</TableHead>
                  <TableHead className="text-right">30天点击</TableHead>
                  <TableHead className="w-[60px] text-center">趋势</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStats.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-center">
                      {(currentPage - 1) * pageSize + index + 1 <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                          (currentPage - 1) * pageSize + index + 1 === 1 ? 'bg-yellow-500' :
                          (currentPage - 1) * pageSize + index + 1 === 2 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>
                          {(currentPage - 1) * pageSize + index + 1}
                        </span>
                      ) : (
                        <span className="text-gray-400">{(currentPage - 1) * pageSize + index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8 rounded-md">
                        <AvatarImage src={item.logo} alt={item.name} className="object-cover" />
                        <AvatarFallback className="rounded-md text-xs">{item.emoji || item.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate">{item.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{item.category}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{item.clicksToday.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-gray-600">{item.clicks7d.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-gray-600">{item.clicks30d.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      {item.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500 mx-auto" />}
                      {item.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500 mx-auto" />}
                      {item.trend === 'stable' && <span className="text-gray-400 text-xs">—</span>}
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
    </div>
  );
};

export default AdminStatisticsPage;
