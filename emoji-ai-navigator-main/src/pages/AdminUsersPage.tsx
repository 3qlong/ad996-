
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, FilePenLine, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: '超级管理员' | '编辑' | '审核员';
  status: '正常' | '禁用';
  lastLogin: string;
  createdAt: string;
}

const initialUsers: AdminUser[] = [
  { id: '1', username: 'admin', email: 'admin@ai-nav.com', role: '超级管理员', status: '正常', lastLogin: '2026-04-11 10:30', createdAt: '2024-01-01' },
  { id: '2', username: 'editor01', email: 'editor01@ai-nav.com', role: '编辑', status: '正常', lastLogin: '2026-04-10 15:20', createdAt: '2024-03-15' },
  { id: '3', username: 'editor02', email: 'editor02@ai-nav.com', role: '编辑', status: '正常', lastLogin: '2026-04-09 09:00', createdAt: '2024-06-01' },
  { id: '4', username: 'reviewer01', email: 'reviewer@ai-nav.com', role: '审核员', status: '禁用', lastLogin: '2026-03-20 14:00', createdAt: '2025-01-10' },
];

const ROLES = ['超级管理员', '编辑', '审核员'] as const;
const STATUSES = ['正常', '禁用'] as const;

const ROLE_ICONS: Record<string, React.ElementType> = {
  '超级管理员': ShieldAlert,
  '编辑': ShieldCheck,
  '审核员': Shield,
};

const ROLE_COLORS: Record<string, string> = {
  '超级管理员': 'bg-red-100 text-red-700',
  '编辑': 'bg-blue-100 text-blue-700',
  '审核员': 'bg-green-100 text-green-700',
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // Form state
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<string>('编辑');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<string>('正常');

  const handleAddClick = () => {
    setCurrentUser(null);
    setFormUsername(''); setFormEmail(''); setFormRole('编辑'); setFormPassword(''); setFormStatus('正常');
    setIsDialogOpen(true);
  };

  const handleEditClick = (user: AdminUser) => {
    setCurrentUser(user);
    setFormUsername(user.username); setFormEmail(user.email); setFormRole(user.role); setFormPassword(''); setFormStatus(user.status);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (user: AdminUser) => {
    if (user.role === '超级管理员') {
      toast.error('无法删除超级管理员账户');
      return;
    }
    setUserToDelete(user);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast.success(`已删除用户 "${userToDelete.username}"`);
    }
    setIsAlertOpen(false);
  };

  const handleStatusToggle = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.role === '超级管理员') {
      toast.error('无法禁用超级管理员');
      return;
    }
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === '正常' ? '禁用' : '正常' } : u));
  };

  const handleSubmit = () => {
    if (currentUser) {
      setUsers(users.map(u => u.id === currentUser.id ? {
        ...u, username: formUsername, email: formEmail,
        role: formRole as AdminUser['role'], status: formStatus as AdminUser['status'],
      } : u));
      toast.success('用户信息已更新');
    } else {
      const newUser: AdminUser = {
        id: String(users.length > 0 ? Math.max(...users.map(u => Number(u.id))) + 1 : 1),
        username: formUsername, email: formEmail,
        role: formRole as AdminUser['role'], status: formStatus as AdminUser['status'],
        lastLogin: '-', createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      toast.success('新用户已添加');
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
            <BreadcrumbItem><BreadcrumbPage>管理员账户管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">管理员账户管理</h1>
            <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" />添加用户</Button>
          </div>

          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">状态</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead className="w-[120px]">角色</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => {
                  const RoleIcon = ROLE_ICONS[user.role] || Shield;
                  return (
                    <TableRow key={user.id} className={user.status === '禁用' ? 'opacity-50' : ''}>
                      <TableCell>
                        <button onClick={() => handleStatusToggle(user.id)}>
                          <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center ${user.status === '正常' ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ml-0.5 ${user.status === '正常' ? 'translate-x-4' : ''}`} />
                          </div>
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-sm text-gray-500">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${ROLE_COLORS[user.role] || ''}`} variant="secondary">
                          <RoleIcon className="h-3 w-3 mr-1" />{user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{user.lastLogin}</TableCell>
                      <TableCell className="text-sm text-gray-500">{user.createdAt}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)} title="编辑"><FilePenLine className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)} title="删除" disabled={user.role === '超级管理员'}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
            <DialogTitle>{currentUser ? '编辑用户' : '添加用户'}</DialogTitle>
            <DialogDescription>管理后台管理员账户信息。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>用户名 *</Label>
              <Input value={formUsername} onChange={e => setFormUsername(e.target.value)} placeholder="用户名" />
            </div>
            <div className="space-y-2">
              <Label>邮箱 *</Label>
              <Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>{currentUser ? '重置密码（留空不修改）' : '密码 *'}</Label>
              <Input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder={currentUser ? '留空保持不变' : '请输入密码'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>角色</Label>
                <Select value={formRole} onValueChange={setFormRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!formUsername.trim() || !formEmail.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>将永久删除用户 "{userToDelete?.username}"，此操作无法撤销。</AlertDialogDescription>
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

export default AdminUsersPage;
